const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:ApplicationContact (ontology/apm-ontology.ttl):
 * "An assignment of an actor to a specific contact role for an
 * application, such as CTO or Information Owner."
 *
 * Cardinality follows apm-shapes.ttl's ApplicationContactShape: all three
 * fields are required and single-valued — every sample instance populates
 * all three, and a contact assignment missing any of them is meaningless.
 */
const applicationContactSchema = new mongoose.Schema(
  {
    // apm:forApplication
    forApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    // apm:contactActor
    contactActor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Actor',
      required: true,
    },
    // apm:contactRole
    contactRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ApplicationContact', applicationContactSchema);
