/**
 * Controlled Vocabulary lists for the Nexus Insight APM Knowledge Graph.
 *
 * Each vocabulary mirrors the individuals declared for its corresponding
 * `owl:Class` in `ontology/apm-ontology.ttl` 
 * 
 * `value` is the ontology's local name (safe to use as a Mongoose enum value / JSON API token); 
 * `label` and `description` are copied from the individual's `rdfs:label` / `rdfs:comment`.
 *
 * These lists should be kept in sync with the ontology. These are immutable objects (frozen) 
 * to prevent accidental modification at runtime.
 * @module common/vocabularies
 */

/** @see apm:LifecycleStatus */
const LIFECYCLE_STATUSES = Object.freeze([
  { value: 'Planned', label: 'Planned', description: 'The application is planned but not yet in development.' },
  { value: 'Development', label: 'Development', description: 'The application is being built and is not yet in production use.' },
  { value: 'Operate', label: 'Operate', description: 'The application is in production use.' },
  { value: 'Retired', label: 'Retired', description: 'The application has been decommissioned and is no longer in use.' },
]);
const LIFECYCLE_STATUS_VALUES = LIFECYCLE_STATUSES.map((v) => v.value);

/** @see apm:CriticalityTier */
const CRITICALITY_TIERS = Object.freeze([
  { value: 'Critical', label: 'Critical', description: 'An outage would cause severe disruption to the business.' },
  { value: 'High', label: 'High', description: 'An outage would cause significant disruption to the business.' },
  { value: 'Medium', label: 'Medium', description: 'An outage would cause moderate disruption to the business.' },
  { value: 'Low', label: 'Low', description: 'An outage would cause minimal disruption to the business.' },
]);
const CRITICALITY_TIER_VALUES = CRITICALITY_TIERS.map((v) => v.value);

/** @see apm:InvestmentStrategy (Gartner TIME) */
const INVESTMENT_STRATEGIES = Object.freeze([
  { value: 'Tolerate', label: 'Tolerate', description: 'High technical fit but low business fit; kept running as-is since it is cheap to maintain.' },
  { value: 'Invest', label: 'Invest', description: 'High technical fit and high business fit; funding is committed to grow or enhance the application.' },
  { value: 'Migrate', label: 'Migrate', description: 'Low technical fit but high business fit; a valuable capability in need of a technical replacement.' },
  { value: 'Eliminate', label: 'Eliminate', description: 'Low technical fit and low business fit; the application is a candidate for retirement.' },
]);
const INVESTMENT_STRATEGY_VALUES = INVESTMENT_STRATEGIES.map((v) => v.value);

/** @see apm:ComplianceStandard */
const COMPLIANCE_STANDARDS = Object.freeze([
  { value: 'SOC2', label: 'SOC 2', description: 'AICPA Service Organization Control 2, covering security, availability, and privacy of customer data.' },
  { value: 'HIPAA', label: 'HIPAA', description: 'U.S. Health Insurance Portability and Accountability Act, covering the protection of health information.' },
  { value: 'GDPR', label: 'GDPR', description: 'EU General Data Protection Regulation, covering the processing of personal data.' },
  { value: 'PCIDSS', label: 'PCI DSS', description: 'Payment Card Industry Data Security Standard, covering the handling of cardholder data.' },
  { value: 'ISO27001', label: 'ISO/IEC 27001', description: 'International standard for information security management systems.' },
]);
const COMPLIANCE_STANDARD_VALUES = COMPLIANCE_STANDARDS.map((v) => v.value);

/** @see apm:HostingModel */
const HOSTING_MODELS = Object.freeze([
  { value: 'ExternallyHosted', label: 'Externally Hosted', description: "The application's infrastructure is hosted and operated by an external vendor, such as a SaaS or cloud provider." },
  { value: 'InternallyHosted', label: 'Internally Hosted', description: "The application's infrastructure is hosted and operated within the organization's own environment." },
  { value: 'Hybrid', label: 'Hybrid', description: "The application's infrastructure is split between externally hosted and internally hosted components." },
]);
const HOSTING_MODEL_VALUES = HOSTING_MODELS.map((v) => v.value);

