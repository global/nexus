const { createSchema, updateSchema } = require('../../../src/modules/software-products/softwareProduct.validations');

const supplierId = '507f1f77bcf86cd799439011';
const entitlementId = '507f1f77bcf86cd799439012';

describe('SoftwareProduct Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({ version: '5.4' });
      expect(error.details[0].path).toContain('name');
    });

    it('does not require version, swidTagId, dates, suppliedBy, or coveredByEntitlement', () => {
      const { error } = createSchema.validate({ name: 'BuildForge Enterprise' });
      expect(error).toBeUndefined();
    });

    it('rejects a malformed suppliedBy id', () => {
      const { error } = createSchema.validate({ name: 'BuildForge Enterprise', suppliedBy: 'not-an-object-id' });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        name: 'BuildForge Enterprise',
        swidTagId: 'com.buildforge_enterprise-5.4',
        version: '5.4',
        endOfLifeDate: '2022-06-30',
        endOfSupportDate: '2023-12-31',
        suppliedBy: supplierId,
        coveredByEntitlement: entitlementId,
      });
      expect(error).toBeUndefined();
      expect(value.suppliedBy).toBe(supplierId);
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });
  });
});
