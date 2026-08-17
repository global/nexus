const ResourceUtilizationRecord = require('./resourceUtilizationRecord.schema');

const create = async (data) => {
  const record = new ResourceUtilizationRecord(data);
  return record.save();
};

const findAll = async (query) => {
  return ResourceUtilizationRecord.find(query).sort({ measurementPeriodStart: 1 });
};

const findById = async (id) => {
  return ResourceUtilizationRecord.findById(id);
};

const updateById = async (id, data) => {
  return ResourceUtilizationRecord.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return ResourceUtilizationRecord.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
