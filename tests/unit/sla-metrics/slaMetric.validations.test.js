const { createSchema, updateSchema } = require('../../../src/modules/sla-metrics/slaMetric.validations');

describe('SLAMetric Validations', () => {
  describe('createSchema', () => {
    it('requires hasSLACategory, targetValue, and unitOfMeasure', () => {
      expect(createSchema.validate({}).error.details[0].path).toContain('hasSLACategory');
      expect(createSchema.validate({ hasSLACategory: 'Availability' }).error.details[0].path).toContain('targetValue');
      expect(createSchema.validate({ hasSLACategory: 'Availability', targetValue: 99.9 }).error.details[0].path).toContain('unitOfMeasure');
    });

    it('rejects a hasSLACategory outside the controlled vocabulary', () => {
      const { error } = createSchema.validate({ hasSLACategory: 'NotACategory', targetValue: 99.9, unitOfMeasure: 'percent' });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({ hasSLACategory: 'Availability', targetValue: 99.9, unitOfMeasure: 'percent' });
      expect(error).toBeUndefined();
      expect(value.hasSLACategory).toBe('Availability');
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('rejects a hasSLACategory outside the controlled vocabulary', () => {
      const { error } = updateSchema.validate({ hasSLACategory: 'NotACategory' });
      expect(error).toBeDefined();
    });
  });
});
