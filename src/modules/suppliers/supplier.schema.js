const mongoose = require('mongoose');
const { COMPLIANCE_STANDARD_VALUES } = require('../../common/vocabularies');

/**
 * Mongoose schema for apm:Supplier (ontology/apm-ontology.ttl): "A
 * third-party vendor that publishes a software product or hosts an
 * application on the organization's behalf." 
 */
const supplierSchema = new mongoose.Schema(
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

    certifications: {
      type: [{ type: String, enum: COMPLIANCE_STANDARD_VALUES }],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema);
