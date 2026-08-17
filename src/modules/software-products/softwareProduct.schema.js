const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:SoftwareProduct (ontology/apm-ontology.ttl,
 * ISO/IEC 19770-2): "A software asset identified via a SWID tag."
 *
 * `coveredByEntitlement` refs the not-yet-built SoftwareEntitlement model
 * (roadmap Step 24) — Mongoose only needs the ref name string, not the
 * model to already exist, matching how Actor.role/Application.documents
 * were built ahead of their target modules.
 */
const softwareProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // apm:swidTagId — the SWID tag's unique tagId (ISO/IEC 19770-2).
    swidTagId: { type: String, trim: true },

    // apm:version — the product version as declared in its SWID tag.
    version: { type: String, trim: true },

    // apm:endOfLifeDate / apm:endOfSupportDate
    endOfLifeDate: { type: Date },
    endOfSupportDate: { type: Date },

    // apm:suppliedBy — the Supplier that publishes this product.
    suppliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },

    // apm:coveredByEntitlement — the SoftwareEntitlement authorising this product's use.
    coveredByEntitlement: { type: mongoose.Schema.Types.ObjectId, ref: 'SoftwareEntitlement' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SoftwareProduct', softwareProductSchema);
