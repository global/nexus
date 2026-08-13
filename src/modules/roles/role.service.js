const repository = require('./role.repository');
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
  const role = await repository.findById(id);
  if (!role) throw new NotFoundError('Role not found');
  return role;
};

const update = async (id, data) => {
  const role = await repository.updateById(id, data);
  if (!role) throw new NotFoundError('Role not found');
  return role;
};

const remove = async (id) => {
  const role = await repository.deleteById(id);
  if (!role) throw new NotFoundError('Role not found');
  return role;
};

module.exports = { create, findAll, findById, update, remove };
