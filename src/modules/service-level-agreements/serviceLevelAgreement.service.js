const repository = require('./serviceLevelAgreement.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.appliesToApplication) query.appliesToApplication = filters.appliesToApplication;

  return repository.findAll(query);
};

const findById = async (id) => {
  const sla = await repository.findById(id);
  if (!sla) throw new NotFoundError('Service level agreement not found');
  return sla;
};

const update = async (id, data) => {
  const sla = await repository.updateById(id, data);
  if (!sla) throw new NotFoundError('Service level agreement not found');
  return sla;
};

const remove = async (id) => {
  const sla = await repository.deleteById(id);
  if (!sla) throw new NotFoundError('Service level agreement not found');
  return sla;
};

module.exports = { create, findAll, findById, update, remove };
