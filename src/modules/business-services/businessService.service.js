const repository = require('./businessService.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.supportsCapability) query.supportsCapability = filters.supportsCapability;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return repository.findAll(query);
};

const findById = async (id) => {
  const businessService = await repository.findById(id);
  if (!businessService) throw new NotFoundError('Business service not found');
  return businessService;
};

const update = async (id, data) => {
  const businessService = await repository.updateById(id, data);
  if (!businessService) throw new NotFoundError('Business service not found');
  return businessService;
};

const remove = async (id) => {
  const businessService = await repository.deleteById(id);
  if (!businessService) throw new NotFoundError('Business service not found');
  return businessService;
};

module.exports = { create, findAll, findById, update, remove };
