const { createSchema, updateSchema } = require('../../../src/modules/metrics/metric.validations');

describe('Metric Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({ description: 'x' });
      expect(error.details[0].path).toContain('name');
    });

    it('does not require description', () => {
      const { error } = createSchema.validate({ name: 'Per Named User' });
      expect(error).toBeUndefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({ name: 'Per Named User', description: 'One license per named individual user.' });
      expect(error).toBeUndefined();
      expect(value.name).toBe('Per Named User');
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });
  });
});
