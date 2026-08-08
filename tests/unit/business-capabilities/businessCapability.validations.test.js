const { createSchema, updateSchema } = require('../../../src/modules/business-capabilities/businessCapability.validations');

const validParentId = '507f1f77bcf86cd799439011';

describe('BusinessCapability Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({});
      expect(error.details[0].path).toContain('name');
    });

    it('rejects a capabilityWeight above 5', () => {
      const { error } = createSchema.validate({ name: 'IT', capabilityWeight: 6 });
      expect(error).toBeDefined();
    });

    it('rejects a capabilityWeight below 1', () => {
      const { error } = createSchema.validate({ name: 'IT', capabilityWeight: 0 });
      expect(error).toBeDefined();
    });

    it('rejects a non-integer capabilityWeight', () => {
      const { error } = createSchema.validate({ name: 'IT', capabilityWeight: 2.5 });
      expect(error).toBeDefined();
    });

    it('rejects a capabilityLevel above 3', () => {
      const { error } = createSchema.validate({ name: 'IT', capabilityLevel: 4 });
      expect(error).toBeDefined();
    });

    it('rejects a malformed ObjectId for parentCapability', () => {
      const { error } = createSchema.validate({ name: 'IT', parentCapability: 'not-an-object-id' });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        name: 'Identity & Access Management',
        capabilityWeight: 5,
        capabilityLevel: 3,
        parentCapability: validParentId,
      });
      expect(error).toBeUndefined();
      expect(value.name).toBe('Identity & Access Management');
    });

    it('accepts a top-level capability with no parentCapability', () => {
      const { error } = createSchema.validate({ name: 'Information Technology', capabilityWeight: 5, capabilityLevel: 1 });
      expect(error).toBeUndefined();
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('still rejects an out-of-range capabilityWeight if provided', () => {
      const { error } = updateSchema.validate({ capabilityWeight: 10 });
      expect(error).toBeDefined();
    });
  });
});
