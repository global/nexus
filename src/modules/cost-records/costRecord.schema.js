const mongoose = require('mongoose');
const { COST_CATEGORY_VALUES } = require('../../common/vocabularies');

/**
 * Mongoose schema for apm:CostRecord (ontology/apm-ontology.ttl): "A
 * recorded cost incurred by an application for a specific fiscal year and
 * cost category."
 *
 * `fiscalYear` mirrors the ontology's xsd:gYear datatype as a 4-digit
 * string (e.g. "2025") rather than a full Date, since only the year is
 * meaningful. `costCurrency` is validated as an ISO 4217 code.
 */
const costRecordSchema = new mongoose.Schema(
  {
    // apm:incurredByApplication
    incurredByApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    // apm:hasCostCategory
    hasCostCategory: {
      type: String,
      enum: COST_CATEGORY_VALUES,
      required: true,
    },
    // apm:costAmount
    costAmount: {
      type: Number,
      required: true,
    },
    // apm:costCurrency
    costCurrency: {
      type: String,
      required: true,
      uppercase: true,
      match: [/^[A-Z]{3}$/, 'must be a 3-letter ISO 4217 currency code, e.g. USD or EUR'],
    },
    // apm:fiscalYear
    fiscalYear: {
      type: String,
      required: true,
      match: [/^\d{4}$/, 'must be a 4-digit year, e.g. 2026'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CostRecord', costRecordSchema);