/** @see apm:CostCategory */
const COST_CATEGORIES = Object.freeze([
  { value: 'Licensing', label: 'Licensing', description: 'Cost incurred from software licenses and entitlements.' },
  { value: 'Infrastructure', label: 'Infrastructure', description: 'Cost incurred from hosting and technology infrastructure.' },
  { value: 'Support', label: 'Support', description: 'Cost incurred from vendor or internal support and maintenance.' },
  { value: 'Labor', label: 'Labor', description: 'Cost incurred from personnel who build, operate, or support the application.' },
]);
const COST_CATEGORY_VALUES = COST_CATEGORIES.map((v) => v.value);

/** @see apm:FindingCategory */
const FINDING_CATEGORIES = Object.freeze([
  { value: 'Vulnerability', label: 'Vulnerability', description: 'A security weakness that could be exploited, such as a CVE or misconfiguration.' },
  { value: 'TechnicalRisk', label: 'Technical Risk', description: 'A condition that threatens the stability, supportability, or continuity of the technology.' },
  { value: 'BusinessRisk', label: 'Business Risk', description: 'A condition that threatens the delivery of a business capability.' },
  { value: 'ControlGap', label: 'Control Gap', description: 'A missing or deficient control against an architectural, operational, or compliance requirement.' },
]);
const FINDING_CATEGORY_VALUES = FINDING_CATEGORIES.map((v) => v.value);

/** @see apm:FindingStatus */
const FINDING_STATUSES = Object.freeze([
  { value: 'Open', label: 'Open', description: 'The finding has been identified and remediation has not yet started.' },
  { value: 'InRemediation', label: 'In Remediation', description: 'Remediation of the finding is actively underway.' },
  { value: 'Remediated', label: 'Remediated', description: 'The underlying issue has been fixed and verified.' },
  { value: 'RiskAccepted', label: 'Risk Accepted', description: 'The finding will not be remediated; the associated risk has been formally accepted.' },
  { value: 'Closed', label: 'Closed', description: 'The finding requires no further action, whether through remediation or accepted risk.' },
]);
const FINDING_STATUS_VALUES = FINDING_STATUSES.map((v) => v.value);

/** @see apm:ImpactType */
const IMPACT_TYPES = Object.freeze([
  { value: 'DataBreach', label: 'Data Breach', description: 'Unauthorized access to or disclosure of sensitive data.' },
  { value: 'ServiceOutage', label: 'Service Outage', description: 'Disruption or unavailability of the application or its dependent services.' },
  { value: 'RegulatoryFine', label: 'Regulatory Fine', description: 'A financial penalty imposed for failing to meet a legal or compliance obligation.' },
  { value: 'ReputationalDamage', label: 'Reputational Damage', description: 'Loss of trust or standing with customers, partners, or the public.' },
  { value: 'FinancialLoss', label: 'Financial Loss', description: 'Direct monetary loss not attributable to a regulatory fine.' },
  { value: 'SafetyRisk', label: 'Safety Risk', description: 'Potential for physical harm to people or damage to physical assets.' },
  { value: 'ContractualBreach', label: 'Contractual Breach', description: 'Failure to meet an obligation owed to a customer, partner, or supplier under contract.' },
]);
const IMPACT_TYPE_VALUES = IMPACT_TYPES.map((v) => v.value);

/** @see apm:DataSensitivity */
const DATA_SENSITIVITIES = Object.freeze([
  { value: 'Public', label: 'Public', description: 'Data intended for unrestricted public disclosure.' },
  { value: 'Internal', label: 'Internal', description: 'Data intended for use within the organization, not for public disclosure.' },
  { value: 'Confidential', label: 'Confidential', description: 'Sensitive business data whose disclosure could cause competitive or financial harm.' },
  { value: 'HighlyConfidential', label: 'Highly Confidential', description: 'Extremely sensitive business data whose disclosure could cause severe competitive, financial, or reputational harm, such as trade secrets.' },
  { value: 'PII', label: 'PII', description: 'Personally identifiable information that can be used to identify a specific individual.' },
  { value: 'PHI', label: 'PHI', description: "Protected health information relating to an individual's health status or care, as defined under HIPAA." },
]);
const DATA_SENSITIVITY_VALUES = DATA_SENSITIVITIES.map((v) => v.value);

