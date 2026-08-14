const mongoose = require('mongoose');
const { DEPENDENCY_PROTOCOL_VALUES, SYNCHRONICITY_VALUES } = require('../../common/vocabularies');

/**
 * Mongoose schema for apm:TechnologyDependency (ontology/apm-ontology.ttl):
 * "A directed dependency between two physical technology components,
 * capturing how one relies on the other." A subclass of the abstract
 * apm:Dependency, which is where usesProtocol/hasSynchronicity are
 * actually declared. Structurally identical to ApplicationDependency,
 * just pointing at PhysicalTechnologyComponent instead of Application.
 *
 * Cardinality follows apm-shapes.ttl's TechnologyDependencyShape exactly:
 * all four fields are required and single-valued, and
 * upstreamTechnologyComponent/downstreamTechnologyComponent must differ.
 */
const technologyDependencySchema = new mongoose.Schema(
  {
    // apm:upstreamTechnologyComponent / apm:downstreamTechnologyComponent
    upstreamTechnologyComponent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PhysicalTechnologyComponent',
      required: true,
    },
    downstreamTechnologyComponent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PhysicalTechnologyComponent',
      required: true,
      validate: {
        // Reliable on `.save()`; Mongoose's update validators don't
        // reliably expose sibling fields on `this` for findByIdAndUpdate,
        // same caveat as ApplicationDependency's equivalent validator.
        validator: function differsFromUpstream(value) {
          if (!this.upstreamTechnologyComponent || !value) return true;
          return String(value) !== String(this.upstreamTechnologyComponent);
        },
        message: 'downstreamTechnologyComponent must be different from upstreamTechnologyComponent.',
      },
    },

    // apm:usesProtocol (declared on apm:Dependency)
    usesProtocol: {
      type: String,
      enum: DEPENDENCY_PROTOCOL_VALUES,
      required: true,
    },
    // apm:hasSynchronicity (declared on apm:Dependency)
    hasSynchronicity: {
      type: String,
      enum: SYNCHRONICITY_VALUES,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TechnologyDependency', technologyDependencySchema);
