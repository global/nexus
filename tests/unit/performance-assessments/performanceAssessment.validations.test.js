const { createSchema, updateSchema } = require('../../../src/modules/performance-assessments/performanceAssessment.validations');

const appId = '507f1f77bcf86cd799439011';
const actorId = '507f1f77bcf86cd799439012';

const validPayload = {
  assessesApplication: appId,
  assessedBy: actorId,
  businessFitScore: 4,
  technicalFitScore: 2,
  assessedOn: '2026-03-01',
};

describe('PerformanceAssessment Validations', () => {
  describe('createSchema', () => {
    it('requires assessesApplication', () => {
      const { error } = createSchema.validate({ ...validPayload, assessesApplication: undefined });
      expect(error.details[0].path).toContain('assessesApplication');
    });

    it('requires assessedOn', () => {
      const { error } = createSchema.validate({ ...validPayload, assessedOn: undefined });
      expect(error.details[0].path).toContain('assessedOn');
    });

    it('does not require assessedBy, businessFitScore, or technicalFitScore', () => {
      const { error } = createSchema.validate({ assessesApplication: appId, assessedOn: '2026-03-01' });
      expect(error).toBeUndefined();
    });

    it('rejects businessFitScore outside 1-5', () => {
      const { error } = createSchema.validate({ ...validPayload, businessFitScore: 6 });
      expect(error).toBeDefined();
    });

    it('rejects technicalFitScore outside 1-5', () => {
      const { error } = createSchema.validate({ ...validPayload, technicalFitScore: 0 });
      expect(error).toBeDefined();
    });

    it('rejects a non-integer businessFitScore', () => {
      const { error } = createSchema.validate({ ...validPayload, businessFitScore: 3.5 });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate(validPayload);
      expect(error).toBeUndefined();
      expect(value.businessFitScore).toBe(4);
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('rejects an invalid score on partial update', () => {
      const { error } = updateSchema.validate({ technicalFitScore: 10 });
      expect(error).toBeDefined();
    });
  });
});
