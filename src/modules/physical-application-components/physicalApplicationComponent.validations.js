const Joi = require('joi');
const { ENVIRONMENT_VALUES } = require('../../common/vocabularies');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'ObjectId');

const baseSchema = {
  description: Joi.string().trim(),
  assetIdentifier: Joi.string().trim(),
  hasEnvironment: Joi.string().valid(...ENVIRONMENT_VALUES),
  realizesLogicalComponent: objectId,
  deployedOn: objectId,
  identifiedBy: objectId,
};

const createSchema = Joi.object({
  name: Joi.string().trim().required(),
  ...baseSchema,
});

const updateSchema = Joi.object({
  name: Joi.string().trim(),
  ...baseSchema,
});

module.exports = { createSchema, updateSchema };
