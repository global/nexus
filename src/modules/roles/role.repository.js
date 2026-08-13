const Role = require('./role.schema');

const create = async (data) => {
  const role = new Role(data);
  return role.save();
};

const findAll = async (query) => {
  return Role.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return Role.findById(id);
};

const updateById = async (id, data) => {
  return Role.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return Role.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
