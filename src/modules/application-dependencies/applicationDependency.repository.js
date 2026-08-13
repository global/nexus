const ApplicationDependency = require('./applicationDependency.schema');

const create = async (data) => {
  const dependency = new ApplicationDependency(data);
  return dependency.save();
};

const findAll = async (query) => {
  return ApplicationDependency.find(query).sort({ createdAt: 1 });
};

const findById = async (id) => {
  return ApplicationDependency.findById(id);
};

const updateById = async (id, data) => {
  return ApplicationDependency.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return ApplicationDependency.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
