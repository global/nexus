const repository = require('./metric.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return repository.findAll(query);
};

const findById = async (id) => {
  const metric = await repository.findById(id);
  if (!metric) throw new NotFoundError('Metric not found');
  return metric;
};

const update = async (id, data) => {
  const metric = await repository.updateById(id, data);
  if (!metric) throw new NotFoundError('Metric not found');
  return metric;
};

const remove = async (id) => {
  const metric = await repository.deleteById(id);
  if (!metric) throw new NotFoundError('Metric not found');
  return metric;
};

module.exports = { create, findAll, findById, update, remove };
