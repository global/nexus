const Portfolio = require('./portfolio.schema');

const create = async (data) => {
  const portfolio = new Portfolio(data);
  return portfolio.save();
};

const findAll = async (query) => {
  return Portfolio.find(query).sort({ name: 1 });
};

const findById = async (id) => {
  return Portfolio.findById(id);
};

const updateById = async (id, data) => {
  return Portfolio.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
};

const deleteById = async (id) => {
  return Portfolio.findByIdAndDelete(id);
};

module.exports = { create, findAll, findById, updateById, deleteById };
