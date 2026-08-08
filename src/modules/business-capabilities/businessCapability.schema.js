const mongoose = require('mongoose');

/**
 * Mongoose schema for apm:BusinessCapability (ontology/apm-ontology.ttl):
 * "An ability the business has to deliver value, independent of how it is
 * implemented." 
 */
const businessCapabilitySchema = new mongoose.Schema(
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

    capabilityWeight: {
      type: Number,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: 'capabilityWeight must be an integer.',
      },
    },

    capabilityLevel: {
      type: Number,
      min: 1,
      max: 3,
      validate: {
        validator: Number.isInteger,
        message: 'capabilityLevel must be an integer.',
      },
    },

    parentCapability: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessCapability' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BusinessCapability', businessCapabilitySchema);