/** @see apm:SLACategory */
const SLA_CATEGORIES = Object.freeze([
  { value: 'Availability', label: 'Availability', description: 'The proportion of time an application is operational and accessible, typically expressed as a percentage.' },
  { value: 'Throughput', label: 'Throughput', description: 'The volume of work an application can process in a given period, such as requests or transactions per second.' },
  { value: 'ResponseTime', label: 'Response Time', description: 'The time taken for an application to respond to a request.' },
  { value: 'ResolutionTime', label: 'Resolution Time', description: 'The time taken to resolve a reported incident affecting an application.' },
]);
const SLA_CATEGORY_VALUES = SLA_CATEGORIES.map((v) => v.value);

/** @see apm:Environment */
const ENVIRONMENTS = Object.freeze([
  { value: 'Production', label: 'Production', description: 'The live environment serving actual business operations and end users.' },
  { value: 'Staging', label: 'Staging', description: 'A pre-production environment used to validate changes under production-like conditions.' },
  { value: 'DevelopmentEnvironment', label: 'Development', description: 'An environment used for active software development and unit testing.' },
  { value: 'Test', label: 'Test', description: 'An environment used for formal testing activities, such as QA or user acceptance testing.' },
  { value: 'DisasterRecovery', label: 'Disaster Recovery', description: 'A standby environment maintained to restore production operations following a disruption.' },
]);
const ENVIRONMENT_VALUES = ENVIRONMENTS.map((v) => v.value);

/** @see apm:DependencyProtocol */
const DEPENDENCY_PROTOCOLS = Object.freeze([
  { value: 'RESTAPI', label: 'REST API', description: 'Interaction over a RESTful HTTP API.' },
  { value: 'SOAP', label: 'SOAP', description: 'Interaction over the SOAP messaging protocol.' },
  { value: 'MessageQueue', label: 'Message Queue', description: 'Interaction via an asynchronous message broker or queue.' },
  { value: 'FileTransfer', label: 'File Transfer', description: 'Interaction via the exchange of files, such as SFTP or batch file drops.' },
  { value: 'DatabaseConnection', label: 'Database Connection', description: 'Interaction via a direct database connection, such as JDBC or ODBC.' },
  { value: 'RPC', label: 'RPC', description: 'Interaction via a remote procedure call framework, such as gRPC.' },
]);
const DEPENDENCY_PROTOCOL_VALUES = DEPENDENCY_PROTOCOLS.map((v) => v.value);

/** @see apm:Synchronicity */
const SYNCHRONICITIES = Object.freeze([
  { value: 'Synchronous', label: 'Synchronous', description: 'The calling asset blocks and waits for an immediate response, so an upstream failure propagates immediately.' },
  { value: 'Asynchronous', label: 'Asynchronous', description: 'The calling asset does not wait for an immediate response, so an upstream failure is buffered or delayed.' },
  { value: 'Batch', label: 'Batch', description: 'The interaction occurs on a scheduled cycle rather than on demand, so an upstream failure is only noticed at the next run.' },
]);
const SYNCHRONICITY_VALUES = SYNCHRONICITIES.map((v) => v.value);

module.exports = {
  LIFECYCLE_STATUSES,
  LIFECYCLE_STATUS_VALUES,
  CRITICALITY_TIERS,
  CRITICALITY_TIER_VALUES,
  INVESTMENT_STRATEGIES,
  INVESTMENT_STRATEGY_VALUES,
  COMPLIANCE_STANDARDS,
  COMPLIANCE_STANDARD_VALUES,
  HOSTING_MODELS,
  HOSTING_MODEL_VALUES,
  COST_CATEGORIES,
  COST_CATEGORY_VALUES,
  FINDING_CATEGORIES,
  FINDING_CATEGORY_VALUES,
  FINDING_STATUSES,
  FINDING_STATUS_VALUES,
  IMPACT_TYPES,
  IMPACT_TYPE_VALUES,
  DATA_SENSITIVITIES,
  DATA_SENSITIVITY_VALUES,
  SLA_CATEGORIES,
  SLA_CATEGORY_VALUES,
  ENVIRONMENTS,
  ENVIRONMENT_VALUES,
  DEPENDENCY_PROTOCOLS,
  DEPENDENCY_PROTOCOL_VALUES,
  SYNCHRONICITIES,
  SYNCHRONICITY_VALUES,
};
