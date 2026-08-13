const repository = require('./location.repository');
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
      { address: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return repository.findAll(query);
};

const findById = async (id) => {
  const location = await repository.findById(id);
  if (!location) throw new NotFoundError('Location not found');
  return location;
};

const update = async (id, data) => {
  const location = await repository.updateById(id, data);
  if (!location) throw new NotFoundError('Location not found');
  return location;
};

const remove = async (id) => {
  const location = await repository.deleteById(id);
  if (!location) throw new NotFoundError('Location not found');
  return location;
};

module.exports = { create, findAll, findById, update, remove };
