const repository = require('./businessProcess.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.realizesFunction) query.realizesFunction = filters.realizesFunction;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return repository.findAll(query);
};

const findById = async (id) => {
  const businessProcess = await repository.findById(id);
  if (!businessProcess) throw new NotFoundError('Business process not found');
  return businessProcess;
};

const update = async (id, data) => {
  const businessProcess = await repository.updateById(id, data);
  if (!businessProcess) throw new NotFoundError('Business process not found');
  return businessProcess;
};

const remove = async (id) => {
  const businessProcess = await repository.deleteById(id);
  if (!businessProcess) throw new NotFoundError('Business process not found');
  return businessProcess;
};

module.exports = { create, findAll, findById, update, remove };
