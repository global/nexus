const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:Actor (ontology/apm-ontology.ttl): "A person,
 * organisation, or system that initiates or participates in business
 * activities." Field names follow the ontology's object/datatype property
 * local names, minus the `has`/`performs`/`apm:` prefix; `name` and
 * `description` map to the ontology's rdfs:label/rdfs:comment convention.
 *
 * No apm-shapes.ttl ActorShape exists, so cardinality follows each
 * property's own rdfs:comment and how apm-instances-sample.ttl actually
 * uses it: `role` and `organizationUnit` read as singular ("performs A
 * role", "member of AN organizational Unit") and are singular in every
 * sample instance, so they're modeled as single references, not arrays.
 *
 * `role` and `organizationUnit` (and `businessProcesses`) point at
 * collections that don't exist as Mongoose models yet (Role,
 * OrganizationUnit, BusinessProcess) — storage/validation of their
 * ObjectIds works today, `.populate()` will resolve once those modules exist.
 */
const actorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    // apm:emailAddress — not required by the ontology (a non-human "system"
    // actor may not have one), but unique when present.
    emailAddress: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'must be a valid email address'],
    },
    phoneNumber: {
      type: String,
      trim: true,
    },

    // apm:performsRole
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    // apm:memberOf
    organizationUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'OrganizationUnit' },
    // apm:performsProcess — no cardinality signal either way, modeled as an array
    businessProcesses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProcess' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Actor', actorSchema);
