const Joi = require('joi');
const { COST_CATEGORY_VALUES } = require('../../common/vocabularies');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'ObjectId');
const currency = Joi.string().uppercase().pattern(/^[A-Z]{3}$/, 'ISO 4217 currency code');
const fiscalYear = Joi.string().pattern(/^\d{4}$/, '4-digit year');

const createSchema = Joi.object({
  incurredByApplication: objectId.required(),
  hasCostCategory: Joi.string().valid(...COST_CATEGORY_VALUES).required(),
  costAmount: Joi.number().required(),
  costCurrency: currency.required(),
  fiscalYear: fiscalYear.required(),
});

const updateSchema = Joi.object({
  incurredByApplication: objectId,
  hasCostCategory: Joi.string().valid(...COST_CATEGORY_VALUES),
  costAmount: Joi.number(),
  costCurrency: currency,
  fiscalYear: fiscalYear,
});

module.exports = { createSchema, updateSchema };
