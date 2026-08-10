const Finding = require('./finding.schema');

const create = async (data) => {
  const finding = new Finding(data);
  return finding.save();
};

const findAll = async (query) => {
  return Finding.find(query).sort({ dueDate: 1 });
};

const findById = async (id) => {
  return Finding.findById(id);
};

const updateById = async (id, data) => {
  return Finding.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return Finding.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
