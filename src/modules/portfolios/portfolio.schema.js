const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:Portfolio (ontology/apm-ontology.ttl):
 * "A curated grouping of applications, managed together for strategic,
 * budgetary, or governance purposes."
 */
const portfolioSchema = new mongoose.Schema(
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

    // apm:containsApplication — one or more Applications grouped by this portfolio.
    containsApplication: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
      validate: {
        validator: (value) => Array.isArray(value) && value.length >= 1,
        message: 'Every Portfolio must contain at least one Application.',
      },
    },

    // apm:portfolioOwner — the Actor accountable for the portfolio's strategic governance.
    portfolioOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'Actor', required: true },

    // apm:alignsToCapability — the BusinessCapability the portfolio is organised around.
    alignsToCapability: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessCapability', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
