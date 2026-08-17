const { createSchema, updateSchema } = require('../../../src/modules/resource-utilization-records/resourceUtilizationRecord.validations');

const productId = '507f1f77bcf86cd799439011';
const metricId = '507f1f77bcf86cd799439012';

describe('ResourceUtilizationRecord Validations', () => {
  describe('createSchema', () => {
    it('requires measuresProduct, measuredAgainstMetric, measuredValue, measurementPeriodStart, and measurementPeriodEnd', () => {
      expect(createSchema.validate({}).error.details[0].path).toContain('measuresProduct');
      expect(createSchema.validate({ measuresProduct: productId }).error.details[0].path).toContain('measuredAgainstMetric');
      expect(createSchema.validate({ measuresProduct: productId, measuredAgainstMetric: metricId }).error.details[0].path).toContain('measuredValue');
      expect(createSchema.validate({ measuresProduct: productId, measuredAgainstMetric: metricId, measuredValue: 340 }).error.details[0].path).toContain('measurementPeriodStart');
      expect(createSchema.validate({ measuresProduct: productId, measuredAgainstMetric: metricId, measuredValue: 340, measurementPeriodStart: '2026-01-01' }).error.details[0].path).toContain('measurementPeriodEnd');
    });

    it('rejects a malformed measuresProduct id', () => {
      const { error } = createSchema.validate({
        measuresProduct: 'not-an-object-id',
        measuredAgainstMetric: metricId,
        measuredValue: 340,
        measurementPeriodStart: '2026-01-01',
        measurementPeriodEnd: '2026-06-30',
      });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        measuresProduct: productId,
        measuredAgainstMetric: metricId,
        measuredValue: 340,
        measurementPeriodStart: '2026-01-01',
        measurementPeriodEnd: '2026-06-30',
      });
      expect(error).toBeUndefined();
      expect(value.measuresProduct).toBe(productId);
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });
  });
});
