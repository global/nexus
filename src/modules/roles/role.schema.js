const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:Role (ontology/apm-ontology.ttl): "The function
 * an actor performs in a process, independent of who fulfils it." e.g. CTO,
 * CISO, Information Owner, Application Owner.
 *
 * A small, catalog-style entity like Control/Supplier/BusinessCapability —
 * `name` is unique, unlike Actor's (people can share a name; roles in this
 * catalog shouldn't). The ontology's sample data only ever populates
 * rdfs:label for Role individuals, no rdfs:comment, so `description` is
 * optional here too.
 */
const roleSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
