const repository = require('./dataEntity.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.hasDataSensitivity) {
    query.hasDataSensitivity = { $in: Array.isArray(filters.hasDataSensitivity) ? filters.hasDataSensitivity : [filters.hasDataSensitivity] };
  }
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return repository.findAll(query);
};

const findById = async (id) => {
  const dataEntity = await repository.findById(id);
  if (!dataEntity) throw new NotFoundError('Data entity not found');
  return dataEntity;
};

const update = async (id, data) => {
  const dataEntity = await repository.updateById(id, data);
  if (!dataEntity) throw new NotFoundError('Data entity not found');
  return dataEntity;
};

const remove = async (id) => {
  const dataEntity = await repository.deleteById(id);
  if (!dataEntity) throw new NotFoundError('Data entity not found');
  return dataEntity;
};

module.exports = { create, findAll, findById, update, remove };
