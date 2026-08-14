const { createSchema, updateSchema } = require('../../../src/modules/logical-application-components/logicalApplicationComponent.validations');

describe('LogicalApplicationComponent Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({ description: 'x' });
      expect(error.details[0].path).toContain('name');
    });

    it('does not require description', () => {
      const { error } = createSchema.validate({ name: 'BuildForge Core Logical Component' });
      expect(error).toBeUndefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({ name: 'BuildForge Core Logical Component', description: 'Core CI/CD logic, independent of deployment.' });
      expect(error).toBeUndefined();
      expect(value.name).toBe('BuildForge Core Logical Component');
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });
  });
});
