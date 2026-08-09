const Control = require('./control.schema');

const create = async (data) => {
  const control = new Control(data);
  return control.save();
};

const findAll = async (query) => {
  return Control.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return Control.findById(id);
};

const updateById = async (id, data) => {
  return Control.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return Control.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
