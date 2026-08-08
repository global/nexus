const Joi = require('joi');
const {
  LIFECYCLE_STATUS_VALUES,
  CRITICALITY_TIER_VALUES,
  INVESTMENT_STRATEGY_VALUES,
  HOSTING_MODEL_VALUES,
  COMPLIANCE_STANDARD_VALUES,
} = require('../../common/vocabularies');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'ObjectId');

const durationPattern = /^P(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?$/;

const baseSchema = {
  description: Joi.string().trim(),
  lifecycleStatus: Joi.string().valid(...LIFECYCLE_STATUS_VALUES),
  criticalityTier: Joi.string().valid(...CRITICALITY_TIER_VALUES),
  investmentStrategy: Joi.string().valid(...INVESTMENT_STRATEGY_VALUES),
  hostingModel: Joi.string().valid(...HOSTING_MODEL_VALUES),
  complianceStandards: Joi.array().items(Joi.string().valid(...COMPLIANCE_STANDARD_VALUES)),
  goLiveDate: Joi.date(),
  recoveryTimeObjective: Joi.string().pattern(durationPattern, 'ISO 8601 duration'),
  recoveryPointObjective: Joi.string().pattern(durationPattern, 'ISO 8601 duration'),
  organizationUnit: objectId,
  supplier: objectId,
  capabilities: Joi.array().items(objectId),
  dataEntities: Joi.array().items(objectId),
  technologyServices: Joi.array().items(objectId),
  documents: Joi.array().items(objectId),
  repositories: Joi.array().items(objectId),
  controls: Joi.array().items(objectId),
  logicalComponents: Joi.array().items(objectId),
  deployments: Joi.array().items(objectId),
};

const createSchema = Joi.object({
  name: Joi.string().trim().required(),
  owners: Joi.array().items(objectId).min(1).required(),
  ...baseSchema,
});

const updateSchema = Joi.object({
  name: Joi.string().trim(),
  owners: Joi.array().items(objectId).min(1),
  ...baseSchema,
});

module.exports = { createSchema, updateSchema };
