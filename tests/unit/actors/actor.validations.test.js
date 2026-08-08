const { createSchema, updateSchema } = require('../../../src/modules/actors/actor.validations');

const validRoleId = '507f1f77bcf86cd799439011';

describe('Actor Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({});
      expect(error.details[0].path).toContain('name');
    });

    it('rejects a malformed email address', () => {
      const { error } = createSchema.validate({ name: 'Jane Austen', emailAddress: 'not-an-email' });
      expect(error).toBeDefined();
    });

    it('rejects a malformed ObjectId for role', () => {
      const { error } = createSchema.validate({ name: 'Jane Austen', role: 'not-an-object-id' });
      expect(error).toBeDefined();
    });

    it('lowercases the email address', () => {
      const { value } = createSchema.validate({ name: 'Jane Austen', emailAddress: 'JANE.AUSTEN@nexusapm.example' });
      expect(value.emailAddress).toBe('jane.austen@nexusapm.example');
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        name: 'Jane Austen',
        emailAddress: 'jane.austen@nexusapm.example',
        phoneNumber: '+353-1-555-0100',
        role: validRoleId,
      });
      expect(error).toBeUndefined();
      expect(value.name).toBe('Jane Austen');
    });

    it('accepts a payload with no email (a non-human actor)', () => {
      const { error } = createSchema.validate({ name: 'Deployment Bot' });
      expect(error).toBeUndefined();
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('still rejects a malformed email address if provided', () => {
      const { error } = updateSchema.validate({ emailAddress: 'not-an-email' });
      expect(error).toBeDefined();
    });
  });
});
