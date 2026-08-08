const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:Actor (ontology/apm-ontology.ttl): "A person,
 * organisation, or system that initiates or participates in business
 * activities." 
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

    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    organizationUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'OrganizationUnit' },
    businessProcesses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProcess' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Actor', actorSchema);
