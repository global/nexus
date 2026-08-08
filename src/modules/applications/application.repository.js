const Application = require('./application.schema');

const create = async (data) => {
  const app = new Application(data);
  return app.save();
};

const findAll = async (query) => {
  return Application.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return Application.findById(id);
};

const updateById = async (id, data) => {
  return Application.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return Application.findByIdAndDelete(id);
};

const aggregate = async (pipeline) => {
  return Application.aggregate(pipeline);
};

const countDocuments = async () => {
  return Application.countDocuments();
};

module.exports = { create, findAll, findById, updateById, deleteById, aggregate, countDocuments };
