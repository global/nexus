const mongoose = require('mongoose');
const { DEPENDENCY_PROTOCOL_VALUES, SYNCHRONICITY_VALUES } = require('../../common/vocabularies');

/**
 * Mongoose schema for apm:ApplicationDependency (ontology/apm-ontology.ttl):
 * "A directed dependency between two applications, capturing how one relies
 * on the other." 
 *
 * Cardinality follows apm-shapes.ttl's ApplicationDependencyShape exactly:
 * all four fields are required and single-valued, and upstreamApplication/
 * downstreamApplication must differ (a dependency can't point at itself).
 */
const applicationDependencySchema = new mongoose.Schema(
  {
    // apm:upstreamApplication / apm:downstreamApplication
    upstreamApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    downstreamApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      validate: {
        // Verify that downstreamApplication is different from upstreamApplication to avoid self-referential dependencies.
        validator: function differsFromUpstream(value) {
          if (!this.upstreamApplication || !value) return true;
          return String(value) !== String(this.upstreamApplication);
        },
        message: 'downstreamApplication must be different from upstreamApplication.',
      },
    },
    usesProtocol: {
      type: String,
      enum: DEPENDENCY_PROTOCOL_VALUES,
      required: true,
    },
    hasSynchronicity: {
      type: String,
      enum: SYNCHRONICITY_VALUES,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ApplicationDependency', applicationDependencySchema);
