const mongoose = require('mongoose');

/**
 * A single API call, recorded for audit purposes: who did what, when, and
 * what the outcome was. Written by `middleware/logger.js` after every
 * request under `/api` finishes.
 */
const auditLogSchema = new mongoose.Schema({
  method: { type: String, required: true },
  path: { type: String, required: true },
  statusCode: { type: Number, required: true },
  durationMs: { type: Number, required: true },
  ip: { type: String },

  // If not authenticated, these will be flagged as "anonymous", to conform with String type.
  userId: { type: String, default: 'anonymous' },
  username: { type: String, default: 'anonymous' },
  roles: { type: [String], default: [] },
  
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
