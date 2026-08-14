const { createSchema, updateSchema } = require('../../../src/modules/physical-application-components/physicalApplicationComponent.validations');

const lacId = '507f1f77bcf86cd799439011';
const ptcId = '507f1f77bcf86cd799439012';

describe('PhysicalApplicationComponent Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({ assetIdentifier: 'x' });
      expect(error.details[0].path).toContain('name');
    });

    it('does not require any other field', () => {
      const { error } = createSchema.validate({ name: 'DeployTrack Release Manager — Production Instance' });
      expect(error).toBeUndefined();
    });

    it('rejects an invalid hasEnvironment', () => {
      const { error } = createSchema.validate({ name: 'X', hasEnvironment: 'NotARealEnvironment' });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        name: 'DeployTrack Release Manager — Production Instance',
        assetIdentifier: 'app-deploytrack-prod-01.example.com',
        hasEnvironment: 'Production',
        realizesLogicalComponent: lacId,
        deployedOn: ptcId,
      });
      expect(error).toBeUndefined();
      expect(value.deployedOn).toBe(ptcId);
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });
  });
});
