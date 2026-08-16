const PhysicalDataComponent = require('./physicalDataComponent.schema');

const create = async (data) => {
  const component = new PhysicalDataComponent(data);
  return component.save();
};

const findAll = async (query) => {
  return PhysicalDataComponent.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return PhysicalDataComponent.findById(id);
};

const updateById = async (id, data) => {
  return PhysicalDataComponent.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return PhysicalDataComponent.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
