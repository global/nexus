#!/usr/bin/env node

/**
 * O5-vs-O1 agentic equivalence evaluation
 *
 * For each of the fourteen competency questions (CQ-1..CQ-14), an agent
 * equipped with the same MCP tool surface the REST API's controllers use
 * (src/modules/mcp) is given the question as a natural-language prompt,
 * explores the portfolio via real tool calls against the live MongoDB data,
 * and submits its final answer via a harness-only `submit_answer` tool. That
 * structured answer is compared against the ground truth produced by
 * running the equivalent SPARQL query (apm-competency-queries.sparql) over
 * apm-ontology.ttl + apm-instances-sample.ttl.
 *
 * This keeps the comparison structured-to-structured, not prose-to-prose:
 * `submit_answer`'s arguments (not the agent's free-text commentary) are
 * what get compared to the SPARQL result. Results are reported per-trial and
 * as an overall agreement rate; run `npm run validate:competency-queries`
 * separately if only the SPARQL side (not the agent) needs checking.
 *
 * Two model providers are supported, so the same 14 trials can be run
 * against Claude and against an open-source model for comparison:
 *   - `anthropic`        — Claude, via the Messages API (@anthropic-ai/sdk).
 *   - `openai-compatible` — any locally- or self-hosted open-source model
 *     served behind an OpenAI-compatible `/chat/completions` endpoint with
 *     function calling, e.g. Ollama, vLLM, or LM Studio. No SDK dependency —
 *     just `fetch`, since the wire format is a plain JSON POST.
 *
 * Requires:
 *   - MongoDB running and seeded to match apm-instances-sample.ttl
 *     (`npm run mongo`, `npm run env:dev`, `npm run seed:sample-data`).
 *   - For the `anthropic` provider: ANTHROPIC_API_KEY set (in .env.dev or
 *     the shell environment).
 *   - For the `openai-compatible` provider: an OpenAI-compatible server
 *     already running with a model loaded, and OSS_EVAL_MODEL set to that
 *     model's name (e.g. "llama3.1", "qwen2.5:14b"). OSS_EVAL_BASE_URL
 *     defaults to Ollama's local endpoint, http://localhost:11434/v1.
 *
 * Usage:
 *   node ontology/evaluate-agentic-equivalence.js
 *   node ontology/evaluate-agentic-equivalence.js --only=CQ-1,CQ-14
 *   node ontology/evaluate-agentic-equivalence.js --providers=anthropic,openai-compatible
 *   OSS_EVAL_MODEL=llama3.1 node ontology/evaluate-agentic-equivalence.js --providers=openai-compatible
 *
 */

const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const Anthropic = require('@anthropic-ai/sdk');
const { QueryEngine } = require('@comunica/query-sparql');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { InMemoryTransport } = require('@modelcontextprotocol/sdk/inMemory.js');

const connectDB = require('../src/db');
const { createMcpServer } = require('../src/modules/mcp/server');

const ONTOLOGY_DIR = __dirname;
const SPARQL_FILE = path.join(ONTOLOGY_DIR, 'apm-competency-queries.sparql');
const RESULTS_FILE = path.join(ONTOLOGY_DIR, '.agentic-equivalence-results.json');
const APM_NS = 'http://nexus-apm.org/ontology/apm#';
const MAX_TURNS = 8;

const ONLY = (() => {
  const arg = process.argv.find((a) => a.startsWith('--only='));
  return arg ? new Set(arg.slice('--only='.length).split(',').map((s) => s.trim())) : null;
})();

/** Which model providers to run the 14 trials against, in order. CLI flag wins over the env var; defaults to Claude alone, so existing invocations are unaffected. */
const PROVIDER_NAMES = (() => {
  const arg = process.argv.find((a) => a.startsWith('--providers='));
  const raw = arg ? arg.slice('--providers='.length) : (process.env.EVAL_PROVIDERS || 'anthropic');
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
})();

