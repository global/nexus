const Joi = require('joi');
const { DEPENDENCY_PROTOCOL_VALUES, SYNCHRONICITY_VALUES } = require('../../common/vocabularies');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'ObjectId');

// Cross-field rule mirroring apm-shapes.ttl's TechnologyDependencyShape's
// sh:disjoint constraint, for whichever of upstreamTechnologyComponent/
// downstreamTechnologyComponent are actually present in *this* payload. A
// partial update that only touches one side is checked against the stored
// document by technologyDependency.schema.js's own validator instead.
const differentUpstreamAndDownstream = (value, helpers) => {
  if (value.upstreamTechnologyComponent && value.downstreamTechnologyComponent && value.upstreamTechnologyComponent === value.downstreamTechnologyComponent) {
    return helpers.message('downstreamTechnologyComponent must be different from upstreamTechnologyComponent.');
  }
  return value;
};

const baseSchema = {
  usesProtocol: Joi.string().valid(...DEPENDENCY_PROTOCOL_VALUES),
  hasSynchronicity: Joi.string().valid(...SYNCHRONICITY_VALUES),
};

const createSchema = Joi.object({
  upstreamTechnologyComponent: objectId.required(),
  downstreamTechnologyComponent: objectId.required(),
  usesProtocol: Joi.string().valid(...DEPENDENCY_PROTOCOL_VALUES).required(),
  hasSynchronicity: Joi.string().valid(...SYNCHRONICITY_VALUES).required(),
}).custom(differentUpstreamAndDownstream);

const updateSchema = Joi.object({
  upstreamTechnologyComponent: objectId,
  downstreamTechnologyComponent: objectId,
  ...baseSchema,
}).custom(differentUpstreamAndDownstream);

module.exports = { createSchema, updateSchema };
