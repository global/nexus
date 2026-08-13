const { createSchema, updateSchema } = require('../../../src/modules/business-processes/businessProcess.validations');

const functionId = '507f1f77bcf86cd799439011';

describe('BusinessProcess Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({ description: 'x' });
      expect(error.details[0].path).toContain('name');
    });

    it('does not require description or realizesFunction', () => {
      const { error } = createSchema.validate({ name: 'Order-to-Cash' });
      expect(error).toBeUndefined();
    });

    it('rejects a malformed id inside realizesFunction', () => {
      const { error } = createSchema.validate({ name: 'Order-to-Cash', realizesFunction: ['not-an-object-id'] });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        name: 'Order-to-Cash',
        description: 'From order placement to payment collection.',
        realizesFunction: [functionId],
      });
      expect(error).toBeUndefined();
      expect(value.realizesFunction).toEqual([functionId]);
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });
  });
});
