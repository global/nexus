const mongoose = require('mongoose');
const { ENVIRONMENT_VALUES } = require('../../common/vocabularies');

/**
 * Mongoose schema for apm:PhysicalApplicationComponent
 * (ontology/apm-ontology.ttl): "A deployable instance that realises one or
 * more logical application components."
 *
 * `assetIdentifier`/`hasEnvironment` are shared with
 * PhysicalTechnologyComponent (union domain in the ontology) — same
 * unique+sparse treatment for assetIdentifier as that module.
 * `identifiedBy` ranges over apm:SoftwareProduct, which has no Mongoose
 * module yet (roadmap step 23) — stored as a plain ObjectId ref like
 * every other forward-reference in this codebase (e.g.
 * Application.dataEntities), safe to write today, populatable once that
 * module exists.
 *
 * No shape exists for this class; the ontology's three sample instances
 * never all populate the same fields (one has no realizesLogicalComponent/
 * deployedOn, another has no identifiedBy), so every field beyond `name`
 * is optional.
 */
const physicalApplicationComponentSchema = new mongoose.Schema(
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
    // apm:assetIdentifier (shared with PhysicalTechnologyComponent)
    assetIdentifier: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    // apm:hasEnvironment (shared with PhysicalTechnologyComponent)
    hasEnvironment: {
      type: String,
      enum: ENVIRONMENT_VALUES,
    },
    // apm:realizesLogicalComponent
    realizesLogicalComponent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LogicalApplicationComponent',
    },
    // apm:deployedOn
    deployedOn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PhysicalTechnologyComponent',
    },
    // apm:identifiedBy
    identifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SoftwareProduct',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PhysicalApplicationComponent', physicalApplicationComponentSchema);
