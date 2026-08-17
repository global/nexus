const repository = require('./resourceUtilizationRecord.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.measuresProduct) query.measuresProduct = filters.measuresProduct;
  if (filters.measuredAgainstMetric) query.measuredAgainstMetric = filters.measuredAgainstMetric;

  return repository.findAll(query);
};

const findById = async (id) => {
  const record = await repository.findById(id);
  if (!record) throw new NotFoundError('Resource utilization record not found');
  return record;
};

const update = async (id, data) => {
  const record = await repository.updateById(id, data);
  if (!record) throw new NotFoundError('Resource utilization record not found');
  return record;
};

const remove = async (id) => {
  const record = await repository.deleteById(id);
  if (!record) throw new NotFoundError('Resource utilization record not found');
  return record;
};

module.exports = { create, findAll, findById, update, remove };
