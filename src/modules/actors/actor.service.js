const repository = require('./actor.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.role) query.role = filters.role;
  if (filters.organizationUnit) query.organizationUnit = filters.organizationUnit;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { emailAddress: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return repository.findAll(query);
};

const findById = async (id) => {
  const actor = await repository.findById(id);
  if (!actor) throw new NotFoundError('Actor not found');
  return actor;
};

const update = async (id, data) => {
  const actor = await repository.updateById(id, data);
  if (!actor) throw new NotFoundError('Actor not found');
  return actor;
};

const remove = async (id) => {
  const actor = await repository.deleteById(id);
  if (!actor) throw new NotFoundError('Actor not found');
  return actor;
};

module.exports = { create, findAll, findById, update, remove };
