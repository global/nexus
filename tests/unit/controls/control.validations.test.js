const { createSchema, updateSchema } = require('../../../src/modules/controls/control.validations');

describe('Control Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({});
      expect(error.details[0].path).toContain('name');
    });

    it('rejects an invalid supportsComplianceStandard value', () => {
      const { error } = createSchema.validate({ name: 'MFA', supportsComplianceStandard: ['NOT_A_REAL_STANDARD'] });
      expect(error).toBeDefined();
    });

    it('rejects a malformed lastReviewedDate', () => {
      const { error } = createSchema.validate({ name: 'MFA', lastReviewedDate: 'not-a-date' });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        name: 'Multi-Factor Authentication',
        controlReference: 'ISO/IEC 27002:2022',
        lastReviewedDate: '2026-02-10',
        supportsComplianceStandard: ['ISO27001'],
      });
      expect(error).toBeUndefined();
      expect(value.name).toBe('Multi-Factor Authentication');
    });

    it('accepts a payload with only a name', () => {
      const { error } = createSchema.validate({ name: 'Periodic Access Review' });
      expect(error).toBeUndefined();
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('still rejects an invalid supportsComplianceStandard value if provided', () => {
      const { error } = updateSchema.validate({ supportsComplianceStandard: ['NOT_A_REAL_STANDARD'] });
      expect(error).toBeDefined();
    });
  });
});
