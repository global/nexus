const PhysicalTechnologyComponent = require('./physicalTechnologyComponent.schema');

const create = async (data) => {
  const component = new PhysicalTechnologyComponent(data);
  return component.save();
};

const findAll = async (query) => {
  return PhysicalTechnologyComponent.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return PhysicalTechnologyComponent.findById(id);
};

const updateById = async (id, data) => {
  return PhysicalTechnologyComponent.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return PhysicalTechnologyComponent.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
