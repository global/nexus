const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:CodeRepository (ontology/apm-ontology.ttl): "A
 * source code repository containing the implementation of an
 * application." A subclass of the abstract apm:LinkedResource — same
 * url/lastUpdated fields as Document, minus hasDocumentType, which is
 * Document-specific.
 *
 * No shape exists for this class; cardinality mirrors the ontology's
 * sample instances, which always populate name/url and usually
 * lastUpdated. The Application <-> CodeRepository relationship is stored
 * one-directionally on Application.repositories, same pattern as Document.
 */
const codeRepositorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // apm:url (declared on apm:LinkedResource)
    url: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => {
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        message: 'url must be a valid URI.',
      },
    },
    // apm:lastUpdated (declared on apm:LinkedResource)
    lastUpdated: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CodeRepository', codeRepositorySchema);
