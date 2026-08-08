const repository = require('./businessCapability.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.parentCapability) query.parentCapability = filters.parentCapability;
  if (filters.capabilityLevel) query.capabilityLevel = filters.capabilityLevel;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return repository.findAll(query);
};

const findById = async (id) => {
  const capability = await repository.findById(id);
  if (!capability) throw new NotFoundError('Business capability not found');
  return capability;
};

const update = async (id, data) => {
  const capability = await repository.updateById(id, data);
  if (!capability) throw new NotFoundError('Business capability not found');
  return capability;
};

const remove = async (id) => {
  const capability = await repository.deleteById(id);
  if (!capability) throw new NotFoundError('Business capability not found');
  return capability;
};

module.exports = { create, findAll, findById, update, remove };
