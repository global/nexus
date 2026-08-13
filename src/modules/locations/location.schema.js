const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:Location (ontology/apm-ontology.ttl): "A place
 * where business activities are performed or architecture elements
 * operate." A small, catalog-style entity like Role — `name` is unique.
 *
 * `address` mirrors apm:address (domain apm:Location), though the
 * ontology's own sample data never populates it separately, encoding the
 * address inline in rdfs:label instead (e.g. "NexusAPM HQ, Dublin,
 * Ireland") — kept optional here to match that looser real-world usage.
 */
const locationSchema = new mongoose.Schema(
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
    // apm:address
    address: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Location', locationSchema);
