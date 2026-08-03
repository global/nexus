const AuditLog = require('../modules/audit/audit.schema');

/**
 * Records every request as an audit trail entry: method, path, outcome,
 * duration, caller IP, and — when the route ran `authenticate` beforehand —
 * the identity that made the call.
 *
 * Logging happens on the response's `finish` event rather than up front, for
 * two reasons: it lets us record the actual status code/duration, and it
 * runs after any route-level `authenticate` middleware has already attached
 * `req.user`, even though this middleware itself is mounted before routing.
 *
 * Deliberately does not record request/response bodies or headers: those
 * can contain passwords (`/auth/login`) or bearer tokens, which are sensitive
 * and should not be logged.
 *
 * A failure to persist an entry is logged to the console but never affects
 * the response already sent to the caller.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function auditLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

    AuditLog.create({
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
      userId: req.user ? req.user.id : null,
      username: req.user ? req.user.username : null,
      roles: req.user ? req.user.roles : [],
    }).catch((err) => {
      console.error('Failed to write audit log entry:', err.message);
    });
  });

  next();
}

module.exports = auditLogger;
