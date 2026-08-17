const service = require('./serviceLevelAgreement.service');
const { createSchema, updateSchema } = require('./serviceLevelAgreement.validations');
const { ValidationError } = require('../../common/errors');
const { toPlainJSON } = require('../../common/util');

const create = async (req, res, next) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) return next(new ValidationError(error.details[0].message, error.details));

  try {
    const sla = await service.create(value);
    res.status(201).json(toPlainJSON(sla));
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const slas = await service.findAll(req.query);
    res.json(toPlainJSON(slas));
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const sla = await service.findById(req.params.id);
    res.json(toPlainJSON(sla));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  const { error, value } = updateSchema.validate(req.body);
  if (error) return next(new ValidationError(error.details[0].message, error.details));

  try {
    const sla = await service.update(req.params.id, value);
    res.json(toPlainJSON(sla));
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
