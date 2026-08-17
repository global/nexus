const { createSchema, updateSchema } = require('../../../src/modules/software-entitlements/softwareEntitlement.validations');

const metricId = '507f1f77bcf86cd799439011';

describe('SoftwareEntitlement Validations', () => {
  describe('createSchema', () => {
    it('requires entitledQuantity and measuredByMetric', () => {
      expect(createSchema.validate({}).error.details[0].path).toContain('entitledQuantity');
      expect(createSchema.validate({ entitledQuantity: 500 }).error.details[0].path).toContain('measuredByMetric');
    });

    it('rejects a non-integer entitledQuantity', () => {
      const { error } = createSchema.validate({ entitledQuantity: 500.5, measuredByMetric: metricId });
      expect(error).toBeDefined();
    });

    it('rejects a malformed measuredByMetric id', () => {
      const { error } = createSchema.validate({ entitledQuantity: 500, measuredByMetric: 'not-an-object-id' });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({ entitledQuantity: 500, measuredByMetric: metricId });
      expect(error).toBeUndefined();
      expect(value.measuredByMetric).toBe(metricId);
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });
  });
});
