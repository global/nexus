const repository = require('./technologyDependency.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.upstreamTechnologyComponent) query.upstreamTechnologyComponent = filters.upstreamTechnologyComponent;
  if (filters.downstreamTechnologyComponent) query.downstreamTechnologyComponent = filters.downstreamTechnologyComponent;
  if (filters.usesProtocol) query.usesProtocol = filters.usesProtocol;
  if (filters.hasSynchronicity) query.hasSynchronicity = filters.hasSynchronicity;

  return repository.findAll(query);
};

const findById = async (id) => {
  const dependency = await repository.findById(id);
  if (!dependency) throw new NotFoundError('Technology dependency not found');
  return dependency;
};

const update = async (id, data) => {
  const dependency = await repository.updateById(id, data);
  if (!dependency) throw new NotFoundError('Technology dependency not found');
  return dependency;
};

const remove = async (id) => {
  const dependency = await repository.deleteById(id);
  if (!dependency) throw new NotFoundError('Technology dependency not found');
  return dependency;
};

module.exports = { create, findAll, findById, update, remove };
