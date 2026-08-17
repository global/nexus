const SoftwareEntitlement = require('./softwareEntitlement.schema');

const create = async (data) => {
  const entitlement = new SoftwareEntitlement(data);
  return entitlement.save();
};

const findAll = async (query) => {
  return SoftwareEntitlement.find(query).sort({ createdAt: 1 });
};

const findById = async (id) => {
  return SoftwareEntitlement.findById(id);
};

const updateById = async (id, data) => {
  return SoftwareEntitlement.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return SoftwareEntitlement.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
