/**
 * Returns the identity Keycloak issued for the caller's bearer token, as
 * normalized by the `authenticate` middleware onto `req.user`.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const me = (req, res) => {
  const { id, username, email, roles } = req.user;
  res.json({ id, username, email, roles });
};

module.exports = { me };
