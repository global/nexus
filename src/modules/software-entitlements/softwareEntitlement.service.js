const repository = require('./softwareEntitlement.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.measuredByMetric) query.measuredByMetric = filters.measuredByMetric;

  return repository.findAll(query);
};

const findById = async (id) => {
  const entitlement = await repository.findById(id);
  if (!entitlement) throw new NotFoundError('Software entitlement not found');
  return entitlement;
};

const update = async (id, data) => {
  const entitlement = await repository.updateById(id, data);
  if (!entitlement) throw new NotFoundError('Software entitlement not found');
  return entitlement;
};

const remove = async (id) => {
  const entitlement = await repository.deleteById(id);
  if (!entitlement) throw new NotFoundError('Software entitlement not found');
  return entitlement;
};

module.exports = { create, findAll, findById, update, remove };
