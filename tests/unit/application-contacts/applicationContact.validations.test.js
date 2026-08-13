const { createSchema, updateSchema } = require('../../../src/modules/application-contacts/applicationContact.validations');

const appId = '507f1f77bcf86cd799439011';
const actorId = '507f1f77bcf86cd799439012';
const roleId = '507f1f77bcf86cd799439013';

describe('ApplicationContact Validations', () => {
  describe('createSchema', () => {
    it('requires forApplication', () => {
      const { error } = createSchema.validate({ contactActor: actorId, contactRole: roleId });
      expect(error.details[0].path).toContain('forApplication');
    });

    it('requires contactActor', () => {
      const { error } = createSchema.validate({ forApplication: appId, contactRole: roleId });
      expect(error.details[0].path).toContain('contactActor');
    });

    it('requires contactRole', () => {
      const { error } = createSchema.validate({ forApplication: appId, contactActor: actorId });
      expect(error.details[0].path).toContain('contactRole');
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({ forApplication: appId, contactActor: actorId, contactRole: roleId });
      expect(error).toBeUndefined();
      expect(value.forApplication).toBe(appId);
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('rejects a malformed ObjectId', () => {
      const { error } = updateSchema.validate({ contactRole: 'not-an-object-id' });
      expect(error).toBeDefined();
    });
  });
});
