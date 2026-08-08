const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:OrganizationUnit (ontology/apm-ontology.ttl):
 * "A self-contained unit of the enterprise with defined management
 * responsibility.
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

    costCenterCode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OrganizationUnit', organizationUnitSchema);
