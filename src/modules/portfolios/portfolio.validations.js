const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'ObjectId');
const applications = Joi.array().items(objectId).min(1);

const createSchema = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().trim(),
  containsApplication: applications.required(),
  portfolioOwner: objectId.required(),
  alignsToCapability: objectId.required(),
});

const updateSchema = Joi.object({
  name: Joi.string().trim(),
  description: Joi.string().trim(),
  containsApplication: applications,
  portfolioOwner: objectId,
  alignsToCapability: objectId,
});

module.exports = { createSchema, updateSchema };
