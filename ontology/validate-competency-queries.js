#!/usr/bin/env node

/**
 * Runs every competency-question SPARQL query in apm-competency-queries.sparql
 * against apm-ontology.ttl + apm-instances-sample.ttl, and asserts the actual
 * results match what each query's "Expected result" comment documents.
 *
 * This is a regression test for the ontology + sample dataset pairing, not
 * for the Node API.
 *
 * Usage: node ontology/validate-competency-queries.js
 *
 * @see https://comunica.dev/docs/query/ for QueryEngine.queryBindings() usage.
 */

const fs = require('node:fs');
const path = require('node:path');
const { QueryEngine } = require('@comunica/query-sparql');

const ONTOLOGY_DIR = __dirname;
const SPARQL_FILE = path.join(ONTOLOGY_DIR, 'apm-competency-queries.sparql');
const APM_NS = 'http://nexus-apm.org/ontology/apm#';

/**
 * @param {string} fileName
 * @returns {{type: 'serialized', value: string, mediaType: string, baseIRI: string}}
 */
function loadSource(fileName) {
  return {
    type: 'serialized',
    value: fs.readFileSync(path.join(ONTOLOGY_DIR, fileName), 'utf8'),
    mediaType: 'text/turtle',
    baseIRI: APM_NS,
  };
}

/**
 * Shortens a full apm: URI to its `apm:LocalName` form for readable
 * assertions and failure messages; leaves everything else untouched.
 *
 * @param {string} value
 * @returns {string}
 */
function shortenTerm(value) {
  return typeof value === 'string' && value.startsWith(APM_NS)
    ? `apm:${value.slice(APM_NS.length)}`
    : value;
}

/**
 * Splits apm-competency-queries.sparql into one section per competency
 * question — bounded by its `# CQ-N:` comment marker — and extracts each
 * section's SPARQL SELECT block(s) as standalone, runnable query strings,
 * with the file's shared PREFIX declarations prepended.
 *
 * @returns {Map<string, string[]>}
 */
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

/**
 * Runs a single SPARQL SELECT query and returns its rows as plain objects
 * with apm: URIs shortened.
 *
 * @param {import('@comunica/query-sparql').QueryEngine} engine
 * @param {object[]} sources
 * @param {string} query
 * @returns {Promise<Record<string, string>[]>}
 */
async function runQuery(engine, sources, query) {
  const bindingsStream = await engine.queryBindings(query, { sources });
  const bindings = await bindingsStream.toArray();
  return bindings.map((binding) => {
    const row = {};
    for (const [variable, term] of binding) row[variable.value] = shortenTerm(term.value);
    return row;
  });
}

function assertRowCount(rows, expected, label) {
  if (rows.length !== expected) {
    throw new Error(`${label}: expected ${expected} row(s), got ${rows.length} — ${JSON.stringify(rows)}`);
  }
}

function assertSome(rows, predicate, label) {
  if (!rows.some(predicate)) {
    throw new Error(`${label}: no row matched — ${JSON.stringify(rows)}`);
  }
}

