const PerformanceAssessment = require('./performanceAssessment.schema');

const create = async (data) => {
  const assessment = new PerformanceAssessment(data);
  return assessment.save();
};

const findAll = async (query) => {
  return PerformanceAssessment.find(query).sort({ assessedOn: 1 });
};

const findById = async (id) => {
  return PerformanceAssessment.findById(id);
};

const updateById = async (id, data) => {
  return PerformanceAssessment.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return PerformanceAssessment.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
