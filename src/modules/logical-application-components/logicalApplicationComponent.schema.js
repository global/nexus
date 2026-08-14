const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:LogicalApplicationComponent
 * (ontology/apm-ontology.ttl): "An encapsulation of application
 * functionality, independent of vendor or technology." A leaf,
 * catalog-style entity like TechnologyService — `name` is unique. The
 * ontology's own sample instances only ever populate rdfs:label.
 */
const logicalApplicationComponentSchema = new mongoose.Schema(
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

module.exports = mongoose.model('LogicalApplicationComponent', logicalApplicationComponentSchema);
