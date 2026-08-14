const TechnologyDependency = require('./technologyDependency.schema');

const create = async (data) => {
  const dependency = new TechnologyDependency(data);
  return dependency.save();
};

const findAll = async (query) => {
  return TechnologyDependency.find(query).sort({ createdAt: 1 });
};

const findById = async (id) => {
  return TechnologyDependency.findById(id);
};

const updateById = async (id, data) => {
  return TechnologyDependency.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return TechnologyDependency.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
