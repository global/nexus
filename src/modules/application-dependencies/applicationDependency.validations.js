const Joi = require('joi');
const { DEPENDENCY_PROTOCOL_VALUES, SYNCHRONICITY_VALUES } = require('../../common/vocabularies');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'ObjectId');

const differentUpstreamAndDownstream = (value, helpers) => {
  if (value.upstreamApplication && value.downstreamApplication && value.upstreamApplication === value.downstreamApplication) {
    return helpers.message('downstreamApplication must be different from upstreamApplication.');
  }
  return value;
};

const baseSchema = {
  usesProtocol: Joi.string().valid(...DEPENDENCY_PROTOCOL_VALUES),
  hasSynchronicity: Joi.string().valid(...SYNCHRONICITY_VALUES),
};

const createSchema = Joi.object({
  upstreamApplication: objectId.required(),
  downstreamApplication: objectId.required(),
  usesProtocol: Joi.string().valid(...DEPENDENCY_PROTOCOL_VALUES).required(),
  hasSynchronicity: Joi.string().valid(...SYNCHRONICITY_VALUES).required(),
}).custom(differentUpstreamAndDownstream);

const updateSchema = Joi.object({
  upstreamApplication: objectId,
  downstreamApplication: objectId,
  ...baseSchema,
}).custom(differentUpstreamAndDownstream);

module.exports = { createSchema, updateSchema };
