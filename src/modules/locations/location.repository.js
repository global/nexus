const Location = require('./location.schema');

const create = async (data) => {
  const location = new Location(data);
  return location.save();
};

const findAll = async (query) => {
  return Location.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return Location.findById(id);
};

const updateById = async (id, data) => {
  return Location.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return Location.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
