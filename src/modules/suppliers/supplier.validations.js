const Joi = require('joi');
const { COMPLIANCE_STANDARD_VALUES } = require('../../common/vocabularies');

const baseSchema = {
  description: Joi.string().trim(),
  certifications: Joi.array().items(Joi.string().valid(...COMPLIANCE_STANDARD_VALUES)),
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
