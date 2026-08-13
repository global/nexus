const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:BusinessFunction (ontology/apm-ontology.ttl): "A
 * unit of business behaviour that delivers capability, independent of
 * organisational structure." A leaf, catalog-style entity like Role —
 * `name` is unique. No individuals exist in the ontology's own sample
 * dataset for this class, so there's no real-world usage to mirror beyond
 * the class's own definition.
 */
const businessFunctionSchema = new mongoose.Schema(
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

module.exports = mongoose.model('BusinessFunction', businessFunctionSchema);
