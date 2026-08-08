const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'ObjectId');

const baseSchema = {
  description: Joi.string().trim(),
  capabilityWeight: Joi.number().integer().min(1).max(5),
  capabilityLevel: Joi.number().integer().min(1).max(3),
  parentCapability: objectId,
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
