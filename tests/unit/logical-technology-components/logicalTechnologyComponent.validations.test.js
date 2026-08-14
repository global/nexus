const { createSchema, updateSchema } = require('../../../src/modules/logical-technology-components/logicalTechnologyComponent.validations');

const serviceId = '507f1f77bcf86cd799439011';

describe('LogicalTechnologyComponent Validations', () => {
  describe('createSchema', () => {
    it('requires name', () => {
      const { error } = createSchema.validate({ description: 'x' });
      expect(error.details[0].path).toContain('name');
    });

    it('does not require description or providesTechnologyService', () => {
      const { error } = createSchema.validate({ name: 'Kubernetes Cluster' });
      expect(error).toBeUndefined();
    });

    it('rejects a malformed providesTechnologyService id', () => {
      const { error } = createSchema.validate({ name: 'Kubernetes Cluster', providesTechnologyService: 'not-an-object-id' });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        name: 'Kubernetes Cluster',
        description: 'Container orchestration platform.',
        providesTechnologyService: serviceId,
      });
      expect(error).toBeUndefined();
      expect(value.providesTechnologyService).toBe(serviceId);
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });
  });
});
