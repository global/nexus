const ServiceLevelAgreement = require('./serviceLevelAgreement.schema');

const create = async (data) => {
  const sla = new ServiceLevelAgreement(data);
  return sla.save();
};

const findAll = async (query) => {
  return ServiceLevelAgreement.find(query).sort({ effectiveFrom: 1 });
};

const findById = async (id) => {
  return ServiceLevelAgreement.findById(id);
};

const updateById = async (id, data) => {
  return ServiceLevelAgreement.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return ServiceLevelAgreement.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
