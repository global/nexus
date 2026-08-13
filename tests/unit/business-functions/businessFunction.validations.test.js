const { createSchema, updateSchema } = require('../../../src/modules/business-functions/businessFunction.validations');

describe('BusinessFunction Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({ description: 'x' });
      expect(error.details[0].path).toContain('name');
    });

    it('does not require description', () => {
      const { error } = createSchema.validate({ name: 'Order Fulfillment' });
      expect(error).toBeUndefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({ name: 'Order Fulfillment', description: 'Processing and shipping customer orders.' });
      expect(error).toBeUndefined();
      expect(value.name).toBe('Order Fulfillment');
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });
  });
});
