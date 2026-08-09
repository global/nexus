const repository = require('./supplier.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.certifications) {
    query.certifications = { $in: Array.isArray(filters.certifications) ? filters.certifications : [filters.certifications] };
  }
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return repository.findAll(query);
};

const findById = async (id) => {
  const supplier = await repository.findById(id);
  if (!supplier) throw new NotFoundError('Supplier not found');
  return supplier;
};

const update = async (id, data) => {
  const supplier = await repository.updateById(id, data);
  if (!supplier) throw new NotFoundError('Supplier not found');
  return supplier;
};

const remove = async (id) => {
  const supplier = await repository.deleteById(id);
  if (!supplier) throw new NotFoundError('Supplier not found');
  return supplier;
};

module.exports = { create, findAll, findById, update, remove };
