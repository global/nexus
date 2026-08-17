const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'ObjectId');

const createSchema = Joi.object({
  entitledQuantity: Joi.number().integer().required(),
  measuredByMetric: objectId.required(),
});

const updateSchema = Joi.object({
  entitledQuantity: Joi.number().integer(),
  measuredByMetric: objectId,
});

module.exports = { createSchema, updateSchema };
