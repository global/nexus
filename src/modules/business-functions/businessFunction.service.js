const repository = require('./businessFunction.repository');
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
  const businessFunction = await repository.findById(id);
  if (!businessFunction) throw new NotFoundError('Business function not found');
  return businessFunction;
};

const update = async (id, data) => {
  const businessFunction = await repository.updateById(id, data);
  if (!businessFunction) throw new NotFoundError('Business function not found');
  return businessFunction;
};

const remove = async (id) => {
  const businessFunction = await repository.deleteById(id);
  if (!businessFunction) throw new NotFoundError('Business function not found');
  return businessFunction;
};

module.exports = { create, findAll, findById, update, remove };
