const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:PerformanceAssessment (ontology/apm-ontology.ttl):
 * "A point-in-time evaluation of an application's business and technical
 * fit, enabling trend tracking across assessment cycles."
 *
 * Cardinality follows apm-shapes.ttl's PerformanceAssessmentShape exactly:
 * assessesApplication and assessedOn are required and single-valued;
 * businessFitScore/technicalFitScore are optional but must be an integer
 * 1-5 when present. assessedBy has no cardinality constraint in the shape
 * (or in the ontology beyond its range), so it's a plain optional ref.
 */
const performanceAssessmentSchema = new mongoose.Schema(
  {
    // apm:assessesApplication
    assessesApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    // apm:assessedBy
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Actor',
    },
    // apm:businessFitScore
    businessFitScore: {
      type: Number,
      min: 1,
      max: 5,
      validate: { validator: Number.isInteger, message: 'businessFitScore must be an integer.' },
    },
    // apm:technicalFitScore
    technicalFitScore: {
      type: Number,
      min: 1,
      max: 5,
      validate: { validator: Number.isInteger, message: 'technicalFitScore must be an integer.' },
    },
    // apm:assessedOn
    assessedOn: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PerformanceAssessment', performanceAssessmentSchema);
