const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'ObjectId');

const createSchema = Joi.object({
  measuresProduct: objectId.required(),
  measuredAgainstMetric: objectId.required(),
  measuredValue: Joi.number().required(),
  measurementPeriodStart: Joi.date().required(),
  measurementPeriodEnd: Joi.date().required(),
});

const updateSchema = Joi.object({
  measuresProduct: objectId,
  measuredAgainstMetric: objectId,
  measuredValue: Joi.number(),
  measurementPeriodStart: Joi.date(),
  measurementPeriodEnd: Joi.date(),
});

module.exports = { createSchema, updateSchema };
