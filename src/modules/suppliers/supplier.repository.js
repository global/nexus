const Supplier = require('./supplier.schema');

const create = async (data) => {
  const supplier = new Supplier(data);
  return supplier.save();
};

const findAll = async (query) => {
  return Supplier.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return Supplier.findById(id);
};

const updateById = async (id, data) => {
  return Supplier.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return Supplier.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
