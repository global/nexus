const PhysicalApplicationComponent = require('./physicalApplicationComponent.schema');

const create = async (data) => {
  const component = new PhysicalApplicationComponent(data);
  return component.save();
};

const findAll = async (query) => {
  return PhysicalApplicationComponent.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return PhysicalApplicationComponent.findById(id);
};

const updateById = async (id, data) => {
  return PhysicalApplicationComponent.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return PhysicalApplicationComponent.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
