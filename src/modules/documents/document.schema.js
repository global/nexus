const mongoose = require('mongoose');
const { DOCUMENT_TYPE_VALUES } = require('../../common/vocabularies');

/**
 * Mongoose schema for apm:Document (ontology/apm-ontology.ttl): "A
 * reference document or link associated with an application, such as an
 * architecture or threat model document." A subclass of the abstract
 * apm:LinkedResource, which is where url/lastUpdated are actually declared
 * (also inherited by CodeRepository).
 *
 * No shape exists for this class yet; cardinality mirrors the ontology's
 * own single sample instance, which populates all four fields. `lastUpdated`
 * is left optional though — a freshly linked document may not have a known
 * last-modified date yet.
 *
 * The Application <-> Document relationship is stored one-directionally on
 * Application.documents (an array of refs), so there's no back-reference
 * field here — same pattern as Application.controls/capabilities.
 */
const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // apm:hasDocumentType
    hasDocumentType: {
      type: String,
      enum: DOCUMENT_TYPE_VALUES,
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

module.exports = mongoose.model('Document', documentSchema);
