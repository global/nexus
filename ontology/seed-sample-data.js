#!/usr/bin/env node

/**
 * Loads apm-instances-sample.ttl's scenario into MongoDB via the real REST
 * API (not direct Mongoose inserts), so the seeded data is guaranteed to
 * pass the same Joi/OpenAPI/Mongoose validation the live system enforces.
 *
 * This gives the evaluation harness (Chapter 6, O5/O6) a persistent,
 * reproducible dataset that mirrors the ontology's own sample instances —
 * the same entities/relationships used to hand-verify the SPARQL
 * competency-question results in apm-competency-queries.sparql and
 * validate-competency-queries.js, now also queryable through /api and /mcp.
 *
 * Entities are created in dependency order (mirroring
 * docs/architecture/ontology-coverage-roadmap.md's 25-step sequence) so
 * every ObjectId reference resolves against an already-created document.
 * Progress is written to .seed-manifest.json (gitignored) as
 * `"<Model>:<ontologyLocalName>": "<mongoId>"` pairs, which is what makes
 * the script both idempotent (a second run without --reset is a no-op)
 * and reversible (--reset deletes every id in the manifest before
 * reseeding).
 *
 * Usage:
 *   node ontology/seed-sample-data.js            # seed once; no-op if already seeded
 *   node ontology/seed-sample-data.js --reset     # delete the previous seed, then reseed
 *
 * Requires the dev server, MongoDB, and Keycloak all running
 * (npm run mongo / npm run keycloak / npm run env:dev).
 */

const fs = require('node:fs');
const path = require('node:path');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const ADMIN_USERNAME = process.env.SEED_USERNAME || 'alice.admin';
const ADMIN_PASSWORD = process.env.SEED_PASSWORD || 'Passw0rd!';
const MANIFEST_PATH = path.join(__dirname, '.seed-manifest.json');

const RESET = process.argv.includes('--reset');

let token = null;
const manifest = {}; // "<Model>:<localName>" -> mongoId, also drives --reset deletion

