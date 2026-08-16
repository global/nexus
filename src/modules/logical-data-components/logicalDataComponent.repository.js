const LogicalDataComponent = require('./logicalDataComponent.schema');

const create = async (data) => {
  const component = new LogicalDataComponent(data);
  return component.save();
};

const findAll = async (query) => {
  return LogicalDataComponent.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return LogicalDataComponent.findById(id);
};

const updateById = async (id, data) => {
  return LogicalDataComponent.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return LogicalDataComponent.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
