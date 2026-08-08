const OrganizationUnit = require('./organizationUnit.schema');

const create = async (data) => {
  const orgUnit = new OrganizationUnit(data);
  return orgUnit.save();
};

const findAll = async (query) => {
  return OrganizationUnit.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return OrganizationUnit.findById(id);
};

const updateById = async (id, data) => {
  return OrganizationUnit.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return OrganizationUnit.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
