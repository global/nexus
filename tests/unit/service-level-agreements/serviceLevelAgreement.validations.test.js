const { createSchema, updateSchema } = require('../../../src/modules/service-level-agreements/serviceLevelAgreement.validations');

const appId = '507f1f77bcf86cd799439011';
const metricId = '507f1f77bcf86cd799439012';

describe('ServiceLevelAgreement Validations', () => {
  describe('createSchema', () => {
    it('requires appliesToApplication, effectiveFrom, effectiveTo, and hasSLAMetric', () => {
      expect(createSchema.validate({}).error.details[0].path).toContain('appliesToApplication');
      expect(createSchema.validate({ appliesToApplication: appId }).error.details[0].path).toContain('effectiveFrom');
      expect(createSchema.validate({ appliesToApplication: appId, effectiveFrom: '2026-01-01' }).error.details[0].path).toContain('effectiveTo');
      expect(createSchema.validate({ appliesToApplication: appId, effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31' }).error.details[0].path).toContain('hasSLAMetric');
    });

    it('rejects an empty hasSLAMetric array', () => {
      const { error } = createSchema.validate({
        appliesToApplication: appId,
        effectiveFrom: '2026-01-01',
        effectiveTo: '2026-12-31',
        hasSLAMetric: [],
      });
      expect(error).toBeDefined();
    });

    it('rejects a malformed appliesToApplication id', () => {
      const { error } = createSchema.validate({
        appliesToApplication: 'not-an-object-id',
        effectiveFrom: '2026-01-01',
        effectiveTo: '2026-12-31',
        hasSLAMetric: [metricId],
      });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        appliesToApplication: appId,
        effectiveFrom: '2026-01-01',
        effectiveTo: '2026-12-31',
        hasSLAMetric: [metricId],
      });
      expect(error).toBeUndefined();
      expect(value.hasSLAMetric).toEqual([metricId]);
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('rejects an empty hasSLAMetric array when provided', () => {
      const { error } = updateSchema.validate({ hasSLAMetric: [] });
      expect(error).toBeDefined();
    });
  });
});
