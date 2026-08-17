const SoftwareProduct = require('./softwareProduct.schema');

const create = async (data) => {
  const product = new SoftwareProduct(data);
  return product.save();
};

const findAll = async (query) => {
  return SoftwareProduct.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return SoftwareProduct.findById(id);
};

const updateById = async (id, data) => {
  return SoftwareProduct.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return SoftwareProduct.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
