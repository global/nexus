/**
 * Converts a Mongoose document (or array/object containing them) into a
 * fully JSON-native plain value — every ObjectId, Date, etc. already
 * stringified exactly as it will appear on the wire.
 *
 * @param {*} value
 * @returns {*}
 */
function toPlainJSON(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = { toPlainJSON };
