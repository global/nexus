const Actor = require('./actor.schema');

const create = async (data) => {
  const actor = new Actor(data);
  return actor.save();
};

const findAll = async (query) => {
  return Actor.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return Actor.findById(id);
};

const updateById = async (id, data) => {
  return Actor.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return Actor.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
