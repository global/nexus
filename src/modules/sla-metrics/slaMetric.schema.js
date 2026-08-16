const mongoose = require('mongoose');
const { SLA_CATEGORY_VALUES } = require('../../common/vocabularies');

/**
 * Mongoose schema for apm:SLAMetric (ontology/apm-ontology.ttl): "A single
 * measurable commitment within an SLA, defined by an open category and a
 * target value with its unit of measure."
 *
 * Like CostRecord/PerformanceAssessment, this is a record-like class with
 * no rdfs:label or name field in the ontology's own sample data — its
 * identity is the (category, targetValue, unitOfMeasure) triple. Cardinality
 * follows apm-shapes.ttl's SLAMetricShape exactly: all three fields are
 * required and single-valued, matching every sample instance.
 *
 * Modeled as its own top-level collection (referenced from
 * ServiceLevelAgreement.hasSLAMetric by ObjectId array) rather than an
 * embedded subdocument, for consistency with every other 1-to-many
 * relationship in this codebase — see the roadmap note for this step.
 */
const slaMetricSchema = new mongoose.Schema(
  {
    // apm:hasSLACategory
    hasSLACategory: {
      type: String,
      enum: SLA_CATEGORY_VALUES,
      required: true,
    },
    // apm:targetValue
    targetValue: {
      type: Number,
      required: true,
    },
    // apm:unitOfMeasure
    unitOfMeasure: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SLAMetric', slaMetricSchema);
