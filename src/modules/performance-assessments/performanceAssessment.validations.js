const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'ObjectId');
const score1to5 = Joi.number().integer().min(1).max(5);

const baseSchema = {
  assessedBy: objectId,
  businessFitScore: score1to5,
  technicalFitScore: score1to5,
};

const createSchema = Joi.object({
  assessesApplication: objectId.required(),
  assessedOn: Joi.date().required(),
  ...baseSchema,
});

const updateSchema = Joi.object({
  assessesApplication: objectId,
  assessedOn: Joi.date(),
  ...baseSchema,
});

module.exports = { createSchema, updateSchema };
