const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:ResourceUtilizationRecord
 * (ontology/apm-ontology.ttl, ISO/IEC 19770-4): "A recorded measurement of
 * actual resource consumption for a software product over a specific
 * period."
 *
 * Own top-level collection, referenced-style like CostRecord — no unique
 * `name`, a record-like class rather than a catalog.
 */
const resourceUtilizationRecordSchema = new mongoose.Schema(
  {
    // apm:measuresProduct
    measuresProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'SoftwareProduct', required: true },

    // apm:measuredAgainstMetric
    measuredAgainstMetric: { type: mongoose.Schema.Types.ObjectId, ref: 'Metric', required: true },

    // apm:measuredValue
    measuredValue: { type: Number, required: true },

    // apm:measurementPeriodStart / apm:measurementPeriodEnd
    measurementPeriodStart: { type: Date, required: true },
    measurementPeriodEnd: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResourceUtilizationRecord', resourceUtilizationRecordSchema);
