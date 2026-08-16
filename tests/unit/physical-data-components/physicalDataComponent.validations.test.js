const { createSchema, updateSchema } = require('../../../src/modules/physical-data-components/physicalDataComponent.validations');

const ldcId = '507f1f77bcf86cd799439011';

describe('PhysicalDataComponent Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({ description: 'x' });
      expect(error.details[0].path).toContain('name');
    });

    it('does not require description or realizesLogicalDataComponent', () => {
      const { error } = createSchema.validate({ name: 'HR Postgres Database' });
      expect(error).toBeUndefined();
    });

    it('rejects a malformed realizesLogicalDataComponent id', () => {
      const { error } = createSchema.validate({ name: 'HR Postgres Database', realizesLogicalDataComponent: 'not-an-object-id' });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        name: 'HR Postgres Database',
        description: 'Physical database backing the HR data model.',
        realizesLogicalDataComponent: ldcId,
      });
      expect(error).toBeUndefined();
      expect(value.realizesLogicalDataComponent).toBe(ldcId);
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });
  });
});
