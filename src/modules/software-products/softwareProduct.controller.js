const service = require('./softwareProduct.service');
const { createSchema, updateSchema } = require('./softwareProduct.validations');
const { ValidationError, ConflictError } = require('../../common/errors');
const { toPlainJSON } = require('../../common/util');

const create = async (req, res, next) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) return next(new ValidationError(error.details[0].message, error.details));

  try {
    const product = await service.create(value);
    res.status(201).json(toPlainJSON(product));
  } catch (err) {
    if (err.code === 11000) return next(new ConflictError('A software product with this name already exists'));
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const products = await service.findAll(req.query);
    res.json(toPlainJSON(products));
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const product = await service.findById(req.params.id);
    res.json(toPlainJSON(product));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  const { error, value } = updateSchema.validate(req.body);
  if (error) return next(new ValidationError(error.details[0].message, error.details));

  try {
    const product = await service.update(req.params.id, value);
    res.json(toPlainJSON(product));
  } catch (err) {
    if (err.code === 11000) return next(new ConflictError('Another software product with this name already exists'));
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
