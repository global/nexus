const BusinessFunction = require('./businessFunction.schema');

const create = async (data) => {
  const businessFunction = new BusinessFunction(data);
  return businessFunction.save();
};

const findAll = async (query) => {
  return BusinessFunction.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return BusinessFunction.findById(id);
};

const updateById = async (id, data) => {
  return BusinessFunction.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return BusinessFunction.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
