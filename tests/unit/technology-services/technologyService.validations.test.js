const { createSchema, updateSchema } = require('../../../src/modules/technology-services/technologyService.validations');

describe('TechnologyService Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({ description: 'x' });
      expect(error.details[0].path).toContain('name');
    });

    it('does not require description', () => {
      const { error } = createSchema.validate({ name: 'Container Orchestration' });
      expect(error).toBeUndefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({ name: 'Container Orchestration', description: 'Kubernetes-based workload scheduling.' });
      expect(error).toBeUndefined();
      expect(value.name).toBe('Container Orchestration');
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });
  });
});
