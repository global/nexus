const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'ObjectId');

const baseSchema = {
  swidTagId: Joi.string().trim(),
  version: Joi.string().trim(),
  endOfLifeDate: Joi.date(),
  endOfSupportDate: Joi.date(),
  suppliedBy: objectId,
  coveredByEntitlement: objectId,
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
