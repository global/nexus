const ApplicationContact = require('./applicationContact.schema');

const create = async (data) => {
  const contact = new ApplicationContact(data);
  return contact.save();
};

const findAll = async (query) => {
  return ApplicationContact.find(query).sort({ createdAt: 1 });
};

const findById = async (id) => {
  return ApplicationContact.findById(id);
};

const updateById = async (id, data) => {
  return ApplicationContact.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return ApplicationContact.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
