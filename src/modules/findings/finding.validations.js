const Joi = require('joi');
const { FINDING_CATEGORY_VALUES, FINDING_STATUS_VALUES, IMPACT_TYPE_VALUES } = require('../../common/vocabularies');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'ObjectId');
const score1to5 = Joi.number().integer().min(1).max(5);

const baseSchema = {
  application: objectId,
  applicationComponent: objectId,
  technologyComponent: objectId,
  threatenedCapability: objectId,
  relatedControl: objectId,
  impactTypes: Joi.array().items(Joi.string().valid(...IMPACT_TYPE_VALUES)),
  cveId: Joi.string().trim(),
  cvssScore: Joi.number().min(0).max(10),
  identifiedOn: Joi.date(),
  dueDate: Joi.date(),
  resolvedDate: Joi.date(),
  riskScore: score1to5,
  likelihoodScore: score1to5,
  impactScore: score1to5,
};

// Cross-field rule mirroring apm-shapes.ttl's FindingCvssOnlyForVulnerabilityShape,
// for whichever of cvssScore/findingCategory are actually present in *this*
// payload. It cannot see a category already stored in the database for a
// partial update that omits findingCategory — that case is handled in
// finding.service.js, which can look the existing document up.
const cvssOnlyForVulnerability = (value, helpers) => {
  if (value.cvssScore !== undefined && value.findingCategory && value.findingCategory !== 'Vulnerability') {
    return helpers.message('cvssScore may only be populated on a Finding categorized as Vulnerability.');
  }
  return value;
};

const createSchema = Joi.object({
  findingDetails: Joi.string().trim().required(),
  findingCategory: Joi.string().valid(...FINDING_CATEGORY_VALUES).required(),
  findingStatus: Joi.string().valid(...FINDING_STATUS_VALUES),
  ...baseSchema,
}).custom(cvssOnlyForVulnerability);

const updateSchema = Joi.object({
  findingDetails: Joi.string().trim(),
  findingCategory: Joi.string().valid(...FINDING_CATEGORY_VALUES),
  findingStatus: Joi.string().valid(...FINDING_STATUS_VALUES),
  ...baseSchema,
}).custom(cvssOnlyForVulnerability);

module.exports = { createSchema, updateSchema };
