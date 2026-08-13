const repository = require('./codeRepository.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { url: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return repository.findAll(query);
};

const findById = async (id) => {
  const repo = await repository.findById(id);
  if (!repo) throw new NotFoundError('Code repository not found');
  return repo;
};

const update = async (id, data) => {
  const repo = await repository.updateById(id, data);
  if (!repo) throw new NotFoundError('Code repository not found');
  return repo;
};

const remove = async (id) => {
  const repo = await repository.deleteById(id);
  if (!repo) throw new NotFoundError('Code repository not found');
  return repo;
};

module.exports = { create, findAll, findById, update, remove };
