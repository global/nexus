const service = require('./control.service');
const { createSchema, updateSchema } = require('./control.validations');
const { ValidationError, ConflictError } = require('../../common/errors');
const { toPlainJSON } = require('../../common/util');

const create = async (req, res, next) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) return next(new ValidationError(error.details[0].message, error.details));

  try {
    const control = await service.create(value);
    res.status(201).json(toPlainJSON(control));
  } catch (err) {
    if (err.code === 11000) return next(new ConflictError('A control with this name already exists'));
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const controls = await service.findAll(req.query);
    res.json(toPlainJSON(controls));
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const control = await service.findById(req.params.id);
    res.json(toPlainJSON(control));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  const { error, value } = updateSchema.validate(req.body);
  if (error) return next(new ValidationError(error.details[0].message, error.details));

  try {
    const control = await service.update(req.params.id, value);
    res.json(toPlainJSON(control));
  } catch (err) {
    if (err.code === 11000) return next(new ConflictError('Another control with this name already exists'));
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
