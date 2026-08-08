const { createSchema, updateSchema } = require('../../../src/modules/organization-units/organizationUnit.validations');

const validLocationId = '507f1f77bcf86cd799439011';

describe('OrganizationUnit Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({});
      expect(error.details[0].path).toContain('name');
    });

    it('rejects a malformed ObjectId for location', () => {
      const { error } = createSchema.validate({ name: 'Engineering', location: 'not-an-object-id' });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        name: 'Engineering',
        costCenterCode: 'CC-400',
        location: validLocationId,
      });
      expect(error).toBeUndefined();
      expect(value.name).toBe('Engineering');
    });

    it('accepts a payload with no costCenterCode or location', () => {
      const { error } = createSchema.validate({ name: 'Engineering' });
      expect(error).toBeUndefined();
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('still rejects a malformed ObjectId for location if provided', () => {
      const { error } = updateSchema.validate({ location: 'not-an-object-id' });
      expect(error).toBeDefined();
    });
  });
});
