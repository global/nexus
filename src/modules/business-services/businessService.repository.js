const BusinessService = require('./businessService.schema');

const create = async (data) => {
  const businessService = new BusinessService(data);
  return businessService.save();
};

const findAll = async (query) => {
  return BusinessService.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return BusinessService.findById(id);
};

const updateById = async (id, data) => {
  return BusinessService.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return BusinessService.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
