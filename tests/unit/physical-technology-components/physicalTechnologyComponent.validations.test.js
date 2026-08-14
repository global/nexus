const { createSchema, updateSchema } = require('../../../src/modules/physical-technology-components/physicalTechnologyComponent.validations');

const ltcId = '507f1f77bcf86cd799439011';

describe('PhysicalTechnologyComponent Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({ assetIdentifier: 'x' });
      expect(error.details[0].path).toContain('name');
    });

    it('does not require assetIdentifier, hasEnvironment, or realizesLogicalTechnologyComponent', () => {
      const { error } = createSchema.validate({ name: 'Build Farm Server' });
      expect(error).toBeUndefined();
    });

    it('rejects an invalid hasEnvironment', () => {
      const { error } = createSchema.validate({ name: 'Build Farm Server', hasEnvironment: 'NotARealEnvironment' });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        name: 'Build Farm Server',
        assetIdentifier: 'build-farm-prod-01.example.com',
        hasEnvironment: 'Production',
        realizesLogicalTechnologyComponent: ltcId,
      });
      expect(error).toBeUndefined();
      expect(value.hasEnvironment).toBe('Production');
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });
  });
});
