const { createSchema, updateSchema } = require('../../../src/modules/data-entities/dataEntity.validations');

describe('DataEntity Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({ hasDataSensitivity: ['PII'] });
      expect(error.details[0].path).toContain('name');
    });

    it('does not require hasDataSensitivity or retentionPeriod', () => {
      const { error } = createSchema.validate({ name: 'Employee Record' });
      expect(error).toBeUndefined();
    });

    it('accepts multiple hasDataSensitivity values (PayrollRecord-style)', () => {
      const { error, value } = createSchema.validate({ name: 'Payroll Record', hasDataSensitivity: ['PII', 'Confidential'] });
      expect(error).toBeUndefined();
      expect(value.hasDataSensitivity).toEqual(['PII', 'Confidential']);
    });

    it('rejects an invalid hasDataSensitivity value', () => {
      const { error } = createSchema.validate({ name: 'X', hasDataSensitivity: ['NotARealSensitivity'] });
      expect(error).toBeDefined();
    });

    it('rejects a malformed retentionPeriod', () => {
      const { error } = createSchema.validate({ name: 'X', retentionPeriod: '7 years' });
      expect(error).toBeDefined();
    });

    it('accepts a valid ISO 8601 retentionPeriod', () => {
      const { error, value } = createSchema.validate({ name: 'X', retentionPeriod: 'P7Y' });
      expect(error).toBeUndefined();
      expect(value.retentionPeriod).toBe('P7Y');
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });
  });
});
