const { createSchema, updateSchema } = require('../../../src/modules/locations/location.validations');

describe('Location Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({ address: '123 Main St' });
      expect(error.details[0].path).toContain('name');
    });

    it('does not require description or address', () => {
      const { error } = createSchema.validate({ name: 'NexusAPM HQ, Dublin, Ireland' });
      expect(error).toBeUndefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        name: 'NexusAPM HQ, Dublin, Ireland',
        description: 'Global headquarters.',
        address: '1 Grand Canal Quay, Dublin, Ireland',
      });
      expect(error).toBeUndefined();
      expect(value.name).toBe('NexusAPM HQ, Dublin, Ireland');
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });
  });
});
