const repository = require('./physicalTechnologyComponent.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.hasEnvironment) query.hasEnvironment = filters.hasEnvironment;
  if (filters.realizesLogicalTechnologyComponent) query.realizesLogicalTechnologyComponent = filters.realizesLogicalTechnologyComponent;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { assetIdentifier: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return repository.findAll(query);
};

const findById = async (id) => {
  const component = await repository.findById(id);
  if (!component) throw new NotFoundError('Physical technology component not found');
  return component;
};

const update = async (id, data) => {
  const component = await repository.updateById(id, data);
  if (!component) throw new NotFoundError('Physical technology component not found');
  return component;
};

const remove = async (id) => {
  const component = await repository.deleteById(id);
  if (!component) throw new NotFoundError('Physical technology component not found');
  return component;
};

module.exports = { create, findAll, findById, update, remove };
