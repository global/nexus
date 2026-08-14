const mongoose = require('mongoose');
const { ENVIRONMENT_VALUES } = require('../../common/vocabularies');

/**
 * Mongoose schema for apm:PhysicalTechnologyComponent
 * (ontology/apm-ontology.ttl): "A deployable technology product, such as a
 * server or network device, that realises a logical technology
 * component."
 *
 * `assetIdentifier`/`hasEnvironment` are shared with
 * PhysicalApplicationComponent (union domain in the ontology) — mirrored
 * here the same way they'll be mirrored there in a later step.
 * `assetIdentifier` is unique+sparse per the ontology's own description
 * ("a unique identifier for the physical asset"), matching the pattern
 * used for OrganizationUnit.costCenterCode.
 *
 * No shape exists for this class; both sample instances always populate
 * assetIdentifier/hasEnvironment but never realizesLogicalTechnologyComponent,
 * so only the former two are treated as expected-but-optional.
 */
const physicalTechnologyComponentSchema = new mongoose.Schema(
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
    // apm:assetIdentifier
    assetIdentifier: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    // apm:hasEnvironment
    hasEnvironment: {
      type: String,
      enum: ENVIRONMENT_VALUES,
    },
    // apm:realizesLogicalTechnologyComponent
    realizesLogicalTechnologyComponent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LogicalTechnologyComponent',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PhysicalTechnologyComponent', physicalTechnologyComponentSchema);
