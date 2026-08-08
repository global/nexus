const repository = require('./application.repository');
const { NotFoundError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.lifecycleStatus) query.lifecycleStatus = filters.lifecycleStatus;
  if (filters.criticalityTier) query.criticalityTier = filters.criticalityTier;
  if (filters.investmentStrategy) query.investmentStrategy = filters.investmentStrategy;
  if (filters.hostingModel) query.hostingModel = filters.hostingModel;
  if (filters.complianceStandards) {
    query.complianceStandards = { $in: Array.isArray(filters.complianceStandards) ? filters.complianceStandards : [filters.complianceStandards] };
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
  const app = await repository.findById(id);
  if (!app) throw new NotFoundError('Application not found');
  return app;
};

const update = async (id, data) => {
  const app = await repository.updateById(id, data);
  if (!app) throw new NotFoundError('Application not found');
  return app;
};

const remove = async (id) => {
  const app = await repository.deleteById(id);
  if (!app) throw new NotFoundError('Application not found');
  return app;
};

const getStats = async () => {
  const [byLifecycleStatus, byCriticalityTier, byInvestmentStrategy, total] = await Promise.all([
    repository.aggregate([{ $group: { _id: '$lifecycleStatus', count: { $sum: 1 } } }]),
    repository.aggregate([{ $group: { _id: '$criticalityTier', count: { $sum: 1 } } }]),
    repository.aggregate([{ $group: { _id: '$investmentStrategy', count: { $sum: 1 } } }]),
    repository.countDocuments(),
  ]);
  return { byLifecycleStatus, byCriticalityTier, byInvestmentStrategy, total };
};

module.exports = { create, findAll, findById, update, remove, getStats };
