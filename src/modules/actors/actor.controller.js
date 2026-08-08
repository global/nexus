const service = require('./actor.service');
const { createSchema, updateSchema } = require('./actor.validations');
const { ValidationError, ConflictError } = require('../../common/errors');
const { toPlainJSON } = require('../../common/util');

const create = async (req, res, next) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) return next(new ValidationError(error.details[0].message, error.details));

  try {
    const actor = await service.create(value);
    res.status(201).json(toPlainJSON(actor));
  } catch (err) {
    if (err.code === 11000) return next(new ConflictError('An actor with this email address already exists'));
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const actors = await service.findAll(req.query);
    res.json(toPlainJSON(actors));
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const actor = await service.findById(req.params.id);
    res.json(toPlainJSON(actor));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  const { error, value } = updateSchema.validate(req.body);
  if (error) return next(new ValidationError(error.details[0].message, error.details));

  try {
    const actor = await service.update(req.params.id, value);
    res.json(toPlainJSON(actor));
  } catch (err) {
    if (err.code === 11000) return next(new ConflictError('Another actor with this email address already exists'));
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getAll, getOne, update, remove };
