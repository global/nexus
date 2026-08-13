const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'ObjectId');

const createSchema = Joi.object({
  forApplication: objectId.required(),
  contactActor: objectId.required(),
  contactRole: objectId.required(),
});

const updateSchema = Joi.object({
  forApplication: objectId,
  contactActor: objectId,
  contactRole: objectId,
});

module.exports = { createSchema, updateSchema };
