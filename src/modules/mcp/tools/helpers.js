const { toPlainJSON } = require('../../../common/util');

/**
 * Wraps a tool implementation so its return value becomes MCP `content` and
 * any error it throws (NotFoundError from the service layer, a Mongoose
 * CastError from a malformed id, etc.) becomes an in-band `isError` result
 * instead of a thrown exception — MCP tool-execution failures are reported
 * this way rather than as protocol-level errors.
 *
 * @param {(args: object) => Promise<*>} fn
 */
function safeHandler(fn) {
  return async (args) => {
    try {
      const result = await fn(args);
      return { content: [{ type: 'text', text: JSON.stringify(toPlainJSON(result), null, 2) }] };
    } catch (err) {
      if (err.name === 'CastError') {
        return { isError: true, content: [{ type: 'text', text: `Invalid id: ${err.value}` }] };
      }
      if (typeof err.statusCode === 'number') {
        return { isError: true, content: [{ type: 'text', text: err.message }] };
      }
      console.error(err);
      return { isError: true, content: [{ type: 'text', text: 'Internal error' }] };
    }
  };
}

module.exports = { safeHandler };
