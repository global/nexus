const TechnologyService = require('./technologyService.schema');

const create = async (data) => {
  const technologyService = new TechnologyService(data);
  return technologyService.save();
};

const findAll = async (query) => {
  return TechnologyService.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return TechnologyService.findById(id);
};

const updateById = async (id, data) => {
  return TechnologyService.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return TechnologyService.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
