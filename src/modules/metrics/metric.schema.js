const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:Metric (ontology/apm-ontology.ttl, ISO/IEC
 * 19770-3): "The unit used to measure a software entitlement, such as
 * per-user or per-device."
 *
 * A small, catalog-style entity like Role/Control/Supplier — `name` is
 * unique. The ontology's sample data only ever populates rdfs:label for
 * Metric individuals (e.g. "Per Named User"), no rdfs:comment, so
 * `description` is optional here too.
 */
const metricSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Metric', metricSchema);
