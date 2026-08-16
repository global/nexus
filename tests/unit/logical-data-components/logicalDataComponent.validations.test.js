const { createSchema, updateSchema } = require('../../../src/modules/logical-data-components/logicalDataComponent.validations');

const dataEntityId = '507f1f77bcf86cd799439011';

describe('LogicalDataComponent Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({ description: 'x' });
      expect(error.details[0].path).toContain('name');
    });

    it('does not require description or encapsulatesDataEntity', () => {
      const { error } = createSchema.validate({ name: 'HR Data Model' });
      expect(error).toBeUndefined();
    });

    it('rejects a malformed id inside encapsulatesDataEntity', () => {
      const { error } = createSchema.validate({ name: 'HR Data Model', encapsulatesDataEntity: ['not-an-object-id'] });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        name: 'HR Data Model',
        description: 'Groups employee-related data entities.',
        encapsulatesDataEntity: [dataEntityId],
      });
      expect(error).toBeUndefined();
      expect(value.encapsulatesDataEntity).toEqual([dataEntityId]);
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });
  });
});
