/**
 * Converts a Mongoose document (or array/object containing them) into a
 * fully JSON-native plain value — every ObjectId, Date, etc. already
 * stringified exactly as it will appear on the wire.
 *
 * Needed because `express-openapi-validator` validates the value passed to
 * `res.json()` directly, before Express's own serialization runs. A raw
 * Mongoose document still has ObjectId instances (`typeof` `'object'`, not
 * `'string'`) at that point, which fails a `type: string` response schema
 * check even though the eventual JSON response is correct — only a full
 * `JSON.stringify`/`JSON.parse` round-trip (which is what genuinely happens
 * on the wire) triggers ObjectId's own `toJSON()` recursively.
 *
 * @param {*} value
 * @returns {*}
 */
function toPlainJSON(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = { toPlainJSON };