const SYSTEM_PROMPT = `You are answering one question about the Nexus Insight application
portfolio using the tools provided. The tools mirror a live system's applications, business
capabilities, dependencies, controls, findings, costs, contacts, and related records — call
list_*/get_* tools as many times as needed, including following up on a referenced id with
another tool call, to fully answer the question. Do not guess or fabricate a result; if a tool
call returns nothing relevant, adjust your query.

When you have gathered enough information to answer definitively, call \`submit_answer\` exactly
once and stop:
- If the answer is a set of named things (applications, capabilities, actors, repositories,
  etc.), populate \`entities\` with their exact names as returned by the tools.
- If the answer is one or more computed figures, email addresses, or a classification value per
  item, populate \`facts\` with clear label/value pairs instead (e.g. {"label": "Support 2025",
  "value": "298000.00"}).`;

/** Loads a Turtle source file as a serialized RDF source. */
function loadSource(fileName) {
  return {
    type: 'serialized',
    value: fs.readFileSync(path.join(ONTOLOGY_DIR, fileName), 'utf8'),
    mediaType: 'text/turtle',
    baseIRI: APM_NS,
  };
}

/** Shortens a full apm: URI to `apm:LocalName`; leaves plain literals (labels, dates) untouched. */
function shortenTerm(value) {
  return typeof value === 'string' && value.startsWith(APM_NS) ? `apm:${value.slice(APM_NS.length)}` : value;
}

