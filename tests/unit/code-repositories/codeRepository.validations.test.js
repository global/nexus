const { createSchema, updateSchema } = require('../../../src/modules/code-repositories/codeRepository.validations');

describe('CodeRepository Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({ url: 'https://git.example.com/sales/customer-portal-web' });
      expect(error.details[0].path).toContain('name');
    });

    it('requires url', () => {
      const { error } = createSchema.validate({ name: 'customer-portal-web' });
      expect(error.details[0].path).toContain('url');
    });

    it('rejects a malformed url', () => {
      const { error } = createSchema.validate({ name: 'customer-portal-web', url: 'not-a-url' });
      expect(error).toBeDefined();
    });

    it('does not require lastUpdated', () => {
      const { error } = createSchema.validate({ name: 'customer-portal-web', url: 'https://git.example.com/sales/customer-portal-web' });
      expect(error).toBeUndefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        name: 'customer-portal-web',
        url: 'https://git.example.com/sales/customer-portal-web',
        lastUpdated: '2026-07-05',
      });
      expect(error).toBeUndefined();
      expect(value.name).toBe('customer-portal-web');
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('rejects a malformed url on partial update', () => {
      const { error } = updateSchema.validate({ url: 'not-a-url' });
      expect(error).toBeDefined();
    });
  });
});
