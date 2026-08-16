const Joi = require('joi');
const { DATA_SENSITIVITY_VALUES } = require('../../common/vocabularies');

const retentionPeriod = Joi.string().pattern(/^P(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?$/, 'ISO 8601 duration');

const baseSchema = {
  description: Joi.string().trim(),
  hasDataSensitivity: Joi.array().items(Joi.string().valid(...DATA_SENSITIVITY_VALUES)),
  retentionPeriod,
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
