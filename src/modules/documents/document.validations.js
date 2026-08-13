const Joi = require('joi');
const { DOCUMENT_TYPE_VALUES } = require('../../common/vocabularies');

const createSchema = Joi.object({
  name: Joi.string().trim().required(),
  hasDocumentType: Joi.string().valid(...DOCUMENT_TYPE_VALUES),
  url: Joi.string().uri().required(),
  lastUpdated: Joi.date(),
});

const updateSchema = Joi.object({
  name: Joi.string().trim(),
  hasDocumentType: Joi.string().valid(...DOCUMENT_TYPE_VALUES),
  url: Joi.string().uri(),
  lastUpdated: Joi.date(),
});

module.exports = { createSchema, updateSchema };
