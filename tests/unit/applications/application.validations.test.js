const { createSchema, updateSchema } = require('../../../src/modules/applications/application.validations');

const validOwnerId = '507f1f77bcf86cd799439011';

describe('Application Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({ owners: [validOwnerId] });
      expect(error.details[0].path).toContain('name');
    });

    it('requires at least one owner', () => {
      const { error } = createSchema.validate({ name: 'App' });
      expect(error.details[0].path).toContain('owners');
    });

    it('rejects an empty owners array', () => {
      const { error } = createSchema.validate({ name: 'App', owners: [] });
      expect(error).toBeDefined();
    });

    it('rejects a malformed ObjectId in owners', () => {
      const { error } = createSchema.validate({ name: 'App', owners: ['not-an-object-id'] });
      expect(error).toBeDefined();
    });

    it('rejects an invalid lifecycleStatus value', () => {
      const { error } = createSchema.validate({ name: 'App', owners: [validOwnerId], lifecycleStatus: 'NotARealStatus' });
      expect(error).toBeDefined();
    });

    it('rejects a malformed recoveryTimeObjective', () => {
      const { error } = createSchema.validate({ name: 'App', owners: [validOwnerId], recoveryTimeObjective: 'four hours' });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        name: 'Payments API',
        owners: [validOwnerId],
        lifecycleStatus: 'Operate',
        criticalityTier: 'Critical',
        complianceStandards: ['SOC2', 'GDPR'],
        recoveryTimeObjective: 'PT4H',
      });
      expect(error).toBeUndefined();
      expect(value.name).toBe('Payments API');
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('still requires at least one owner if owners is provided', () => {
      const { error } = updateSchema.validate({ owners: [] });
      expect(error).toBeDefined();
    });

    it('still rejects an invalid enum value', () => {
      const { error } = updateSchema.validate({ criticalityTier: 'extreme' });
      expect(error).toBeDefined();
    });
  });
});
