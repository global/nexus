const Joi = require('joi');

const createSchema = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().trim(),
  address: Joi.string().trim(),
});

const updateSchema = Joi.object({
  name: Joi.string().trim(),
  description: Joi.string().trim(),
  address: Joi.string().trim(),
});

module.exports = { createSchema, updateSchema };
