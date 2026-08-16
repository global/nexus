const service = require('./logicalDataComponent.service');
const { createSchema, updateSchema } = require('./logicalDataComponent.validations');
const { ValidationError, ConflictError } = require('../../common/errors');
const { toPlainJSON } = require('../../common/util');

const create = async (req, res, next) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) return next(new ValidationError(error.details[0].message, error.details));

  try {
    const component = await service.create(value);
    res.status(201).json(toPlainJSON(component));
  } catch (err) {
    if (err.code === 11000) return next(new ConflictError('A logical data component with this name already exists'));
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const components = await service.findAll(req.query);
    res.json(toPlainJSON(components));
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const component = await service.findById(req.params.id);
    res.json(toPlainJSON(component));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  const { error, value } = updateSchema.validate(req.body);
  if (error) return next(new ValidationError(error.details[0].message, error.details));

  try {
    const component = await service.update(req.params.id, value);
    res.json(toPlainJSON(component));
  } catch (err) {
    if (err.code === 11000) return next(new ConflictError('Another logical data component with this name already exists'));
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
