const Metric = require('./metric.schema');

const create = async (data) => {
  const metric = new Metric(data);
  return metric.save();
};

const findAll = async (query) => {
  return Metric.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return Metric.findById(id);
};

const updateById = async (id, data) => {
  return Metric.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return Metric.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
