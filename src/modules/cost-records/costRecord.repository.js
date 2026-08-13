const CostRecord = require('./costRecord.schema');

const create = async (data) => {
  const record = new CostRecord(data);
  return record.save();
};

const findAll = async (query) => {
  return CostRecord.find(query).sort({ fiscalYear: 1 });
};

const findById = async (id) => {
  return CostRecord.findById(id);
};

const updateById = async (id, data) => {
  return CostRecord.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return CostRecord.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
