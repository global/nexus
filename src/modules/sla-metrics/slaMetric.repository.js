const SLAMetric = require('./slaMetric.schema');

const create = async (data) => {
  const metric = new SLAMetric(data);
  return metric.save();
};

const findAll = async (query) => {
  return SLAMetric.find(query).sort({ createdAt: 1 });
};

const findById = async (id) => {
  return SLAMetric.findById(id);
};

const updateById = async (id, data) => {
  return SLAMetric.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return SLAMetric.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
