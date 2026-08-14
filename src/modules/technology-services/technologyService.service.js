const repository = require('./technologyService.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return repository.findAll(query);
};

const findById = async (id) => {
  const technologyService = await repository.findById(id);
  if (!technologyService) throw new NotFoundError('Technology service not found');
  return technologyService;
};

const update = async (id, data) => {
  const technologyService = await repository.updateById(id, data);
  if (!technologyService) throw new NotFoundError('Technology service not found');
  return technologyService;
};

const remove = async (id) => {
  const technologyService = await repository.deleteById(id);
  if (!technologyService) throw new NotFoundError('Technology service not found');
  return technologyService;
};

module.exports = { create, findAll, findById, update, remove };
