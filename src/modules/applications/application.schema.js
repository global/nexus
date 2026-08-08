const mongoose = require('mongoose');
const {
  LIFECYCLE_STATUS_VALUES,
  CRITICALITY_TIER_VALUES,
  INVESTMENT_STRATEGY_VALUES,
  HOSTING_MODEL_VALUES,
  COMPLIANCE_STANDARD_VALUES,
} = require('../../common/vocabularies');

/**
 * Mongoose schema for apm:Application (ontology/apm-ontology.ttl), the
 * ontology's core APM asset. 
 */
const applicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    lifecycleStatus: {
      type: String,
      enum: LIFECYCLE_STATUS_VALUES,
    },
    criticalityTier: {
      type: String,
      enum: CRITICALITY_TIER_VALUES,
    },
    investmentStrategy: {
      type: String,
      enum: INVESTMENT_STRATEGY_VALUES,
    },
    hostingModel: {
      type: String,
      enum: HOSTING_MODEL_VALUES,
    },

    complianceStandards: {
      type: [{ type: String, enum: COMPLIANCE_STANDARD_VALUES }],
      default: [],
    },

    goLiveDate: {
      type: Date,
    },
    recoveryTimeObjective: {
      type: String,
      match: [/^P(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?$/, 'must be an ISO 8601 duration, e.g. PT4H'],
    },
    recoveryPointObjective: {
      type: String,
      match: [/^P(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?$/, 'must be an ISO 8601 duration, e.g. PT1H'],
    },

    owners: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Actor' }],
      validate: {
        validator: (value) => Array.isArray(value) && value.length >= 1,
        message: 'Every application must have at least one owner.',
      },
    },

    organizationUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'OrganizationUnit' },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    capabilities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BusinessCapability' }],
    dataEntities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DataEntity' }],
    technologyServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TechnologyService' }],
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    repositories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CodeRepository' }],
    controls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Control' }],
    logicalComponents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LogicalApplicationComponent' }],
    deployments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PhysicalApplicationComponent' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
