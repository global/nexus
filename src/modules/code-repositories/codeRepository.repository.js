const CodeRepository = require('./codeRepository.schema');

const create = async (data) => {
  const repo = new CodeRepository(data);
  return repo.save();
};

const findAll = async (query) => {
  return CodeRepository.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return CodeRepository.findById(id);
};

const updateById = async (id, data) => {
  return CodeRepository.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return CodeRepository.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
