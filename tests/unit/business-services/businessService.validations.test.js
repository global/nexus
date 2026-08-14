const { createSchema, updateSchema } = require('../../../src/modules/business-services/businessService.validations');

const capabilityId = '507f1f77bcf86cd799439011';

describe('BusinessService Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({ description: 'x' });
      expect(error.details[0].path).toContain('name');
    });

    it('does not require description or supportsCapability', () => {
      const { error } = createSchema.validate({ name: 'Customer Onboarding API' });
      expect(error).toBeUndefined();
    });

    it('rejects a malformed supportsCapability id', () => {
      const { error } = createSchema.validate({ name: 'Customer Onboarding API', supportsCapability: 'not-an-object-id' });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        name: 'Customer Onboarding API',
        description: 'Exposes customer onboarding as a callable service.',
        supportsCapability: capabilityId,
      });
      expect(error).toBeUndefined();
      expect(value.supportsCapability).toBe(capabilityId);
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });
  });
});
