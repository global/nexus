const repository = require('./document.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.hasDocumentType) query.hasDocumentType = filters.hasDocumentType;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { url: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return repository.findAll(query);
};

const findById = async (id) => {
  const document = await repository.findById(id);
  if (!document) throw new NotFoundError('Document not found');
  return document;
};

const update = async (id, data) => {
  const document = await repository.updateById(id, data);
  if (!document) throw new NotFoundError('Document not found');
  return document;
};

const remove = async (id) => {
  const document = await repository.deleteById(id);
  if (!document) throw new NotFoundError('Document not found');
  return document;
};

module.exports = { create, findAll, findById, update, remove };
