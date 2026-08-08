const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:OrganizationUnit (ontology/apm-ontology.ttl):
 * "A self-contained unit of the enterprise with defined management
 * responsibility." `name`/`description` map to the ontology's
 * rdfs:label/rdfs:comment convention.
 *
 * No apm-shapes.ttl OrganizationUnitShape exists. `location` is modeled as
 * a single reference (not an array): apm:locatedAt's own comment reads
 * singular ("operates at certain location") and every sample instance has
 * exactly one. It points at the `Location` collection, which doesn't exist
 * as a Mongoose model yet — storage/validation of its ObjectId works today,
 * `.populate()` will resolve once that module exists.
 */
const organizationUnitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    // apm:costCenterCode — unique when present, like a real finance system's code.
    costCenterCode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    // apm:locatedAt
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OrganizationUnit', organizationUnitSchema);
