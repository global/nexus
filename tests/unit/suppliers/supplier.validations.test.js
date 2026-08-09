const { createSchema, updateSchema } = require('../../../src/modules/suppliers/supplier.validations');

describe('Supplier Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({});
      expect(error.details[0].path).toContain('name');
    });

    it('rejects an invalid certification value', () => {
      const { error } = createSchema.validate({ name: 'WorkforceCloud Inc.', certifications: ['NOT_A_REAL_STANDARD'] });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload with multiple certifications', () => {
      const { error, value } = createSchema.validate({
        name: 'WorkforceCloud Inc.',
        certifications: ['SOC2', 'ISO27001'],
      });
      expect(error).toBeUndefined();
      expect(value.certifications).toEqual(['SOC2', 'ISO27001']);
    });

    it('accepts a payload with no certifications', () => {
      const { error } = createSchema.validate({ name: 'ProcureSuite Technologies' });
      expect(error).toBeUndefined();
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('still rejects an invalid certification if provided', () => {
      const { error } = updateSchema.validate({ certifications: ['NOT_A_REAL_STANDARD'] });
      expect(error).toBeDefined();
    });
  });
});