/** Splits apm-competency-queries.sparql into one or more runnable SELECT queries per CQ-N marker. */
function extractQueriesByCQ() {
  const fileText = fs.readFileSync(SPARQL_FILE, 'utf8');
  const prefixBlock = fileText.match(/^(PREFIX .+\n)+/m)[0];
  const markers = [...fileText.matchAll(/^# (CQ-\d+):/gm)];
  const queriesByCQ = new Map();

  markers.forEach((marker, i) => {
    const id = marker[1];
    const start = marker.index;
    const end = i + 1 < markers.length ? markers[i + 1].index : fileText.length;
    const sectionText = fileText.slice(start, end);
    const queries = sectionText
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.startsWith('SELECT'))
      .map((query) => `${prefixBlock}\n${query}`);
    queriesByCQ.set(id, queries);
  });

  return queriesByCQ;
}

/** Runs one SPARQL SELECT and returns its rows as plain objects with apm: URIs shortened. */
async function runQuery(engine, sources, query) {
  const bindingsStream = await engine.queryBindings(query, { sources });
  const bindings = await bindingsStream.toArray();
  return bindings.map((binding) => {
    const row = {};
    for (const [variable, term] of binding) row[variable.value] = shortenTerm(term.value);
    return row;
  });
}

// ---- Per-CQ prompt + ground truth extraction ----
//
// `mode` selects how `submit_answer`'s payload is compared to the ground truth:
//   'entities' — a plain set of names, compared as a normalised set (order-independent).
//   'facts'    — label/value pairs where BOTH the label and the value must match
//                (e.g. contact name -> email).
//   'values'   — label/value pairs where only the VALUE is graded (the label is kept for
//                the printed report only) — used for computed figures (currency totals,
//                percentages) where the agent's own label wording shouldn't be graded.
const COMPETENCY_QUESTIONS = [
  {
    id: 'CQ-1',
    prompt: 'If the Build Farm Server experienced an outage, which business capabilities would be affected?',
    groundTruth: ([rows]) => ({ mode: 'entities', values: [...new Set(rows.map((r) => r.capabilityLabel))] }),
  },
  {
    id: 'CQ-2',
    prompt: 'Which applications, directly or transitively (up to two hops), depend on the SecureAuth IAM application?',
    groundTruth: ([, transitive]) => ({ mode: 'entities', values: [...new Set(transitive.map((r) => r.impactedAppLabel))] }),
  },
  {
    id: 'CQ-3',
    prompt: 'For the Customer Portal (Web) application, which code repositories or reference documents should be reviewed following a security incident?',
    groundTruth: ([rows]) => ({ mode: 'entities', values: [...new Set(rows.map((r) => r.resourceLabel))] }),
  },
  {
    id: 'CQ-4',
    prompt: 'Which applications require a compliance standard that the supplier hosting them is not certified against?',
    groundTruth: ([rows]) => ({ mode: 'entities', values: [...new Set(rows.map((r) => r.appLabel))] }),
  },
  {
    id: 'CQ-5',
    prompt: 'Which externally hosted applications have a Critical or High criticality tier and at least one compliance obligation — the applications carrying the greatest vendor-concentration risk?',
    groundTruth: ([rows]) => ({ mode: 'entities', values: [...new Set(rows.map((r) => r.appLabel))] }),
  },
  {
    id: 'CQ-6',
    prompt: 'What is the total cost of ownership of the BuildForge CI/CD Platform application, broken down by cost category and fiscal year?',
    groundTruth: ([rows]) => ({
      mode: 'values',
      values: rows.map((r) => ({ label: `${r.categoryLabel} ${r.fiscalYear}`, value: r.totalAmount })),
    }),
  },
  {
    id: 'CQ-7',
    prompt: 'As of 2026-07-19, which applications or technology components have an open finding that is past its remediation due date?',
    groundTruth: ([rows]) => ({ mode: 'entities', values: [...new Set(rows.map((r) => r.subjectLabel))] }),
  },
  {
    id: 'CQ-8',
    prompt: "What is each application's current portfolio rationalisation classification — Tolerate, Invest, Migrate, or Eliminate?",
    groundTruth: ([rows]) => {
      const byApp = new Map();
      for (const r of rows) byApp.set(r.appLabel, r.strategyLabel);
      return { mode: 'facts', values: [...byApp].map(([label, value]) => ({ label, value })) };
    },
  },
  {
    id: 'CQ-9',
    prompt: 'Which applications implement a control that supports a formal compliance standard (such as ISO/IEC 27001 or SOC 2)?',
    groundTruth: ([implemented]) => ({ mode: 'entities', values: [...new Set(implemented.map((r) => r.appLabel))] }),
  },
  {
    id: 'CQ-10',
    prompt: 'As of 2026-07-19, which software products are past their end-of-support date?',
    groundTruth: ([rows]) => ({ mode: 'entities', values: [...new Set(rows.map((r) => r.productLabel))] }),
  },
  {
    id: 'CQ-11',
    prompt: 'Which applications are classified at the Critical criticality tier?',
    groundTruth: ([rows]) => ({ mode: 'entities', values: [...new Set(rows.map((r) => r.appLabel))] }),
  },
  {
    id: 'CQ-12',
    prompt: 'For the PeopleHub HRIS software product, how does its actual measured resource utilisation compare to its licensed entitlement?',
    groundTruth: ([rows]) => {
      const r = rows[0];
      return {
        mode: 'values',
        values: [
          { label: 'Entitled quantity', value: r.entitledQuantity },
          { label: 'Measured value', value: r.measuredValue },
          { label: 'Utilisation percent', value: r.utilisationPercent },
        ],
      };
    },
  },
  {
    id: 'CQ-13',
    prompt: 'The SecureAuth IAM finding about lacking active-active failover directly threatens the Identity & Access Management business capability. Which business capabilities does that impact roll up into, through the capability hierarchy (including Identity & Access Management itself)?',
    groundTruth: ([rows]) => ({ mode: 'entities', values: [...new Set(rows.map((r) => r.ancestorLabel))] }),
  },
  {
    id: 'CQ-14',
    prompt: 'Who are the accountable contacts for the SecureAuth IAM application, and what are their email addresses?',
    groundTruth: ([rows]) => ({ mode: 'facts', values: rows.map((r) => ({ label: r.actorLabel, value: r.email })) }),
  },
];

// ---- Comparison ----

/** Lower-cases, trims, and collapses punctuation/whitespace so minor formatting differences don't break equality. */
function normalize(str) {
  return String(str).toLowerCase().trim().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Every standalone number embedded in a string, e.g. "68% (160 of 500 unused)" -> [68, 160, 500]. */
function extractNumbers(str) {
  const matches = String(str).match(/-?\d+(\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}

/**
 * Numeric-aware equality: if `expected` parses as a number, accept a match
 * against ANY number embedded in `actual` (not just the whole string) — an
 * agent restating a figure inside a fuller sentence, e.g. "68% utilization,
 * 32% surplus", should not be penalised for not isolating the number onto
 * its own line. Falls back to normalized string equality for non-numeric
 * values.
 */
function valuesEqual(expected, actual) {
  const ef = parseFloat(String(expected).replace(/[^0-9.\-]/g, ''));
  if (Number.isFinite(ef)) {
    return extractNumbers(actual).some((af) => Math.abs(ef - af) <= Math.max(0.5, Math.abs(ef) * 0.01));
  }
  return normalize(expected) === normalize(actual);
}

function entitiesMatch(expected, actual) {
  const e = new Set(expected.map(normalize));
  const a = new Set((actual || []).map(normalize));
  if (e.size !== a.size) return false;
  for (const v of e) if (!a.has(v)) return false;
  return true;
}

/** Substring-tolerant label equality: an agent elaborating "George Orwell" into "George Orwell (CISO) email" shouldn't fail the match on label wording alone. */
function labelsMatch(expected, actual) {
  const e = normalize(expected);
  const a = normalize(actual);
  return e === a || a.includes(e) || e.includes(a);
}

/** Both label and value must match, one-to-one (order-independent). */
function factsMatch(expected, actual) {
  const remaining = [...(actual || [])];
  for (const exp of expected) {
    const idx = remaining.findIndex((a) => labelsMatch(exp.label, a.label) && valuesEqual(exp.value, a.value));
    if (idx === -1) return false;
    remaining.splice(idx, 1);
  }
  return true;
}

/** Only the value must match (the agent's own label wording isn't graded) — used for computed figures. */
function valuesOnlyMatch(expected, actual) {
  const remaining = [...(actual || [])];
  for (const exp of expected) {
    const idx = remaining.findIndex((a) => valuesEqual(exp.value, a.value));
    if (idx === -1) return false;
    remaining.splice(idx, 1);
  }
  return true;
}

function outcomeMatches(groundTruth, submitted) {
  if (!submitted) return false;
  if (groundTruth.mode === 'entities') return entitiesMatch(groundTruth.values, submitted.entities || []);
  if (groundTruth.mode === 'facts') return factsMatch(groundTruth.values, submitted.facts || []);
  return valuesOnlyMatch(groundTruth.values, submitted.facts || []);
}

/**
 * Wilson score 95% confidence interval for a binomial proportion 
 * well-behaved at small n and near 0%/100%
 */
function wilsonScoreInterval(successes, n, z = 1.96) {
  if (n === 0) return { lower: 0, upper: 1 };
  const phat = successes / n;
  const z2 = z * z;
  const denominator = 1 + z2 / n;
  const centre = phat + z2 / (2 * n);
  const margin = z * Math.sqrt((phat * (1 - phat) + z2 / (4 * n)) / n);
  return { lower: Math.max(0, (centre - margin) / denominator), upper: Math.min(1, (centre + margin) / denominator) };
}


// ---- Agentic equivalence evaluation ----
const SUBMIT_ANSWER_TOOL = {
  name: 'submit_answer',
  description: 'Submit your final structured answer to the question and stop. Call this exactly once, only once you have a complete answer.',
  input_schema: {
    type: 'object',
    properties: {
      entities: { type: 'array', items: { type: 'string' }, description: 'Exact names of the entities that answer the question, if the answer is a set of named things.' },
      facts: {
        type: 'array',
        items: {
          type: 'object',
          properties: { label: { type: 'string' }, value: { type: 'string' } },
          required: ['label', 'value'],
        },
        description: 'Label/value pairs, if the answer is one or more computed figures, email addresses, or a per-item classification.',
      },
    },
  },
};


// Builds the provider-agnostic tool list for the agent: every tool the MCP
// server exposes, plus the harness-only `submit_answer` tool. Each provider
// below translates this common {name, description, inputSchema} shape into
// its own wire format (Anthropic's `input_schema`, OpenAI's `parameters`).
async function buildCommonToolList(mcpClient) {
  const { tools } = await mcpClient.listTools();
  const mcpTools = tools.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema }));
  return [...mcpTools, { name: SUBMIT_ANSWER_TOOL.name, description: SUBMIT_ANSWER_TOOL.description, inputSchema: SUBMIT_ANSWER_TOOL.input_schema }];
}

// ---------------------------------------------------------------------------
// Model providers
// ---------------------------------------------------------------------------
// A provider normalizes one agent turn so `runAgentTrial()` below never
// touches a provider's wire format directly. Each provider owns its own
// message-history shape inside `state` (Anthropic content blocks vs. OpenAI
// role/content/tool_calls messages) and exposes three methods:
//   buildTools(commonTools)              -> provider-native tool list
//   createState(systemPrompt, prompt)    -> initial provider-native history
//   nextTurn(state, tools)               -> { toolCalls: [{id,name,input}], stopReason }
//     stopReason is set only when the model stopped WITHOUT any tool calls;
//     otherwise it's null and toolCalls is non-empty. Mutates state to
//     append the assistant's turn.
//   appendToolResults(state, toolCalls, resultTexts) -> mutates state

/** Claude via the Messages API. */
function createAnthropicProvider({ apiKey, model }) {
  const anthropic = new Anthropic({ apiKey });
  return {
    label: `anthropic:${model}`,
    model,
    buildTools: (commonTools) => commonTools.map((t) => ({ name: t.name, description: t.description, input_schema: t.inputSchema })),
    createState: (systemPrompt, prompt) => ({ system: systemPrompt, messages: [{ role: 'user', content: prompt }] }),
    async nextTurn(state, tools) {
      const response = await anthropic.messages.create({ model, max_tokens: 2048, system: state.system, tools, messages: state.messages });
      state.messages.push({ role: 'assistant', content: response.content });

      const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');
      if (toolUseBlocks.length === 0) {
        return { toolCalls: [], stopReason: `stopped without submitting (${response.stop_reason})` };
      }
      return { toolCalls: toolUseBlocks.map((b) => ({ id: b.id, name: b.name, input: b.input })), stopReason: null };
    },
    appendToolResults(state, toolCalls, resultTexts) {
      state.messages.push({
        role: 'user',
        content: toolCalls.map((tc, i) => ({ type: 'tool_result', tool_use_id: tc.id, content: resultTexts[i] })),
      });
    },
  };
}

/**
 * Any open-source (or other third-party) model served behind an
 * OpenAI-compatible `/chat/completions` endpoint with function calling —
 * Ollama, vLLM, and LM Studio all speak this dialect, so no per-runtime SDK
 * is needed, just `fetch`.
 */
function createOpenAICompatibleProvider({ baseUrl, apiKey, model }) {
  /** Tool-call arguments arrive as a JSON string; a local model occasionally emits malformed JSON, so fall back to {} rather than crash the trial — outcomeMatches() will simply score it as no match. */
  const parseArguments = (raw) => {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  };

  return {
    label: `openai-compatible:${model}`,
    model,
    buildTools: (commonTools) => commonTools.map((t) => ({ type: 'function', function: { name: t.name, description: t.description, parameters: t.inputSchema } })),
    createState: (systemPrompt, prompt) => ({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    }),
    async nextTurn(state, tools) {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: state.messages, tools, tool_choice: 'auto', max_tokens: 2048 }),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`${baseUrl}/chat/completions responded ${response.status}: ${text.slice(0, 300)}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const message = choice?.message || { role: 'assistant', content: '' };
      state.messages.push(message);

      const rawToolCalls = message.tool_calls || [];
      if (rawToolCalls.length === 0) {
        return { toolCalls: [], stopReason: `stopped without submitting (${choice?.finish_reason})` };
      }
      const toolCalls = rawToolCalls.map((tc) => ({ id: tc.id, name: tc.function.name, input: parseArguments(tc.function.arguments) }));
      return { toolCalls, stopReason: null };
    },
    appendToolResults(state, toolCalls, resultTexts) {
      toolCalls.forEach((tc, i) => state.messages.push({ role: 'tool', tool_call_id: tc.id, content: resultTexts[i] }));
    },
  };
}

/** Resolves a provider name (from --providers=/EVAL_PROVIDERS) to a configured provider, validating the env vars it needs. */
function createProvider(name) {
  if (name === 'anthropic') {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set — add it to .env.dev or the environment.');
    return createAnthropicProvider({ apiKey: process.env.ANTHROPIC_API_KEY, model: process.env.ANTHROPIC_EVAL_MODEL || 'claude-sonnet-5' });
  }
  if (name === 'openai-compatible') {
    const model = process.env.OSS_EVAL_MODEL;
    if (!model) throw new Error('OSS_EVAL_MODEL is not set — point it at a model your OpenAI-compatible server has loaded (e.g. "llama3.1", "qwen2.5:14b").');
    return createOpenAICompatibleProvider({
      baseUrl: process.env.OSS_EVAL_BASE_URL || 'http://localhost:11434/v1',
      apiKey: process.env.OSS_EVAL_API_KEY || 'ollama',
      model,
    });
  }
  throw new Error(`Unknown provider "${name}" — expected "anthropic" or "openai-compatible".`);
}

/**
 * Runs one prompt through a provider-agnostic tool-use loop, executing
 * every non-`submit_answer` tool call against the real MCP server, until
 * the agent calls `submit_answer` or `MAX_TURNS` is reached.
 *
 * @param {ReturnType<typeof createAnthropicProvider>} provider
 * @param {Client} mcpClient
 * @param {object[]} tools - already in the provider's own wire format (provider.buildTools(commonTools))
 * @param {string} prompt
 * @returns {Promise<{submitted: object|null, toolCalls: {name:string,input:object}[], stopReason: string}>}
 */
async function runAgentTrial(provider, mcpClient, tools, prompt) {
  const state = provider.createState(SYSTEM_PROMPT, prompt);
  const toolCalls = [];

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const { toolCalls: turnCalls, stopReason } = await provider.nextTurn(state, tools);
    if (turnCalls.length === 0) return { submitted: null, toolCalls, stopReason };

    const submitCall = turnCalls.find((c) => c.name === 'submit_answer');
    if (submitCall) {
      toolCalls.push(submitCall);
      return { submitted: submitCall.input, toolCalls, stopReason: 'submitted' };
    }

    const resultTexts = [];
    for (const call of turnCalls) {
      toolCalls.push(call);
      let resultText;
      try {
        const result = await mcpClient.callTool({ name: call.name, arguments: call.input });
        resultText = (result.content || []).map((c) => c.text ?? '').join('\n');
      } catch (err) {
        resultText = `Error calling ${call.name}: ${err.message}`;
      }
      resultTexts.push(resultText);
    }
    provider.appendToolResults(state, turnCalls, resultTexts);
  }

  return { submitted: null, toolCalls, stopReason: 'max turns exceeded' };
}

async function main() {
  let providers;
  try {
    providers = PROVIDER_NAMES.map(createProvider);
  } catch (err) {
    console.error(`[error] ${err.message}`);
    process.exitCode = 1;
    return;
  }

  await connectDB();
  if (mongoose.connection.readyState !== 1) {
    console.error('[error] Could not connect to MongoDB — is `npm run mongo` (and the seed data) in place?');
    process.exitCode = 1;
    return;
  }

  const mcpServer = createMcpServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const mcpClient = new Client({ name: 'evaluate-agentic-equivalence', version: '1.0.0' });
  await Promise.all([mcpServer.connect(serverTransport), mcpClient.connect(clientTransport)]);

  const commonTools = await buildCommonToolList(mcpClient);

  const engine = new QueryEngine();
  const sources = [loadSource('apm-ontology.ttl'), loadSource('apm-instances-sample.ttl')];
  const queriesByCQ = extractQueriesByCQ();

  const trials = COMPETENCY_QUESTIONS.filter((cq) => !ONLY || ONLY.has(cq.id));
  let hardError = false;

  // Ground truth comes from the ontology, not the model under test, so it's
  // computed once and shared across every provider below rather than
  // re-running the same SPARQL queries once per provider.
  const groundTruthByCQ = new Map();
  for (const cq of trials) {
    const queries = queriesByCQ.get(cq.id);
    if (!queries) {
      console.error(`[error] ${cq.id} — no matching query found in apm-competency-queries.sparql`);
      hardError = true;
      continue;
    }
    try {
      const rowsPerQuery = [];
      for (const query of queries) rowsPerQuery.push(await runQuery(engine, sources, query));
      groundTruthByCQ.set(cq.id, cq.groundTruth(rowsPerQuery));
    } catch (err) {
      hardError = true;
      console.error(`[error] ${cq.id} — ${err.message}`);
    }
  }

  const runs = [];

  for (const provider of providers) {
    console.log(`\n${'#'.repeat(60)}\n# ${provider.label}\n${'#'.repeat(60)}`);
    const tools = provider.buildTools(commonTools);
    const results = [];

    for (const cq of trials) {
      if (!groundTruthByCQ.has(cq.id)) continue;
      const groundTruth = groundTruthByCQ.get(cq.id);

      try {
        const { submitted, toolCalls, stopReason } = await runAgentTrial(provider, mcpClient, tools, cq.prompt);
        const matched = outcomeMatches(groundTruth, submitted);

        results.push({ id: cq.id, prompt: cq.prompt, groundTruth, submitted, toolCalls, stopReason, matched });

        console.log(`\n${matched ? '[match]   ' : '[no match]'} ${cq.id} — ${cq.prompt}`);
        console.log(`          tool calls: ${toolCalls.map((t) => t.name).join(', ') || '(none)'}`);
        console.log(`          expected:   ${JSON.stringify(groundTruth.values)}`);
        console.log(`          submitted:  ${JSON.stringify(submitted)}`);
        if (!submitted) console.log(`          (${stopReason})`);
      } catch (err) {
        hardError = true;
        console.error(`[error] ${provider.label} ${cq.id} — ${err.message}`);
      }
    }

    const n = results.length;
    const successes = results.filter((r) => r.matched).length;
    const wilson = wilsonScoreInterval(successes, n);
    runs.push({ label: provider.label, model: provider.model, successes, n, wilson, results });
  }

  await mcpClient.close();
  await mcpServer.close();
  await mongoose.disconnect();

  console.log(`\n${'='.repeat(60)}`);
  console.log('Agreement by provider:');
  for (const run of runs) {
    const pct = run.n ? ((run.successes / run.n) * 100).toFixed(1) : '0.0';
    console.log(`  ${run.label.padEnd(28)} ${run.successes}/${run.n} (${pct}%)  Wilson 95% CI: [${(run.wilson.lower * 100).toFixed(1)}%, ${(run.wilson.upper * 100).toFixed(1)}%]`);
  }

  fs.writeFileSync(RESULTS_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), providers: runs }, null, 2));
  console.log(`\nFull trial transcripts written to ${path.relative(process.cwd(), RESULTS_FILE)}`);

  process.exitCode = hardError ? 1 : 0;
}

main().catch((err) => {
  console.error('Unexpected error while running the agentic equivalence evaluation:', err);
  process.exitCode = 1;
});
