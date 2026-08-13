const Joi = require('joi');

const createSchema = Joi.object({
  name: Joi.string().trim().required(),
  url: Joi.string().uri().required(),
  lastUpdated: Joi.date(),
});

const updateSchema = Joi.object({
  name: Joi.string().trim(),
  url: Joi.string().uri(),
  lastUpdated: Joi.date(),
});

module.exports = { createSchema, updateSchema };
