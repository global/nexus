const { createSchema, updateSchema } = require('../../../src/modules/documents/document.validations');

describe('Document Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({ url: 'https://wiki.example.com/threat-model' });
      expect(error.details[0].path).toContain('name');
    });

    it('requires url', () => {
      const { error } = createSchema.validate({ name: 'Threat Model' });
      expect(error.details[0].path).toContain('url');
    });

    it('rejects a malformed url', () => {
      const { error } = createSchema.validate({ name: 'Threat Model', url: 'not-a-url' });
      expect(error).toBeDefined();
    });

    it('rejects an invalid hasDocumentType', () => {
      const { error } = createSchema.validate({ name: 'Threat Model', url: 'https://wiki.example.com/threat-model', hasDocumentType: 'NotARealType' });
      expect(error).toBeDefined();
    });

    it('does not require hasDocumentType or lastUpdated', () => {
      const { error } = createSchema.validate({ name: 'Threat Model', url: 'https://wiki.example.com/threat-model' });
      expect(error).toBeUndefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        name: 'SecureAuth IAM Threat Model',
        hasDocumentType: 'ThreatModelDocType',
        url: 'https://wiki.example.com/iam/threat-model',
        lastUpdated: '2026-02-10',
      });
      expect(error).toBeUndefined();
      expect(value.name).toBe('SecureAuth IAM Threat Model');
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('rejects a malformed url on partial update', () => {
      const { error } = updateSchema.validate({ url: 'not-a-url' });
      expect(error).toBeDefined();
    });
  });
});
