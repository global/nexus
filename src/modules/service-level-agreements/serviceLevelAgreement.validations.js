const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'ObjectId');
const slaMetrics = Joi.array().items(objectId).min(1);

const createSchema = Joi.object({
  appliesToApplication: objectId.required(),
  effectiveFrom: Joi.date().required(),
  effectiveTo: Joi.date().required(),
  hasSLAMetric: slaMetrics.required(),
});

const updateSchema = Joi.object({
  appliesToApplication: objectId,
  effectiveFrom: Joi.date(),
  effectiveTo: Joi.date(),
  hasSLAMetric: slaMetrics,
});

module.exports = { createSchema, updateSchema };
