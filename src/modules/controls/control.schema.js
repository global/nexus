const mongoose = require('mongoose');
const { COMPLIANCE_STANDARD_VALUES } = require('../../common/vocabularies');

/**
 * Mongoose schema for apm:Control (ontology/apm-ontology.ttl): "A safeguard
 * or measure implemented to mitigate risk or satisfy a compliance
 * requirement."
 */
const controlSchema = new mongoose.Schema(
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

    // apm:controlReference
    controlReference: {
      type: String,
      trim: true,
    },
    // apm:lastReviewedDate
    lastReviewedDate: {
      type: Date,
    },
    // apm:supportsComplianceStandard
    supportsComplianceStandard: {
      type: [{ type: String, enum: COMPLIANCE_STANDARD_VALUES }],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Control', controlSchema);
