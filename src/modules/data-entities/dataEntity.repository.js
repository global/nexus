const DataEntity = require('./dataEntity.schema');

const create = async (data) => {
  const dataEntity = new DataEntity(data);
  return dataEntity.save();
};

const findAll = async (query) => {
  return DataEntity.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return DataEntity.findById(id);
};

const updateById = async (id, data) => {
  return DataEntity.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return DataEntity.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
