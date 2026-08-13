const repository = require('./applicationContact.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.forApplication) query.forApplication = filters.forApplication;
  if (filters.contactActor) query.contactActor = filters.contactActor;
  if (filters.contactRole) query.contactRole = filters.contactRole;

  return repository.findAll(query);
};

const findById = async (id) => {
  const contact = await repository.findById(id);
  if (!contact) throw new NotFoundError('Application contact not found');
  return contact;
};

const update = async (id, data) => {
  const contact = await repository.updateById(id, data);
  if (!contact) throw new NotFoundError('Application contact not found');
  return contact;
};

const remove = async (id) => {
  const contact = await repository.deleteById(id);
  if (!contact) throw new NotFoundError('Application contact not found');
  return contact;
};

module.exports = { create, findAll, findById, update, remove };
