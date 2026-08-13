const { createSchema, updateSchema } = require('../../../src/modules/roles/role.validations');

describe('Role Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({ description: 'x' });
      expect(error.details[0].path).toContain('name');
    });

    it('does not require description', () => {
      const { error } = createSchema.validate({ name: 'Chief Technology Officer' });
      expect(error).toBeUndefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({ name: 'Chief Technology Officer', description: 'Accountable for technology strategy.' });
      expect(error).toBeUndefined();
      expect(value.name).toBe('Chief Technology Officer');
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });
  });
});