function loadManifest() {
  if (fs.existsSync(MANIFEST_PATH)) {
    Object.assign(manifest, JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')));
  }
}

function saveManifest() {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

async function api(method, apiPath, body) {
  const res = await fetch(`${BASE_URL}${apiPath}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(`${method} ${apiPath} -> ${res.status}: ${text}`);
  }
  return data;
}

async function login() {
  const { accessToken } = await api('POST', '/api/auth/login', {
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
  });
  token = accessToken;
}

/** Looks up an already-created entity's MongoDB id by its ontology local name. */
function ref(local) {
  const key = Object.keys(manifest).find((k) => k.endsWith(`:${local}`));
  if (!key) throw new Error(`ref(): "${local}" has not been created yet — check seeding order.`);
  return manifest[key];
}

/** Same as ref(), but for an array of local names. */
function refs(locals) {
  return locals.map(ref);
}

/** Creates one entity via the REST API and records its id in the manifest. */
async function create(model, resourcePath, local, body) {
  const key = `${model}:${local}`;
  if (manifest[key]) return manifest[key]; // already seeded this run/session
  const created = await api('POST', resourcePath, body);
  manifest[key] = created._id;
  return created._id;
}

/** Deletes every entity recorded in the manifest, in reverse creation order. */
async function resetPreviousSeed() {
  const entries = Object.entries(manifest);
  if (entries.length === 0) return;
  console.log(`--reset: deleting ${entries.length} previously seeded entities...`);
  for (const [key, id] of entries.reverse()) {
    const [model] = key.split(':');
    try {
      await api('DELETE', `${MODEL_TO_PATH[model]}/${id}`);
    } catch (err) {
      console.warn(`  [warn] could not delete ${key} (${id}): ${err.message}`);
    }
    delete manifest[key];
  }
  saveManifest();
}

const MODEL_TO_PATH = {
  Location: '/api/locations',
  Role: '/api/roles',
  Metric: '/api/metrics',
  OrganizationUnit: '/api/organization-units',
  BusinessCapability: '/api/business-capabilities',
  Supplier: '/api/suppliers',
  Control: '/api/controls',
  DataEntity: '/api/data-entities',
  Actor: '/api/actors',
  LogicalApplicationComponent: '/api/logical-application-components',
  PhysicalTechnologyComponent: '/api/physical-technology-components',
  SoftwareEntitlement: '/api/software-entitlements',
  SoftwareProduct: '/api/software-products',
  PhysicalApplicationComponent: '/api/physical-application-components',
  TechnologyDependency: '/api/technology-dependencies',
  Document: '/api/documents',
  CodeRepository: '/api/code-repositories',
  Application: '/api/applications',
  ApplicationDependency: '/api/application-dependencies',
  ApplicationContact: '/api/application-contacts',
  Finding: '/api/findings',
  CostRecord: '/api/cost-records',
  PerformanceAssessment: '/api/performance-assessments',
  SLAMetric: '/api/sla-metrics',
  ServiceLevelAgreement: '/api/service-level-agreements',
  Portfolio: '/api/portfolios',
  ResourceUtilizationRecord: '/api/resource-utilization-records',
};

async function seed() {
  // 1. Locations
  await create('Location', MODEL_TO_PATH.Location, 'NexusAPMHQ', { name: 'NexusAPM HQ, Dublin, Ireland' });
  await create('Location', MODEL_TO_PATH.Location, 'EngineeringHubToronto', { name: 'Engineering Hub, Toronto, ON' });

  // 2. Roles
  await create('Role', MODEL_TO_PATH.Role, 'CTORole', { name: 'Chief Technology Officer' });
  await create('Role', MODEL_TO_PATH.Role, 'CISORole', { name: 'Chief Information Security Officer' });
  await create('Role', MODEL_TO_PATH.Role, 'InformationOwnerRole', { name: 'Information Owner' });
  await create('Role', MODEL_TO_PATH.Role, 'ApplicationOwnerRole', { name: 'Application Owner' });

  // 3. Metrics
  await create('Metric', MODEL_TO_PATH.Metric, 'PerNamedUserMetric', { name: 'Per Named User' });

  // 4. Organization Units
  await create('OrganizationUnit', MODEL_TO_PATH.OrganizationUnit, 'HRDepartment', { name: 'Human Resources', costCenterCode: 'CC-100', location: ref('NexusAPMHQ') });
  await create('OrganizationUnit', MODEL_TO_PATH.OrganizationUnit, 'ProcurementDepartment', { name: 'Procurement', costCenterCode: 'CC-200', location: ref('NexusAPMHQ') });
  await create('OrganizationUnit', MODEL_TO_PATH.OrganizationUnit, 'ITDepartment', { name: 'Information Technology', costCenterCode: 'CC-300', location: ref('NexusAPMHQ') });
  await create('OrganizationUnit', MODEL_TO_PATH.OrganizationUnit, 'EngineeringDepartment', { name: 'Engineering', costCenterCode: 'CC-400', location: ref('EngineeringHubToronto') });
  await create('OrganizationUnit', MODEL_TO_PATH.OrganizationUnit, 'FinanceDepartment', { name: 'Finance', costCenterCode: 'CC-500', location: ref('NexusAPMHQ') });
  await create('OrganizationUnit', MODEL_TO_PATH.OrganizationUnit, 'SalesDepartment', { name: 'Sales & Customer Management', costCenterCode: 'CC-600', location: ref('NexusAPMHQ') });

  // 5. Business Capabilities (top-level first, then children, then grandchildren)
  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'HumanResourceManagement', { name: 'Human Resource Management', capabilityWeight: 4 });
  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'Procurement', { name: 'Procurement', capabilityWeight: 3 });
  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'InformationTechnology', { name: 'Information Technology', capabilityWeight: 5 });
  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'EngineeringProductDelivery', { name: 'Engineering & Product Delivery', capabilityWeight: 5 });
  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'Finance', { name: 'Finance', capabilityWeight: 4 });
  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'SalesCustomerManagement', { name: 'Sales & Customer Management', capabilityWeight: 5 });

  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'TalentAcquisition', { name: 'Talent Acquisition', capabilityWeight: 3, parentCapability: ref('HumanResourceManagement') });
  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'PayrollBenefits', { name: 'Payroll & Benefits', capabilityWeight: 5, parentCapability: ref('HumanResourceManagement') });
  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'VendorToolingManagement', { name: 'Vendor & Tooling Management', capabilityWeight: 3, parentCapability: ref('Procurement') });
  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'PurchaseOrderManagement', { name: 'Purchase Order Management', capabilityWeight: 3, parentCapability: ref('Procurement') });
  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'ITServiceManagement', { name: 'IT Service Management', capabilityWeight: 4, parentCapability: ref('InformationTechnology') });
  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'CybersecurityOperations', { name: 'Cybersecurity Operations', capabilityWeight: 5, parentCapability: ref('InformationTechnology') });
  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'SoftwareEngineering', { name: 'Software Engineering', capabilityWeight: 5, parentCapability: ref('EngineeringProductDelivery') });
  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'DevOpsReleaseManagement', { name: 'DevOps & Release Management', capabilityWeight: 4, parentCapability: ref('EngineeringProductDelivery') });
  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'QualityAssuranceTesting', { name: 'Quality Assurance & Testing', capabilityWeight: 4, parentCapability: ref('EngineeringProductDelivery') });
  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'FinancialReporting', { name: 'Financial Reporting', capabilityWeight: 4, parentCapability: ref('Finance') });
  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'AccountsPayableReceivable', { name: 'Accounts Payable / Receivable', capabilityWeight: 3, parentCapability: ref('Finance') });
  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'CustomerRelationshipManagement', { name: 'Customer Relationship Management', capabilityWeight: 4, parentCapability: ref('SalesCustomerManagement') });
  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'SubscriptionBillingManagement', { name: 'Subscription & Billing Management', capabilityWeight: 5, parentCapability: ref('SalesCustomerManagement') });

  await create('BusinessCapability', MODEL_TO_PATH.BusinessCapability, 'IdentityAccessManagement', { name: 'Identity & Access Management', capabilityWeight: 5, parentCapability: ref('CybersecurityOperations') });

  // 6. Suppliers
  await create('Supplier', MODEL_TO_PATH.Supplier, 'WorkforceCloudInc', { name: 'WorkforceCloud Inc.', certifications: ['SOC2', 'ISO27001'] });
  await create('Supplier', MODEL_TO_PATH.Supplier, 'PayStreamVendor', { name: 'PayStream Solutions Ltd.', certifications: ['SOC2'] });
  await create('Supplier', MODEL_TO_PATH.Supplier, 'ProcureSuiteVendor', { name: 'ProcureSuite Technologies', certifications: ['SOC2'] });
  await create('Supplier', MODEL_TO_PATH.Supplier, 'CloudHostSupplier', { name: 'NimbusCloud Hosting', certifications: ['SOC2', 'ISO27001', 'PCIDSS'] });
  await create('Supplier', MODEL_TO_PATH.Supplier, 'CRMVendorInc', { name: 'SummitCRM Inc.', certifications: ['SOC2', 'ISO27001'] });
  await create('Supplier', MODEL_TO_PATH.Supplier, 'ITServiceHubVendor', { name: 'ServiceHub Software', certifications: ['SOC2'] });

  // 7. Controls
  await create('Control', MODEL_TO_PATH.Control, 'MFAControl', { name: 'Multi-Factor Authentication', controlReference: 'ISO/IEC 27002:2022 5.17', supportsComplianceStandard: ['ISO27001'] });
  await create('Control', MODEL_TO_PATH.Control, 'AccessReviewControl', { name: 'Periodic Access Review', controlReference: 'ISO/IEC 27002:2022 5.18', supportsComplianceStandard: ['ISO27001', 'SOC2'] });

  // 8. Data Entities
  await create('DataEntity', MODEL_TO_PATH.DataEntity, 'EmployeeRecord', { name: 'Employee Record', hasDataSensitivity: ['PII'] });
  await create('DataEntity', MODEL_TO_PATH.DataEntity, 'PayrollRecord', { name: 'Payroll Record', hasDataSensitivity: ['PII', 'Confidential'] });
  await create('DataEntity', MODEL_TO_PATH.DataEntity, 'CustomerSubscriptionRecord', { name: 'Customer Subscription Record', hasDataSensitivity: ['PII'] });
  await create('DataEntity', MODEL_TO_PATH.DataEntity, 'PaymentCardData', { name: 'Payment Card Data', hasDataSensitivity: ['PII', 'HighlyConfidential'] });

  // 9. Actors
  await create('Actor', MODEL_TO_PATH.Actor, 'JaneAusten', { name: 'Jane Austen', emailAddress: 'jane.austen@nexusapm.example', role: ref('CTORole'), organizationUnit: ref('ITDepartment') });
  await create('Actor', MODEL_TO_PATH.Actor, 'GeorgeOrwell', { name: 'George Orwell', emailAddress: 'george.orwell@nexusapm.example', role: ref('CISORole'), organizationUnit: ref('ITDepartment') });
  await create('Actor', MODEL_TO_PATH.Actor, 'CharlesDickens', { name: 'Charles Dickens', emailAddress: 'charles.dickens@nexusapm.example', role: ref('ApplicationOwnerRole'), organizationUnit: ref('ITDepartment') });
  await create('Actor', MODEL_TO_PATH.Actor, 'VirginiaWoolf', { name: 'Virginia Woolf', emailAddress: 'virginia.woolf@nexusapm.example', organizationUnit: ref('HRDepartment') });
  await create('Actor', MODEL_TO_PATH.Actor, 'ThomasHardy', { name: 'Thomas Hardy', emailAddress: 'thomas.hardy@nexusapm.example', organizationUnit: ref('ProcurementDepartment') });
  await create('Actor', MODEL_TO_PATH.Actor, 'EmilyBronte', { name: 'Emily Brontë', emailAddress: 'emily.bronte@nexusapm.example', organizationUnit: ref('EngineeringDepartment') });
  await create('Actor', MODEL_TO_PATH.Actor, 'DHLawrence', { name: 'D. H. Lawrence', emailAddress: 'dh.lawrence@nexusapm.example', organizationUnit: ref('SalesDepartment') });
  await create('Actor', MODEL_TO_PATH.Actor, 'WilliamWordsworth', { name: 'William Wordsworth', emailAddress: 'william.wordsworth@nexusapm.example', organizationUnit: ref('FinanceDepartment') });

  // 10. Logical Application Components
  await create('LogicalApplicationComponent', MODEL_TO_PATH.LogicalApplicationComponent, 'BuildForgePlatform_LogicalComponent', { name: 'BuildForge Core Logical Component' });
  await create('LogicalApplicationComponent', MODEL_TO_PATH.LogicalApplicationComponent, 'DeployTrackReleaseManager_LogicalComponent', { name: 'DeployTrack Core Logical Component' });

  // 11. Physical Technology Components
  await create('PhysicalTechnologyComponent', MODEL_TO_PATH.PhysicalTechnologyComponent, 'BuildFarmServer', { name: 'Build Farm Server', assetIdentifier: 'build-farm-prod-01.nexusapm.example', hasEnvironment: 'Production' });
  await create('PhysicalTechnologyComponent', MODEL_TO_PATH.PhysicalTechnologyComponent, 'DeployTrackAppServer', { name: 'DeployTrack Application Server', assetIdentifier: 'app-deploytrack-prod-01.nexusapm.example', hasEnvironment: 'Production' });

  // 12. Software Entitlements (before SoftwareProduct, which references one)
  await create('SoftwareEntitlement', MODEL_TO_PATH.SoftwareEntitlement, 'PeopleHubHRIS_Entitlement', { entitledQuantity: 500, measuredByMetric: ref('PerNamedUserMetric') });

  // 13. Software Products
  await create('SoftwareProduct', MODEL_TO_PATH.SoftwareProduct, 'BuildForgePlatform_SoftwareProduct', { name: 'BuildForge Enterprise', version: '5.4', endOfLifeDate: '2022-06-30', endOfSupportDate: '2023-12-31' });
  await create('SoftwareProduct', MODEL_TO_PATH.SoftwareProduct, 'FinReportLegacy_SoftwareProduct', { name: 'FinReport Classic', version: '3.1', endOfLifeDate: '2017-06-01', endOfSupportDate: '2019-01-01' });
  await create('SoftwareProduct', MODEL_TO_PATH.SoftwareProduct, 'PeopleHubHRIS_SoftwareProduct', { name: 'PeopleHub HRIS', version: '24.3', suppliedBy: ref('WorkforceCloudInc'), coveredByEntitlement: ref('PeopleHubHRIS_Entitlement') });

  // 14. Physical Application Components
  await create('PhysicalApplicationComponent', MODEL_TO_PATH.PhysicalApplicationComponent, 'BuildForgePlatform_Instance', {
    name: 'BuildForge CI/CD Platform — Production Instance',
    realizesLogicalComponent: ref('BuildForgePlatform_LogicalComponent'),
    deployedOn: ref('BuildFarmServer'),
    hasEnvironment: 'Production',
    identifiedBy: ref('BuildForgePlatform_SoftwareProduct'),
  });
  await create('PhysicalApplicationComponent', MODEL_TO_PATH.PhysicalApplicationComponent, 'DeployTrackReleaseManager_Instance', {
    name: 'DeployTrack Release Manager — Production Instance',
    realizesLogicalComponent: ref('DeployTrackReleaseManager_LogicalComponent'),
    deployedOn: ref('DeployTrackAppServer'),
    hasEnvironment: 'Production',
  });
  await create('PhysicalApplicationComponent', MODEL_TO_PATH.PhysicalApplicationComponent, 'FinReportLegacy_Instance', {
    name: 'FinReport Legacy — Production Instance',
    hasEnvironment: 'Production',
    identifiedBy: ref('FinReportLegacy_SoftwareProduct'),
  });

  // 15. Technology Dependencies
  await create('TechnologyDependency', MODEL_TO_PATH.TechnologyDependency, 'TechDep_DeployTrackServer_on_BuildFarmServer', {
    upstreamTechnologyComponent: ref('BuildFarmServer'),
    downstreamTechnologyComponent: ref('DeployTrackAppServer'),
    usesProtocol: 'DatabaseConnection',
    hasSynchronicity: 'Synchronous',
  });

  // 16. Documents / Code Repositories
  await create('Document', MODEL_TO_PATH.Document, 'Doc_IAM_ThreatModel', {
    name: 'SecureAuth IAM Threat Model',
    hasDocumentType: 'ThreatModelDocType',
    url: 'https://wiki.nexusapm.example/iam/threat-model',
    lastUpdated: '2026-02-10',
  });
  await create('CodeRepository', MODEL_TO_PATH.CodeRepository, 'Repo_CustomerPortal_Web', {
    name: 'customer-portal-web',
    url: 'https://git.nexusapm.example/sales/customer-portal-web',
    lastUpdated: '2026-07-05',
  });
  await create('CodeRepository', MODEL_TO_PATH.CodeRepository, 'Repo_ITServiceHub_Integrations', {
    name: 'itservicehub-integrations',
    url: 'https://git.nexusapm.example/it/itservicehub-integrations',
    lastUpdated: '2025-09-20',
  });

  // 17. Applications
  await create('Application', MODEL_TO_PATH.Application, 'PeopleHubHRIS', {
    name: 'PeopleHub HRIS',
    owners: [ref('VirginiaWoolf')],
    organizationUnit: ref('HRDepartment'),
    capabilities: refs(['TalentAcquisition', 'PayrollBenefits']),
    lifecycleStatus: 'Operate',
    criticalityTier: 'High',
    hostingModel: 'ExternallyHosted',
    supplier: ref('WorkforceCloudInc'),
    investmentStrategy: 'Invest',
    complianceStandards: ['GDPR', 'SOC2'],
    goLiveDate: '2021-03-01',
    recoveryTimeObjective: 'PT8H',
    recoveryPointObjective: 'PT4H',
    dataEntities: [ref('EmployeeRecord')],
  });
  await create('Application', MODEL_TO_PATH.Application, 'PayStreamPayroll', {
    name: 'PayStream Payroll',
    owners: [ref('VirginiaWoolf')],
    organizationUnit: ref('HRDepartment'),
    capabilities: [ref('PayrollBenefits')],
    lifecycleStatus: 'Operate',
    criticalityTier: 'Critical',
    hostingModel: 'ExternallyHosted',
    supplier: ref('PayStreamVendor'),
    investmentStrategy: 'Tolerate',
    complianceStandards: ['SOC2', 'ISO27001'],
    goLiveDate: '2019-09-15',
    recoveryTimeObjective: 'PT4H',
    recoveryPointObjective: 'PT1H',
    dataEntities: refs(['EmployeeRecord', 'PayrollRecord']),
  });
  await create('Application', MODEL_TO_PATH.Application, 'ProcureSuite', {
    name: 'ProcureSuite',
    owners: [ref('ThomasHardy')],
    organizationUnit: ref('ProcurementDepartment'),
    capabilities: refs(['VendorToolingManagement', 'PurchaseOrderManagement']),
    lifecycleStatus: 'Operate',
    criticalityTier: 'Medium',
    hostingModel: 'ExternallyHosted',
    supplier: ref('ProcureSuiteVendor'),
    investmentStrategy: 'Tolerate',
    complianceStandards: ['SOC2'],
    goLiveDate: '2020-01-10',
  });
  await create('Application', MODEL_TO_PATH.Application, 'BuildForgePlatform', {
    name: 'BuildForge CI/CD Platform',
    owners: [ref('EmilyBronte')],
    organizationUnit: ref('EngineeringDepartment'),
    capabilities: refs(['SoftwareEngineering', 'DevOpsReleaseManagement']),
    lifecycleStatus: 'Operate',
    criticalityTier: 'Critical',
    hostingModel: 'InternallyHosted',
    investmentStrategy: 'Migrate',
    goLiveDate: '2013-04-01',
    recoveryTimeObjective: 'PT24H',
    recoveryPointObjective: 'PT12H',
    logicalComponents: [ref('BuildForgePlatform_LogicalComponent')],
    deployments: [ref('BuildForgePlatform_Instance')],
  });
  await create('Application', MODEL_TO_PATH.Application, 'DeployTrackReleaseManager', {
    name: 'DeployTrack Release Manager',
    owners: [ref('EmilyBronte')],
    organizationUnit: ref('EngineeringDepartment'),
    capabilities: refs(['DevOpsReleaseManagement', 'QualityAssuranceTesting']),
    lifecycleStatus: 'Operate',
    criticalityTier: 'High',
    hostingModel: 'InternallyHosted',
    investmentStrategy: 'Tolerate',
    goLiveDate: '2017-04-01',
    recoveryTimeObjective: 'PT6H',
    recoveryPointObjective: 'PT2H',
    logicalComponents: [ref('DeployTrackReleaseManager_LogicalComponent')],
    deployments: [ref('DeployTrackReleaseManager_Instance')],
  });
  await create('Application', MODEL_TO_PATH.Application, 'SecureAuthIAM', {
    name: 'SecureAuth IAM',
    owners: [ref('GeorgeOrwell')],
    organizationUnit: ref('ITDepartment'),
    capabilities: refs(['IdentityAccessManagement', 'CybersecurityOperations']),
    lifecycleStatus: 'Operate',
    criticalityTier: 'Critical',
    hostingModel: 'InternallyHosted',
    investmentStrategy: 'Invest',
    complianceStandards: ['ISO27001', 'SOC2'],
    goLiveDate: '2022-11-01',
    recoveryTimeObjective: 'PT1H',
    recoveryPointObjective: 'PT15M',
    controls: [ref('MFAControl')],
    documents: [ref('Doc_IAM_ThreatModel')],
  });
  await create('Application', MODEL_TO_PATH.Application, 'CustomerPortalWeb', {
    name: 'Customer Portal (Web)',
    owners: [ref('DHLawrence')],
    organizationUnit: ref('SalesDepartment'),
    capabilities: refs(['SubscriptionBillingManagement', 'CustomerRelationshipManagement']),
    lifecycleStatus: 'Operate',
    criticalityTier: 'Critical',
    hostingModel: 'ExternallyHosted',
    supplier: ref('CloudHostSupplier'),
    investmentStrategy: 'Invest',
    complianceStandards: ['PCIDSS'],
    goLiveDate: '2023-02-15',
    recoveryTimeObjective: 'PT2H',
    recoveryPointObjective: 'PT30M',
    dataEntities: refs(['CustomerSubscriptionRecord', 'PaymentCardData']),
    repositories: [ref('Repo_CustomerPortal_Web')],
  });
  await create('Application', MODEL_TO_PATH.Application, 'CRMPlatform', {
    name: 'Summit CRM',
    owners: [ref('DHLawrence')],
    organizationUnit: ref('SalesDepartment'),
    capabilities: [ref('CustomerRelationshipManagement')],
    lifecycleStatus: 'Operate',
    criticalityTier: 'High',
    hostingModel: 'ExternallyHosted',
    supplier: ref('CRMVendorInc'),
    investmentStrategy: 'Invest',
    complianceStandards: ['SOC2'],
    goLiveDate: '2022-06-01',
  });
  await create('Application', MODEL_TO_PATH.Application, 'FinReportLegacy', {
    name: 'FinReport Legacy',
    owners: [ref('WilliamWordsworth')],
    organizationUnit: ref('FinanceDepartment'),
    capabilities: [ref('FinancialReporting')],
    lifecycleStatus: 'Operate',
    criticalityTier: 'Low',
    hostingModel: 'InternallyHosted',
    investmentStrategy: 'Eliminate',
    goLiveDate: '2008-01-01',
    deployments: [ref('FinReportLegacy_Instance')],
  });
  await create('Application', MODEL_TO_PATH.Application, 'ITServiceHub', {
    name: 'ITServiceHub',
    owners: [ref('CharlesDickens')],
    organizationUnit: ref('ITDepartment'),
    capabilities: [ref('ITServiceManagement')],
    lifecycleStatus: 'Operate',
    criticalityTier: 'Medium',
    hostingModel: 'ExternallyHosted',
    supplier: ref('ITServiceHubVendor'),
    investmentStrategy: 'Tolerate',
    complianceStandards: ['SOC2'],
    goLiveDate: '2020-08-01',
    controls: [ref('AccessReviewControl')],
    repositories: [ref('Repo_ITServiceHub_Integrations')],
  });

  // 18. Application Dependencies
  await create('ApplicationDependency', MODEL_TO_PATH.ApplicationDependency, 'Dep_HRIS_on_IAM', { upstreamApplication: ref('SecureAuthIAM'), downstreamApplication: ref('PeopleHubHRIS'), usesProtocol: 'RESTAPI', hasSynchronicity: 'Synchronous' });
  await create('ApplicationDependency', MODEL_TO_PATH.ApplicationDependency, 'Dep_ProcureSuite_on_IAM', { upstreamApplication: ref('SecureAuthIAM'), downstreamApplication: ref('ProcureSuite'), usesProtocol: 'RESTAPI', hasSynchronicity: 'Synchronous' });
  await create('ApplicationDependency', MODEL_TO_PATH.ApplicationDependency, 'Dep_CustomerPortal_on_IAM', { upstreamApplication: ref('SecureAuthIAM'), downstreamApplication: ref('CustomerPortalWeb'), usesProtocol: 'RESTAPI', hasSynchronicity: 'Synchronous' });
  await create('ApplicationDependency', MODEL_TO_PATH.ApplicationDependency, 'Dep_ITServiceHub_on_IAM', { upstreamApplication: ref('SecureAuthIAM'), downstreamApplication: ref('ITServiceHub'), usesProtocol: 'RESTAPI', hasSynchronicity: 'Synchronous' });
  await create('ApplicationDependency', MODEL_TO_PATH.ApplicationDependency, 'Dep_PayStream_on_HRIS', { upstreamApplication: ref('PeopleHubHRIS'), downstreamApplication: ref('PayStreamPayroll'), usesProtocol: 'RESTAPI', hasSynchronicity: 'Batch' });
  await create('ApplicationDependency', MODEL_TO_PATH.ApplicationDependency, 'Dep_DeployTrack_on_BuildForge', { upstreamApplication: ref('BuildForgePlatform'), downstreamApplication: ref('DeployTrackReleaseManager'), usesProtocol: 'DatabaseConnection', hasSynchronicity: 'Synchronous' });
  await create('ApplicationDependency', MODEL_TO_PATH.ApplicationDependency, 'Dep_CRM_on_CustomerPortal', { upstreamApplication: ref('CustomerPortalWeb'), downstreamApplication: ref('CRMPlatform'), usesProtocol: 'MessageQueue', hasSynchronicity: 'Asynchronous' });

  // 19. Application Contacts
  await create('ApplicationContact', MODEL_TO_PATH.ApplicationContact, 'Contact_HRIS_InfoOwner', { forApplication: ref('PeopleHubHRIS'), contactActor: ref('VirginiaWoolf'), contactRole: ref('InformationOwnerRole') });
  await create('ApplicationContact', MODEL_TO_PATH.ApplicationContact, 'Contact_IAM_CISO', { forApplication: ref('SecureAuthIAM'), contactActor: ref('GeorgeOrwell'), contactRole: ref('CISORole') });
  await create('ApplicationContact', MODEL_TO_PATH.ApplicationContact, 'Contact_IAM_CTO', { forApplication: ref('SecureAuthIAM'), contactActor: ref('JaneAusten'), contactRole: ref('CTORole') });
  await create('ApplicationContact', MODEL_TO_PATH.ApplicationContact, 'Contact_BuildForge_Owner', { forApplication: ref('BuildForgePlatform'), contactActor: ref('EmilyBronte'), contactRole: ref('ApplicationOwnerRole') });
  await create('ApplicationContact', MODEL_TO_PATH.ApplicationContact, 'Contact_CustomerPortal_Owner', { forApplication: ref('CustomerPortalWeb'), contactActor: ref('DHLawrence'), contactRole: ref('ApplicationOwnerRole') });

  // 20. Findings
  await create('Finding', MODEL_TO_PATH.Finding, 'Finding_CVE_CustomerPortal', {
    application: ref('CustomerPortalWeb'),
    findingCategory: 'Vulnerability',
    cveId: 'CVE-2026-13371',
    cvssScore: 9.1,
    findingDetails: "Unauthenticated remote code execution in the customer portal's payment integration library.",
    likelihoodScore: 5, impactScore: 5, riskScore: 5,
    impactTypes: ['DataBreach', 'RegulatoryFine', 'ReputationalDamage'],
    identifiedOn: '2026-05-01', dueDate: '2026-05-31',
    findingStatus: 'Open',
  });
  await create('Finding', MODEL_TO_PATH.Finding, 'Finding_EOL_BuildForge', {
    application: ref('BuildForgePlatform'),
    findingCategory: 'TechnicalRisk',
    findingDetails: 'BuildForge Enterprise 5.4 has been unsupported by the vendor since 2023-12-31; no further security patches are available for the CI/CD platform underpinning every software release.',
    likelihoodScore: 3, impactScore: 5, riskScore: 4,
    impactTypes: ['ServiceOutage', 'FinancialLoss'],
    identifiedOn: '2026-01-15', dueDate: '2026-09-30',
    findingStatus: 'Open',
  });
  await create('Finding', MODEL_TO_PATH.Finding, 'Finding_ControlGap_PayStream', {
    application: ref('PayStreamPayroll'),
    findingCategory: 'ControlGap',
    relatedControl: ref('MFAControl'),
    findingDetails: 'PayStream Payroll administrative console does not enforce multi-factor authentication.',
    likelihoodScore: 3, impactScore: 4, riskScore: 4,
    impactTypes: ['DataBreach'],
    identifiedOn: '2026-06-01', dueDate: '2026-08-15',
    findingStatus: 'InRemediation',
  });
  await create('Finding', MODEL_TO_PATH.Finding, 'Finding_BusinessRisk_IAM', {
    application: ref('SecureAuthIAM'),
    findingCategory: 'BusinessRisk',
    threatenedCapability: ref('IdentityAccessManagement'),
    findingDetails: 'SecureAuth IAM has no active-active failover; a regional outage would remove authentication for four downstream applications simultaneously.',
    likelihoodScore: 2, impactScore: 5, riskScore: 4,
    impactTypes: ['ServiceOutage', 'FinancialLoss'],
    identifiedOn: '2026-04-10', dueDate: '2026-07-10',
    findingStatus: 'Open',
  });
  await create('Finding', MODEL_TO_PATH.Finding, 'Finding_TechRisk_FinReport', {
    application: ref('FinReportLegacy'),
    findingCategory: 'TechnicalRisk',
    findingDetails: 'FinReport Classic 3.1 has been unsupported since 2019; the application is scheduled for retirement and the residual risk has been formally accepted.',
    likelihoodScore: 2, impactScore: 2, riskScore: 2,
    identifiedOn: '2025-11-01', dueDate: '2026-02-01',
    findingStatus: 'RiskAccepted',
  });
  await create('Finding', MODEL_TO_PATH.Finding, 'Finding_Vuln_BuildFarmServer_Remediated', {
    technologyComponent: ref('BuildFarmServer'),
    findingCategory: 'Vulnerability',
    cveId: 'CVE-2025-44120',
    cvssScore: 7.5,
    findingDetails: 'Unpatched OpenSSL vulnerability on the build farm server, resolved during the March 2026 patch cycle.',
    likelihoodScore: 3, impactScore: 4, riskScore: 3,
    impactTypes: ['ServiceOutage'],
    identifiedOn: '2026-02-01', dueDate: '2026-03-01',
    findingStatus: 'Remediated',
  });

  // 21. Cost Records
  const costRecords = [
    ['CR_HRIS_Licensing_FY2025', 'PeopleHubHRIS', 'Licensing', 118000.00, '2025'],
    ['CR_HRIS_Support_FY2025', 'PeopleHubHRIS', 'Support', 24000.00, '2025'],
    ['CR_HRIS_Licensing_FY2026', 'PeopleHubHRIS', 'Licensing', 124000.00, '2026'],
    ['CR_HRIS_Support_FY2026', 'PeopleHubHRIS', 'Support', 25500.00, '2026'],
    ['CR_BuildForge_Support_FY2025', 'BuildForgePlatform', 'Support', 298000.00, '2025'],
    ['CR_BuildForge_Infrastructure_FY2025', 'BuildForgePlatform', 'Infrastructure', 91000.00, '2025'],
    ['CR_BuildForge_Labor_FY2025', 'BuildForgePlatform', 'Labor', 176000.00, '2025'],
    ['CR_BuildForge_Support_FY2026', 'BuildForgePlatform', 'Support', 311000.00, '2026'],
    ['CR_BuildForge_Infrastructure_FY2026', 'BuildForgePlatform', 'Infrastructure', 95500.00, '2026'],
    ['CR_BuildForge_Labor_FY2026', 'BuildForgePlatform', 'Labor', 182000.00, '2026'],
    ['CR_CustomerPortal_Infrastructure_FY2026', 'CustomerPortalWeb', 'Infrastructure', 62000.00, '2026'],
    ['CR_CustomerPortal_Licensing_FY2026', 'CustomerPortalWeb', 'Licensing', 38000.00, '2026'],
    ['CR_ProcureSuite_Licensing_FY2026', 'ProcureSuite', 'Licensing', 46500.00, '2026'],
  ];
  for (const [local, app, category, amount, fiscalYear] of costRecords) {
    await create('CostRecord', MODEL_TO_PATH.CostRecord, local, {
      incurredByApplication: ref(app), hasCostCategory: category, costAmount: amount, costCurrency: 'EUR', fiscalYear,
    });
  }

  // 22. Performance Assessments
  const assessments = [
    ['PA_BuildForge_2025', 'BuildForgePlatform', 'JaneAusten', 5, 2, '2025-03-01'],
    ['PA_BuildForge_2026', 'BuildForgePlatform', 'JaneAusten', 5, 2, '2026-03-01'],
    ['PA_HRIS_2025', 'PeopleHubHRIS', 'JaneAusten', 4, 4, '2025-03-01'],
    ['PA_HRIS_2026', 'PeopleHubHRIS', 'JaneAusten', 4, 5, '2026-03-01'],
    ['PA_ProcureSuite_2026', 'ProcureSuite', 'JaneAusten', 2, 4, '2026-03-01'],
    ['PA_FinReport_2026', 'FinReportLegacy', 'WilliamWordsworth', 1, 1, '2026-03-01'],
  ];
  for (const [local, app, assessor, businessFit, technicalFit, assessedOn] of assessments) {
    await create('PerformanceAssessment', MODEL_TO_PATH.PerformanceAssessment, local, {
      assessesApplication: ref(app), assessedBy: ref(assessor), businessFitScore: businessFit, technicalFitScore: technicalFit, assessedOn,
    });
  }

  // 23. SLA Metrics (before ServiceLevelAgreement, which references these)
  await create('SLAMetric', MODEL_TO_PATH.SLAMetric, 'SLA_HRIS_Availability', { hasSLACategory: 'Availability', targetValue: 99.9, unitOfMeasure: '%' });
  await create('SLAMetric', MODEL_TO_PATH.SLAMetric, 'SLA_HRIS_ResponseTime', { hasSLACategory: 'ResponseTime', targetValue: 500, unitOfMeasure: 'milliseconds' });
  await create('SLAMetric', MODEL_TO_PATH.SLAMetric, 'SLA_CustomerPortal_Availability', { hasSLACategory: 'Availability', targetValue: 99.95, unitOfMeasure: '%' });
  await create('SLAMetric', MODEL_TO_PATH.SLAMetric, 'SLA_CustomerPortal_Throughput', { hasSLACategory: 'Throughput', targetValue: 1200, unitOfMeasure: 'requests/second' });

  // 24. Service Level Agreements
  await create('ServiceLevelAgreement', MODEL_TO_PATH.ServiceLevelAgreement, 'SLA_HRIS_2026', {
    appliesToApplication: ref('PeopleHubHRIS'), effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31',
    hasSLAMetric: refs(['SLA_HRIS_Availability', 'SLA_HRIS_ResponseTime']),
  });
  await create('ServiceLevelAgreement', MODEL_TO_PATH.ServiceLevelAgreement, 'SLA_CustomerPortal_2026', {
    appliesToApplication: ref('CustomerPortalWeb'), effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31',
    hasSLAMetric: refs(['SLA_CustomerPortal_Availability', 'SLA_CustomerPortal_Throughput']),
  });

  // 25. Portfolio
  await create('Portfolio', MODEL_TO_PATH.Portfolio, 'CoreBusinessSystemsPortfolio', {
    name: 'Core Business Systems Portfolio',
    portfolioOwner: ref('JaneAusten'),
    alignsToCapability: ref('InformationTechnology'),
    containsApplication: refs([
      'PeopleHubHRIS', 'PayStreamPayroll', 'ProcureSuite', 'BuildForgePlatform', 'DeployTrackReleaseManager',
      'SecureAuthIAM', 'CustomerPortalWeb', 'CRMPlatform', 'FinReportLegacy', 'ITServiceHub',
    ]),
  });

  // 26. Resource Utilization Records
  await create('ResourceUtilizationRecord', MODEL_TO_PATH.ResourceUtilizationRecord, 'PeopleHubHRIS_Usage_H1_2026', {
    measuresProduct: ref('PeopleHubHRIS_SoftwareProduct'),
    measuredAgainstMetric: ref('PerNamedUserMetric'),
    measuredValue: 340,
    measurementPeriodStart: '2026-01-01',
    measurementPeriodEnd: '2026-06-30',
  });
}

async function main() {
  loadManifest();

  if (RESET) {
    await login();
    await resetPreviousSeed();
  }

  if (!RESET && Object.keys(manifest).length > 0) {
    console.log(`Already seeded (${Object.keys(manifest).length} entities recorded in ${path.basename(MANIFEST_PATH)}). Pass --reset to reseed.`);
    return;
  }

  if (!token) await login();

  console.log(`Seeding apm-instances-sample.ttl's scenario into ${BASE_URL} as ${ADMIN_USERNAME}...`);
  await seed();
  saveManifest();

  const byModel = {};
  for (const key of Object.keys(manifest)) {
    const model = key.split(':')[0];
    byModel[model] = (byModel[model] || 0) + 1;
  }
  console.log(`\nSeeded ${Object.keys(manifest).length} entities:`);
  for (const [model, count] of Object.entries(byModel)) {
    console.log(`  ${model}: ${count}`);
  }
}

main().catch((err) => {
  console.error('Seeding failed:', err.message);
  saveManifest(); // persist whatever succeeded so a retry doesn't recreate it
  process.exitCode = 1;
});
