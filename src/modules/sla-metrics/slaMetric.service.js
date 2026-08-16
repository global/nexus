const repository = require('./slaMetric.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.hasSLACategory) query.hasSLACategory = filters.hasSLACategory;

  return repository.findAll(query);
};

const findById = async (id) => {
  const metric = await repository.findById(id);
  if (!metric) throw new NotFoundError('SLA metric not found');
  return metric;
};

const update = async (id, data) => {
  const metric = await repository.updateById(id, data);
  if (!metric) throw new NotFoundError('SLA metric not found');
  return metric;
};

const remove = async (id) => {
  const metric = await repository.deleteById(id);
  if (!metric) throw new NotFoundError('SLA metric not found');
  return metric;
};

module.exports = { create, findAll, findById, update, remove };
