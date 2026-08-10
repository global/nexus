const repository = require('./finding.repository');
const { NotFoundError, ValidationError } = require('../../common/errors');

const create = async (data) => {
  return repository.create(data);
};

const findAll = async (filters = {}) => {
  const query = {};

  if (filters.findingCategory) query.findingCategory = filters.findingCategory;
  if (filters.findingStatus) query.findingStatus = filters.findingStatus;
  if (filters.application) query.application = filters.application;
  if (filters.search) {
    query.$or = [
      { findingDetails: { $regex: filters.search, $options: 'i' } },
      { cveId: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return repository.findAll(query);
};

const findById = async (id) => {
  const finding = await repository.findById(id);
  if (!finding) throw new NotFoundError('Finding not found');
  return finding;
};

/**
 * Mongoose's update-validator `this` context doesn't reliably see the
 * document's existing fields (only what's in the update payload itself),
 * so the cvssScore-only-for-Vulnerability rule (apm-shapes.ttl's
 * FindingCvssOnlyForVulnerabilityShape) can't be fully enforced by the
 * schema validator on this path — see finding.schema.js. When an update
 * touches cvssScore without also specifying findingCategory, this checks
 * the category already stored in the database instead.
 */
const update = async (id, data) => {
  const setsCvssScore = Object.prototype.hasOwnProperty.call(data, 'cvssScore') && data.cvssScore !== null;
  if (setsCvssScore && !data.findingCategory) {
    const existing = await repository.findById(id);
    if (existing && existing.findingCategory !== 'Vulnerability') {
      throw new ValidationError('cvssScore may only be populated on a Finding categorized as Vulnerability.');
    }
  }

  const finding = await repository.updateById(id, data);
  if (!finding) throw new NotFoundError('Finding not found');
  return finding;
};

const remove = async (id) => {
  const finding = await repository.deleteById(id);
  if (!finding) throw new NotFoundError('Finding not found');
  return finding;
};

module.exports = { create, findAll, findById, update, remove };
