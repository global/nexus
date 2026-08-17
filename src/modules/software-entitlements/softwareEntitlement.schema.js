const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:SoftwareEntitlement (ontology/apm-ontology.ttl,
 * ISO/IEC 19770-3): "The legal usage rights held for a software asset."
 *
 * Own top-level collection, referenced from SoftwareProduct.coveredByEntitlement,
 * consistent with every other relation in this codebase. No unique `name` —
 * a record-like class like CostRecord/PerformanceAssessment, not a catalog.
 */
const softwareEntitlementSchema = new mongoose.Schema(
  {
    // apm:entitledQuantity — quantity of usage rights granted, per the metric.
    entitledQuantity: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: 'entitledQuantity must be an integer.',
      },
    },

    // apm:measuredByMetric — the Metric the grant/consumption is assessed by.
    measuredByMetric: { type: mongoose.Schema.Types.ObjectId, ref: 'Metric', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SoftwareEntitlement', softwareEntitlementSchema);
