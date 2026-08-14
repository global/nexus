const LogicalTechnologyComponent = require('./logicalTechnologyComponent.schema');

const create = async (data) => {
  const component = new LogicalTechnologyComponent(data);
  return component.save();
};

const findAll = async (query) => {
  return LogicalTechnologyComponent.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return LogicalTechnologyComponent.findById(id);
};

const updateById = async (id, data) => {
  return LogicalTechnologyComponent.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return LogicalTechnologyComponent.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