function assertSetEquals(actualValues, expectedValues, label) {
  const actual = [...new Set(actualValues)].sort();
  const expected = [...expectedValues].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label}: expected {${expected.join(', ')}}, got {${actual.join(', ')}}`);
  }
}

/**
 * One entry per competency question. `assert` receives one row array per
 * query extracted for that CQ and should throw on any mismatch.
 */
const COMPETENCY_QUESTIONS = [
  {
    id: 'CQ-1',
    description: 'Capabilities affected by a BuildFarmServer outage',
    assert([rows]) {
      assertRowCount(rows, 2, 'CQ-1');
      assertSetEquals(rows.map((r) => r.affectedApp), ['apm:DeployTrackReleaseManager'], 'CQ-1 affectedApp');
      assertSetEquals(rows.map((r) => r.affectedTechComponent), ['apm:DeployTrackAppServer'], 'CQ-1 affectedTechComponent');
      assertSetEquals(rows.map((r) => r.capability), ['apm:DevOpsReleaseManagement', 'apm:QualityAssuranceTesting'], 'CQ-1 capability');
    },
  },
  {
    id: 'CQ-2',
    description: 'Direct + two-hop dependants of SecureAuthIAM',
    assert([direct, transitive]) {
      assertRowCount(direct, 4, 'CQ-2(a)');
      assertSetEquals(
        direct.map((r) => r.downstream),
        ['apm:PeopleHubHRIS', 'apm:ProcureSuite', 'apm:CustomerPortalWeb', 'apm:ITServiceHub'],
        'CQ-2(a) downstream'
      );
      if (direct.some((r) => r.protocol !== 'apm:RESTAPI' || r.sync !== 'apm:Synchronous')) {
        throw new Error(`CQ-2(a): expected every row to be RESTAPI/Synchronous — ${JSON.stringify(direct)}`);
      }

      assertRowCount(transitive, 6, 'CQ-2(b)');
      const hop1 = transitive.filter((r) => r.hop === '1').map((r) => r.impactedApp);
      const hop2 = transitive.filter((r) => r.hop === '2').map((r) => r.impactedApp);
      assertSetEquals(hop1, ['apm:PeopleHubHRIS', 'apm:ProcureSuite', 'apm:CustomerPortalWeb', 'apm:ITServiceHub'], 'CQ-2(b) hop=1');
      assertSetEquals(hop2, ['apm:PayStreamPayroll', 'apm:CRMPlatform'], 'CQ-2(b) hop=2 (transitive blast radius)');
    },
  },
  {
    id: 'CQ-3',
    description: 'Repositories/documents to review for Customer Portal (Web)',
    assert([rows]) {
      assertRowCount(rows, 1, 'CQ-3');
      assertSome(rows, (r) => r.resource === 'apm:Repo_CustomerPortal_Web' && r.resourceType === 'apm:CodeRepository', 'CQ-3 customer-portal-web repo');
    },
  },
  {
    id: 'CQ-4',
    description: 'Compliance requirements not covered by the hosting supplier\'s certification',
    assert([rows]) {
      assertRowCount(rows, 2, 'CQ-4');
      assertSome(rows, (r) => r.app === 'apm:PeopleHubHRIS' && r.requiredStandard === 'apm:GDPR', 'CQ-4 PeopleHub HRIS/GDPR gap');
      assertSome(rows, (r) => r.app === 'apm:PayStreamPayroll' && r.requiredStandard === 'apm:ISO27001', 'CQ-4 PayStream Payroll/ISO27001 gap');
    },
  },
  {
    id: 'CQ-5',
    description: 'Highest criticality + compliance exposure among externally hosted applications',
    assert([rows]) {
      assertRowCount(rows, 6, 'CQ-5'); // 4 distinct apps, one row per (app, compliance standard) pair
      assertSetEquals(
        rows.map((r) => r.app),
        ['apm:PeopleHubHRIS', 'apm:PayStreamPayroll', 'apm:CustomerPortalWeb', 'apm:CRMPlatform'],
        'CQ-5 distinct apps'
      );
    },
  },
  {
    id: 'CQ-6',
    description: 'BuildForge total cost of ownership by category/fiscal year',
    assert([rows]) {
      assertRowCount(rows, 6, 'CQ-6');
      assertSome(rows, (r) => r.category === 'apm:Support' && r.fiscalYear === '2025' && r.totalAmount === '298000.00', 'CQ-6 Support FY2025');
      assertSome(rows, (r) => r.category === 'apm:Support' && r.fiscalYear === '2026' && r.totalAmount === '311000.00', 'CQ-6 Support FY2026 (rising cost)');
    },
  },
  {
    id: 'CQ-7',
    description: 'Open findings past their due date',
    assert([rows]) {
      assertRowCount(rows, 2, 'CQ-7');
      assertSetEquals(rows.map((r) => r.subject), ['apm:CustomerPortalWeb', 'apm:SecureAuthIAM'], 'CQ-7 overdue subjects');
      if (rows.some((r) => r.subject === 'apm:FinReportLegacy')) {
        throw new Error('CQ-7: FinReport Legacy\'s Risk-Accepted finding must be excluded despite being past due');
      }
    },
  },
  {
    id: 'CQ-8',
    description: 'Investment strategy classification + supporting fit-assessment history',
    assert([rows]) {
      assertRowCount(rows, 6, 'CQ-8');
      const strategyOf = (app) => [...new Set(rows.filter((r) => r.app === app).map((r) => r.strategy))];
      assertSetEquals(strategyOf('apm:BuildForgePlatform'), ['apm:Migrate'], 'CQ-8 BuildForge strategy');
      assertSetEquals(strategyOf('apm:PeopleHubHRIS'), ['apm:Invest'], 'CQ-8 PeopleHub HRIS strategy');
      assertSetEquals(strategyOf('apm:ProcureSuite'), ['apm:Tolerate'], 'CQ-8 ProcureSuite strategy');
      assertSetEquals(strategyOf('apm:FinReportLegacy'), ['apm:Eliminate'], 'CQ-8 FinReport Legacy strategy');
    },
  },
  {
    id: 'CQ-9',
    description: 'Implemented controls per compliance standard, and open control-gap findings',
    assert([implemented, gaps]) {
      assertRowCount(implemented, 3, 'CQ-9(a)');
      assertSome(implemented, (r) => r.app === 'apm:SecureAuthIAM' && r.control === 'apm:MFAControl' && r.standard === 'apm:ISO27001', 'CQ-9(a) SecureAuth IAM MFA');
      const itServiceHubStandards = implemented.filter((r) => r.app === 'apm:ITServiceHub').map((r) => r.standard);
      assertSetEquals(itServiceHubStandards, ['apm:ISO27001', 'apm:SOC2'], 'CQ-9(a) ITServiceHub Access Review standards');

      assertRowCount(gaps, 1, 'CQ-9(b)');
      assertSome(gaps, (r) => r.app === 'apm:PayStreamPayroll' && r.control === 'apm:MFAControl' && r.status === 'apm:InRemediation', 'CQ-9(b) PayStream Payroll control gap');
    },
  },
  {
    id: 'CQ-10',
    description: 'Software products past end-of-support and the applications they affect',
    assert([rows]) {
      assertRowCount(rows, 2, 'CQ-10');
      assertSetEquals(
        rows.map((r) => r.product),
        ['apm:FinReportLegacy_SoftwareProduct', 'apm:BuildForgePlatform_SoftwareProduct'],
        'CQ-10 products past end-of-support'
      );
      if (rows.some((r) => r.product === 'apm:PeopleHubHRIS_SoftwareProduct')) {
        throw new Error('CQ-10: PeopleHub HRIS has no end-of-support date and must not appear');
      }
    },
  },
  {
    id: 'CQ-11',
    description: 'Recovery objectives for Critical-tier applications',
    assert([rows]) {
      assertRowCount(rows, 4, 'CQ-11');
      assertSetEquals(
        rows.map((r) => r.app),
        ['apm:BuildForgePlatform', 'apm:SecureAuthIAM', 'apm:CustomerPortalWeb', 'apm:PayStreamPayroll'],
        'CQ-11 Critical-tier applications'
      );
      assertSome(rows, (r) => r.app === 'apm:BuildForgePlatform' && r.recoveryTimeObjective === 'PT24H' && r.recoveryPointObjective === 'PT12H', 'CQ-11 BuildForge RTO/RPO outlier');
    },
  },
  {
    id: 'CQ-12',
    description: 'Entitled vs. measured resource utilization for PeopleHub HRIS',
    assert([rows]) {
      assertRowCount(rows, 1, 'CQ-12');
      assertSome(
        rows,
        (r) => r.product === 'apm:PeopleHubHRIS_SoftwareProduct'
          && r.entitledQuantity === '500'
          && r.measuredValue === '340'
          && r.utilisationPercent === '68',
        'CQ-12 PeopleHub HRIS H1 2026 usage (340/500 = 68%)'
      );
    },
  },
  {
    id: 'CQ-13',
    description: 'Capability-hierarchy roll-up of the SecureAuth IAM business-risk finding',
    assert([rows]) {
      assertRowCount(rows, 3, 'CQ-13');
      assertSetEquals(
        rows.map((r) => r.ancestorCapability),
        ['apm:IdentityAccessManagement', 'apm:CybersecurityOperations', 'apm:InformationTechnology'],
        'CQ-13 capability ancestor chain'
      );
    },
  },
  {
    id: 'CQ-14',
    description: 'Accountable contacts for SecureAuth IAM',
    assert([rows]) {
      assertRowCount(rows, 2, 'CQ-14');
      assertSome(rows, (r) => r.contactActor === 'apm:GeorgeOrwell' && r.role === 'apm:CISORole' && r.email === 'george.orwell@nexusapm.example', 'CQ-14 CISO contact');
      assertSome(rows, (r) => r.contactActor === 'apm:JaneAusten' && r.role === 'apm:CTORole' && r.email === 'jane.austen@nexusapm.example', 'CQ-14 CTO contact');
    },
  },
];

async function main() {
  const engine = new QueryEngine();
  const sources = [loadSource('apm-ontology.ttl'), loadSource('apm-instances-sample.ttl')];
  const queriesByCQ = extractQueriesByCQ();

  let allPassed = true;

  for (const cq of COMPETENCY_QUESTIONS) {
    const queries = queriesByCQ.get(cq.id);

    if (!queries) {
      console.error(`[error] ${cq.id} — no matching query found in apm-competency-queries.sparql`);
      allPassed = false;
      continue;
    }

    try {
      const results = [];
      for (const query of queries) {
        results.push(await runQuery(engine, sources, query));
      }
      cq.assert(results);
      console.log(`[pass]  ${cq.id} — ${cq.description}`);
    } catch (err) {
      allPassed = false;
      console.error(`[fail]  ${cq.id} — ${cq.description}\n        ${err.message}`);
    }
  }

  const unmatched = [...queriesByCQ.keys()].filter((id) => !COMPETENCY_QUESTIONS.some((cq) => cq.id === id));
  if (unmatched.length > 0) {
    console.warn(`[warn]  Found queries with no assertions defined: ${unmatched.join(', ')}`);
  }

  process.exitCode = allPassed ? 0 : 1;
}

main().catch((err) => {
  console.error('Unexpected error while running competency queries:', err);
  process.exitCode = 1;
});
