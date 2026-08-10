const mongoose = require('mongoose');
const { FINDING_CATEGORY_VALUES, FINDING_STATUS_VALUES, IMPACT_TYPE_VALUES } = require('../../common/vocabularies');

/**
 * Mongoose schema for apm:Finding (ontology/apm-ontology.ttl): "A recorded
 * vulnerability, technical risk, business risk, or control gap identified
 * against an application or technology component, tracked through its
 * remediation lifecycle."
 *
 * Unlike every other module so far, Finding has no rdfs:label in the
 * ontology's own sample data — `findingDetails` is its only descriptive
 * text, so it's used here in place of a `name` field (required, since
 * every sample instance populates it and a Finding with no description
 * text would be meaningless).
 *
 * Cardinality follows apm-shapes.ttl's FindingShape exactly:
 *  - `findingCategory`/`findingStatus`: required, single (sh:minCount 1,
 *    sh:maxCount 1) — the only enum fields across all modules so far where
 *    SHACL actually mandates presence, not just bounds cardinality.
 *  - `riskScore`/`likelihoodScore`/`impactScore`: optional, integer 1-5.
 *  - `cvssScore`: optional, decimal 0.0-10.0, AND — per the separate
 *    FindingCvssOnlyForVulnerabilityShape — only valid when
 *    findingCategory is 'Vulnerability'. Enforced below via a custom
 *    validator rather than left as a documentation-only constraint.
 *
 * `application`/`applicationComponent`/`technologyComponent` mirror the
 * ontology's three separate affects* properties (a Finding relates to at
 * most one "subject", but the ontology models that as three optional
 * properties rather than one polymorphic reference, so this does too).
 * `applicationComponent`/`technologyComponent` point at collections that
 * don't exist as Mongoose models yet.
 */
const findingSchema = new mongoose.Schema(
  {
    findingDetails: {
      type: String,
      required: true,
      trim: true,
    },

    // apm:hasFindingCategory / apm:hasFindingStatus — required per apm-shapes.ttl
    findingCategory: {
      type: String,
      enum: FINDING_CATEGORY_VALUES,
      required: true,
    },
    findingStatus: {
      type: String,
      enum: FINDING_STATUS_VALUES,
      required: true,
      default: 'Open',
    },

    // apm:affectsApplication / apm:affectsApplicationComponent / apm:affectsTechnologyComponent
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    applicationComponent: { type: mongoose.Schema.Types.ObjectId, ref: 'PhysicalApplicationComponent' },
    technologyComponent: { type: mongoose.Schema.Types.ObjectId, ref: 'PhysicalTechnologyComponent' },

    // apm:threatensCapability / apm:relatesToControl
    threatenedCapability: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessCapability' },
    relatedControl: { type: mongoose.Schema.Types.ObjectId, ref: 'Control' },

    // apm:hasImpactType
    impactTypes: {
      type: [{ type: String, enum: IMPACT_TYPE_VALUES }],
      default: [],
    },

    // apm:cveId
    cveId: {
      type: String,
      trim: true,
    },
    // apm:cvssScore — see FindingCvssOnlyForVulnerabilityShape
    cvssScore: {
      type: Number,
      min: 0.0,
      max: 10.0,
      validate: {
        validator: function isCvssOnlyForVulnerability(value) {
          if (value === undefined || value === null) return true;
          // On `.save()` (create, or an already-fetched document being
          // modified and saved), `this` is the full document, so
          // `findingCategory` is reliably present and this check is exact.
          // On `findByIdAndUpdate`, Mongoose's update validators don't
          // reliably expose sibling fields on `this` — `findingCategory`
          // comes back undefined even when it genuinely is 'Vulnerability'
          // in the database. Rather than reject a legitimate update we
          // can't actually evaluate, defer to finding.service.js's `update`,
          // which looks the stored category up before calling the
          // repository and is the real enforcement point for that path.
          if (this.findingCategory === undefined) return true;
          return this.findingCategory === 'Vulnerability';
        },
        message: 'cvssScore may only be populated on a Finding categorized as Vulnerability.',
      },
    },

    // apm:identifiedOn / apm:dueDate / apm:resolvedDate
    identifiedOn: { type: Date },
    dueDate: { type: Date },
    resolvedDate: { type: Date },

    // apm:riskScore / apm:likelihoodScore / apm:impactScore
    riskScore: { type: Number, min: 1, max: 5, validate: { validator: Number.isInteger, message: 'riskScore must be an integer.' } },
    likelihoodScore: { type: Number, min: 1, max: 5, validate: { validator: Number.isInteger, message: 'likelihoodScore must be an integer.' } },
    impactScore: { type: Number, min: 1, max: 5, validate: { validator: Number.isInteger, message: 'impactScore must be an integer.' } },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Finding', findingSchema);
