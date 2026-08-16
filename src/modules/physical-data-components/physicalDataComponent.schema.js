const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:PhysicalDataComponent (ontology/apm-ontology.ttl):
 * "An implementation-specific realisation of a logical data component,
 * such as a database or file."
 *
 * `realizesLogicalDataComponent` is modeled as a single ref — the
 * ontology's comment uses singular language ("the logical data component
 * it implements"), unlike LogicalDataComponent's own
 * encapsulatesDataEntity.
 */
const physicalDataComponentSchema = new mongoose.Schema(
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
    // apm:realizesLogicalDataComponent
    realizesLogicalDataComponent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LogicalDataComponent',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PhysicalDataComponent', physicalDataComponentSchema);
