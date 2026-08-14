const LogicalApplicationComponent = require('./logicalApplicationComponent.schema');

const create = async (data) => {
  const component = new LogicalApplicationComponent(data);
  return component.save();
};

const findAll = async (query) => {
  return LogicalApplicationComponent.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return LogicalApplicationComponent.findById(id);
};

const updateById = async (id, data) => {
  return LogicalApplicationComponent.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return LogicalApplicationComponent.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
