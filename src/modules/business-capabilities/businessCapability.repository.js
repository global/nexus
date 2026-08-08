const BusinessCapability = require('./businessCapability.schema');

const create = async (data) => {
  const capability = new BusinessCapability(data);
  return capability.save();
};

const findAll = async (query) => {
  return BusinessCapability.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return BusinessCapability.findById(id);
};

const updateById = async (id, data) => {
  return BusinessCapability.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return BusinessCapability.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
