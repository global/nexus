const service = require('./applicationDependency.service');
const { createSchema, updateSchema } = require('./applicationDependency.validations');
const { ValidationError } = require('../../common/errors');
const { toPlainJSON } = require('../../common/util');

const create = async (req, res, next) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) return next(new ValidationError(error.details[0].message, error.details));

  try {
    const dependency = await service.create(value);
    res.status(201).json(toPlainJSON(dependency));
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const dependencies = await service.findAll(req.query);
    res.json(toPlainJSON(dependencies));
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const dependency = await service.findById(req.params.id);
    res.json(toPlainJSON(dependency));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  const { error, value } = updateSchema.validate(req.body);
  if (error) return next(new ValidationError(error.details[0].message, error.details));

  try {
    const dependency = await service.update(req.params.id, value);
    res.json(toPlainJSON(dependency));
  } catch (err) {
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
