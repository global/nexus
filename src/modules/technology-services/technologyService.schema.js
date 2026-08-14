const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:TechnologyService (ontology/apm-ontology.ttl):
 * "A technical capability supporting application and infrastructure
 * services." A leaf, catalog-style entity like BusinessFunction — `name`
 * is unique. No individuals exist in the ontology's own sample dataset for
 * this class.
 */
const technologyServiceSchema = new mongoose.Schema(
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

module.exports = mongoose.model('TechnologyService', technologyServiceSchema);
