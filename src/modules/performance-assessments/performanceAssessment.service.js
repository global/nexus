const repository = require('./performanceAssessment.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.assessesApplication) query.assessesApplication = filters.assessesApplication;
  if (filters.assessedBy) query.assessedBy = filters.assessedBy;

  return repository.findAll(query);
};

const findById = async (id) => {
  const assessment = await repository.findById(id);
  if (!assessment) throw new NotFoundError('Performance assessment not found');
  return assessment;
};

const update = async (id, data) => {
  const assessment = await repository.updateById(id, data);
  if (!assessment) throw new NotFoundError('Performance assessment not found');
  return assessment;
};

const remove = async (id) => {
  const assessment = await repository.deleteById(id);
  if (!assessment) throw new NotFoundError('Performance assessment not found');
  return assessment;
};

module.exports = { create, findAll, findById, update, remove };
