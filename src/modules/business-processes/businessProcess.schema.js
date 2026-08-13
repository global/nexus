const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:BusinessProcess (ontology/apm-ontology.ttl): "A
 * sequence of activities that realises one or more business functions."
 *
 * `realizesFunction` is modeled as an array per the ontology's own "one or
 * more business functions" wording — no shape constrains its cardinality,
 * and there are no sample instances of this class to check against, but
 * the plural in the ontology's comment is a direct, unambiguous signal
 * (unlike e.g. ApplicationDependency.usesProtocol, whose "one or more"
 * comment was contradicted by every sample instance actually using one).
 */
const businessProcessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // apm:realizesFunction
    realizesFunction: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BusinessFunction' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('BusinessProcess', businessProcessSchema);
