const service = require('./dataEntity.service');
const { createSchema, updateSchema } = require('./dataEntity.validations');
const { ValidationError, ConflictError } = require('../../common/errors');
const { toPlainJSON } = require('../../common/util');

const create = async (req, res, next) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) return next(new ValidationError(error.details[0].message, error.details));

  try {
    const dataEntity = await service.create(value);
    res.status(201).json(toPlainJSON(dataEntity));
  } catch (err) {
    if (err.code === 11000) return next(new ConflictError('A data entity with this name already exists'));
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const dataEntities = await service.findAll(req.query);
    res.json(toPlainJSON(dataEntities));
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const dataEntity = await service.findById(req.params.id);
    res.json(toPlainJSON(dataEntity));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  const { error, value } = updateSchema.validate(req.body);
  if (error) return next(new ValidationError(error.details[0].message, error.details));

  try {
    const dataEntity = await service.update(req.params.id, value);
    res.json(toPlainJSON(dataEntity));
  } catch (err) {
    if (err.code === 11000) return next(new ConflictError('Another data entity with this name already exists'));
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
