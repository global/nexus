const repository = require('./portfolio.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.portfolioOwner) query.portfolioOwner = filters.portfolioOwner;
  if (filters.alignsToCapability) query.alignsToCapability = filters.alignsToCapability;
  if (filters.containsApplication) query.containsApplication = filters.containsApplication;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return repository.findAll(query);
};

const findById = async (id) => {
  const portfolio = await repository.findById(id);
  if (!portfolio) throw new NotFoundError('Portfolio not found');
  return portfolio;
};

const update = async (id, data) => {
  const portfolio = await repository.updateById(id, data);
  if (!portfolio) throw new NotFoundError('Portfolio not found');
  return portfolio;
};

const remove = async (id) => {
  const portfolio = await repository.deleteById(id);
  if (!portfolio) throw new NotFoundError('Portfolio not found');
  return portfolio;
};

module.exports = { create, findAll, findById, update, remove };
