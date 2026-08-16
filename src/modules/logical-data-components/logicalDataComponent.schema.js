const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:LogicalDataComponent (ontology/apm-ontology.ttl):
 * "A structured grouping of data entities, independent of implementation."
 *
 * `encapsulatesDataEntity` is modeled as an array per the ontology's own
 * "one or more data entities" wording, same reasoning as
 * BusinessProcess.realizesFunction.
 */
const logicalDataComponentSchema = new mongoose.Schema(
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
    // apm:encapsulatesDataEntity
    encapsulatesDataEntity: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DataEntity' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('LogicalDataComponent', logicalDataComponentSchema);
