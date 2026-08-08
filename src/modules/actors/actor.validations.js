const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'ObjectId');

const baseSchema = {
  description: Joi.string().trim(),
  emailAddress: Joi.string().trim().lowercase().email({ tlds: { allow: false } }),
  phoneNumber: Joi.string().trim(),
  role: objectId,
  organizationUnit: objectId,
  businessProcesses: Joi.array().items(objectId),
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
