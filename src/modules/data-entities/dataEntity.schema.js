const mongoose = require('mongoose');
const { DATA_SENSITIVITY_VALUES } = require('../../common/vocabularies');

/**
 * Mongoose schema for apm:DataEntity (ontology/apm-ontology.ttl): "A
 * business-recognised concept of data, independent of its
 * implementation."
 *
 * `hasDataSensitivity` is modeled as an array — two of the four sample
 * instances carry multiple sensitivity classifications at once (e.g.
 * PayrollRecord is both PII and Confidential), unlike single-valued
 * properties elsewhere in this codebase.
 *
 * `retentionPeriod` mirrors the ontology's xsd:duration datatype the same
 * way Application.recoveryTimeObjective/recoveryPointObjective do — an
 * ISO 8601 duration string, validated by regex, since no sample instance
 * actually populates it (optional).
 */
const dataEntitySchema = new mongoose.Schema(
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
    // apm:hasDataSensitivity
    hasDataSensitivity: {
      type: [{ type: String, enum: DATA_SENSITIVITY_VALUES }],
      default: [],
    },
    // apm:retentionPeriod
    retentionPeriod: {
      type: String,
      match: [/^P(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?$/, 'must be an ISO 8601 duration, e.g. P7Y'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DataEntity', dataEntitySchema);
