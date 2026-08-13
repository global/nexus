const Document = require('./document.schema');

const create = async (data) => {
  const document = new Document(data);
  return document.save();
};

const findAll = async (query) => {
  return Document.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return Document.findById(id);
};

const updateById = async (id, data) => {
  return Document.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return Document.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
