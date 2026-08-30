#!/usr/bin/env node

/**
 * O5-vs-O1 agentic equivalence evaluation
 * 
 * For each of the fourteen competency questions (CQ-1..CQ-14), a
 * Claude-driven agent equipped with the same MCP tool surface the REST API's
 * controllers use (src/modules/mcp) is given the question as a
 * natural-language prompt, explores the portfolio via real tool calls
 * against the live MongoDB data, and submits its final answer via a
 * harness-only `submit_answer` tool. That structured answer is compared
 * against the ground truth produced by running the equivalent SPARQL query
 * (apm-competency-queries.sparql) over apm-ontology.ttl +
 * apm-instances-sample.ttl.
 *
 * This keeps the comparison structured-to-structured, not prose-to-prose:
 * `submit_answer`'s arguments (not the agent's free-text commentary) are
 * what get compared to the SPARQL result. Results are reported per-trial and
 * as an overall agreement rate; run `npm run validate:competency-queries`
 * separately if only the SPARQL side (not the agent) needs checking.
 *
 * Requires:
 *   - MongoDB running and seeded to match apm-instances-sample.ttl
 *     (`npm run mongo`, `npm run env:dev`, `npm run seed:sample-data`).
 *   - ANTHROPIC_API_KEY set (in .env.dev or the shell environment).
 *
 * Usage:
 *   node ontology/evaluate-agentic-equivalence.js
 *   node ontology/evaluate-agentic-equivalence.js --only=CQ-1,CQ-14
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
const MODEL = process.env.ANTHROPIC_EVAL_MODEL || 'claude-sonnet-5';
const MAX_TURNS = 8;

const ONLY = (() => {
  const arg = process.argv.find((a) => a.startsWith('--only='));
  return arg ? new Set(arg.slice('--only='.length).split(',').map((s) => s.trim())) : null;
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


// Builds the tool list for the agent, including all tools from the MCP server plus the 
// harness-only `submit_answer` tool.
async function buildToolList(mcpClient) {
  const { tools } = await mcpClient.listTools();
  const mcpTools = tools.map((t) => ({ name: t.name, description: t.description, input_schema: t.inputSchema }));
  return [...mcpTools, SUBMIT_ANSWER_TOOL];
}

/**
 * Runs one prompt through a Claude tool-use loop, executing every non-
 * `submit_answer` tool call against the real MCP server, until the agent
 * calls `submit_answer` or `MAX_TURNS` is reached.
 *
 * @param {Anthropic} anthropic
 * @param {Client} mcpClient
 * @param {object[]} tools
 * @param {string} prompt
 * @returns {Promise<{submitted: object|null, toolCalls: {name:string,input:object}[], stopReason: string}>}
 */
async function runAgentTrial(anthropic, mcpClient, tools, prompt) {
  const messages = [{ role: 'user', content: prompt }];
  const toolCalls = [];

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });
    messages.push({ role: 'assistant', content: response.content });

    const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');
    if (toolUseBlocks.length === 0) {
      return { submitted: null, toolCalls, stopReason: `stopped without submitting (${response.stop_reason})` };
    }

    const submitBlock = toolUseBlocks.find((b) => b.name === 'submit_answer');
    if (submitBlock) {
      toolCalls.push({ name: submitBlock.name, input: submitBlock.input });
      return { submitted: submitBlock.input, toolCalls, stopReason: 'submitted' };
    }

    const toolResults = [];
    for (const block of toolUseBlocks) {
      toolCalls.push({ name: block.name, input: block.input });
      let resultText;
      try {
        const result = await mcpClient.callTool({ name: block.name, arguments: block.input });
        resultText = (result.content || []).map((c) => c.text ?? '').join('\n');
      } catch (err) {
        resultText = `Error calling ${block.name}: ${err.message}`;
      }
      toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: resultText });
    }
    messages.push({ role: 'user', content: toolResults });
  }

  return { submitted: null, toolCalls, stopReason: 'max turns exceeded' };
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[error] ANTHROPIC_API_KEY is not set — add it to .env.dev or the environment.');
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

  const tools = await buildToolList(mcpClient);
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const engine = new QueryEngine();
  const sources = [loadSource('apm-ontology.ttl'), loadSource('apm-instances-sample.ttl')];
  const queriesByCQ = extractQueriesByCQ();

  const trials = COMPETENCY_QUESTIONS.filter((cq) => !ONLY || ONLY.has(cq.id));
  const results = [];
  let hardError = false;

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
      const groundTruth = cq.groundTruth(rowsPerQuery);

      const { submitted, toolCalls, stopReason } = await runAgentTrial(anthropic, mcpClient, tools, cq.prompt);
      const matched = outcomeMatches(groundTruth, submitted);

      results.push({ id: cq.id, prompt: cq.prompt, groundTruth, submitted, toolCalls, stopReason, matched });

      console.log(`\n${matched ? '[match]   ' : '[no match]'} ${cq.id} — ${cq.prompt}`);
      console.log(`          tool calls: ${toolCalls.map((t) => t.name).join(', ') || '(none)'}`);
      console.log(`          expected:   ${JSON.stringify(groundTruth.values)}`);
      console.log(`          submitted:  ${JSON.stringify(submitted)}`);
      if (!submitted) console.log(`          (${stopReason})`);
    } catch (err) {
      hardError = true;
      console.error(`[error] ${cq.id} — ${err.message}`);
    }
  }

  await mcpClient.close();
  await mcpServer.close();
  await mongoose.disconnect();

  const n = results.length;
  const successes = results.filter((r) => r.matched).length;
  const { lower, upper } = wilsonScoreInterval(successes, n);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Agreement: ${successes}/${n} (${n ? ((successes / n) * 100).toFixed(1) : '0.0'}%)`);
  console.log(`Wilson score 95% CI: [${(lower * 100).toFixed(1)}%, ${(upper * 100).toFixed(1)}%]`);

  fs.writeFileSync(RESULTS_FILE, JSON.stringify({ model: MODEL, generatedAt: new Date().toISOString(), successes, n, wilson: { lower, upper }, results }, null, 2));
  console.log(`\nFull trial transcripts written to ${path.relative(process.cwd(), RESULTS_FILE)}`);

  process.exitCode = hardError ? 1 : 0;
}

main().catch((err) => {
  console.error('Unexpected error while running the agentic equivalence evaluation:', err);
  process.exitCode = 1;
});
