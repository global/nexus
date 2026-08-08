const repository = require('./organizationUnit.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.location) query.location = filters.location;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { costCenterCode: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return repository.findAll(query);
};

const findById = async (id) => {
  const orgUnit = await repository.findById(id);
  if (!orgUnit) throw new NotFoundError('Organization unit not found');
  return orgUnit;
};

const update = async (id, data) => {
  const orgUnit = await repository.updateById(id, data);
  if (!orgUnit) throw new NotFoundError('Organization unit not found');
  return orgUnit;
};

const remove = async (id) => {
  const orgUnit = await repository.deleteById(id);
  if (!orgUnit) throw new NotFoundError('Organization unit not found');
  return orgUnit;
};

module.exports = { create, findAll, findById, update, remove };
