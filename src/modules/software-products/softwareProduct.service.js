const repository = require('./softwareProduct.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.suppliedBy) query.suppliedBy = filters.suppliedBy;
  if (filters.coveredByEntitlement) query.coveredByEntitlement = filters.coveredByEntitlement;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { swidTagId: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return repository.findAll(query);
};

const findById = async (id) => {
  const product = await repository.findById(id);
  if (!product) throw new NotFoundError('Software product not found');
  return product;
};

const update = async (id, data) => {
  const product = await repository.updateById(id, data);
  if (!product) throw new NotFoundError('Software product not found');
  return product;
};

const remove = async (id) => {
  const product = await repository.deleteById(id);
  if (!product) throw new NotFoundError('Software product not found');
  return product;
};

module.exports = { create, findAll, findById, update, remove };
