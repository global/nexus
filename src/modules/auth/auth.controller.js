const service = require('./auth.service');
const { loginSchema, refreshSchema } = require('./auth.validations');
const { ValidationError } = require('../../common/errors');

/**
 * Exchanges a username/password for an IdP-issued token pair.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const login = async (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return next(new ValidationError(error.details[0].message, error.details));

  try {
    const tokens = await service.login(value.username, value.password);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
};

/**
 * Exchanges a refresh token for a new token pair.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const refresh = async (req, res, next) => {
  const { error, value } = refreshSchema.validate(req.body);
  if (error) return next(new ValidationError(error.details[0].message, error.details));

  try {
    const tokens = await service.refresh(value.refreshToken);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
};

/**
 * Revokes a refresh token (and its session) at the IdP.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const logout = async (req, res, next) => {
  const { error, value } = refreshSchema.validate(req.body);
  if (error) return next(new ValidationError(error.details[0].message, error.details));

  try {
    await service.logout(value.refreshToken);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * Returns the identity the IdP issued for the caller's bearer token, as
 * normalized by the `authenticate` middleware onto `req.user`.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const me = (req, res) => {
  const { id, username, email, roles } = req.user;
  res.json({ id, username, email, roles });
};

module.exports = { login, refresh, logout, me };
