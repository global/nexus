const BusinessProcess = require('./businessProcess.schema');

const create = async (data) => {
  const businessProcess = new BusinessProcess(data);
  return businessProcess.save();
};

const findAll = async (query) => {
  return BusinessProcess.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return BusinessProcess.findById(id);
};

const updateById = async (id, data) => {
  return BusinessProcess.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return BusinessProcess.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
