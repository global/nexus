const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:BusinessService (ontology/apm-ontology.ttl): "A
 * unit of business functionality, exposed through a defined interface,
 * that supports a capability."
 *
 * `supportsCapability` is modeled as a single ref — unlike BusinessProcess's
 * `realizesFunction`, the ontology's comment here uses singular language
 * ("supports a capability", "enables a capability"), not "one or more".
 */
const businessServiceSchema = new mongoose.Schema(
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
    // apm:supportsCapability
    supportsCapability: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessCapability',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BusinessService', businessServiceSchema);
