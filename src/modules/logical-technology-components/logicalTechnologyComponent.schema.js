const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:LogicalTechnologyComponent
 * (ontology/apm-ontology.ttl): "An encapsulation of technology
 * infrastructure, independent of vendor or product."
 *
 * `providesTechnologyService` is modeled as a single ref — no "one or
 * more" language in the ontology's comment (unlike BusinessProcess's
 * realizesFunction), and no sample instances to check against.
 */
const logicalTechnologyComponentSchema = new mongoose.Schema(
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
    // apm:providesTechnologyService
    providesTechnologyService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TechnologyService',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LogicalTechnologyComponent', logicalTechnologyComponentSchema);
