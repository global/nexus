const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:ServiceLevelAgreement (ontology/apm-ontology.ttl):
 * "A recorded service level agreement for an application, covering a
 * specific effective period and one or more owner-defined metrics."
 *
 * Cardinality follows apm-shapes.ttl's ServiceLevelAgreementShape exactly:
 * appliesToApplication/effectiveFrom/effectiveTo are required and
 * single-valued; hasSLAMetric requires at least one, per the ontology's
 * "one or more owner-defined metrics" wording — every sample instance has
 * exactly two.
 */
const serviceLevelAgreementSchema = new mongoose.Schema(
  {
    // apm:appliesToApplication
    appliesToApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    // apm:effectiveFrom / apm:effectiveTo
    effectiveFrom: {
      type: Date,
      required: true,
    },
    effectiveTo: {
      type: Date,
      required: true,
    },
    // apm:hasSLAMetric
    hasSLAMetric: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SLAMetric' }],
      validate: {
        validator: (value) => Array.isArray(value) && value.length >= 1,
        message: 'Every Service Level Agreement must have at least one SLA Metric.',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceLevelAgreement', serviceLevelAgreementSchema);
