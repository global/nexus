const Joi = require('joi');
const { SLA_CATEGORY_VALUES } = require('../../common/vocabularies');

const createSchema = Joi.object({
  hasSLACategory: Joi.string().valid(...SLA_CATEGORY_VALUES).required(),
  targetValue: Joi.number().required(),
  unitOfMeasure: Joi.string().trim().required(),
});

const updateSchema = Joi.object({
  hasSLACategory: Joi.string().valid(...SLA_CATEGORY_VALUES),
  targetValue: Joi.number(),
  unitOfMeasure: Joi.string().trim(),
});

module.exports = { createSchema, updateSchema };
