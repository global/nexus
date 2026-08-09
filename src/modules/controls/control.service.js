const repository = require('./control.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.supportsComplianceStandard) {
    query.supportsComplianceStandard = {
      $in: Array.isArray(filters.supportsComplianceStandard) ? filters.supportsComplianceStandard : [filters.supportsComplianceStandard],
    };
  }
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { controlReference: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return repository.findAll(query);
};

const findById = async (id) => {
  const control = await repository.findById(id);
  if (!control) throw new NotFoundError('Control not found');
  return control;
};

const update = async (id, data) => {
  const control = await repository.updateById(id, data);
  if (!control) throw new NotFoundError('Control not found');
  return control;
};

const remove = async (id) => {
  const control = await repository.deleteById(id);
  if (!control) throw new NotFoundError('Control not found');
  return control;
};

module.exports = { create, findAll, findById, update, remove };
