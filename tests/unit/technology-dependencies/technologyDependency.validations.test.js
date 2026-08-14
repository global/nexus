const { createSchema, updateSchema } = require('../../../src/modules/technology-dependencies/technologyDependency.validations');

const upstream = '507f1f77bcf86cd799439011';
const downstream = '507f1f77bcf86cd799439012';

describe('TechnologyDependency Validations', () => {
  describe('createSchema', () => {
    it('requires upstreamTechnologyComponent', () => {
      const { error } = createSchema.validate({ downstreamTechnologyComponent: downstream, usesProtocol: 'DatabaseConnection', hasSynchronicity: 'Synchronous' });
      expect(error.details[0].path).toContain('upstreamTechnologyComponent');
    });

    it('requires downstreamTechnologyComponent', () => {
      const { error } = createSchema.validate({ upstreamTechnologyComponent: upstream, usesProtocol: 'DatabaseConnection', hasSynchronicity: 'Synchronous' });
      expect(error.details[0].path).toContain('downstreamTechnologyComponent');
    });

    it('requires usesProtocol', () => {
      const { error } = createSchema.validate({ upstreamTechnologyComponent: upstream, downstreamTechnologyComponent: downstream, hasSynchronicity: 'Synchronous' });
      expect(error.details[0].path).toContain('usesProtocol');
    });

    it('requires hasSynchronicity', () => {
      const { error } = createSchema.validate({ upstreamTechnologyComponent: upstream, downstreamTechnologyComponent: downstream, usesProtocol: 'DatabaseConnection' });
      expect(error.details[0].path).toContain('hasSynchronicity');
    });

    it('rejects an invalid usesProtocol', () => {
      const { error } = createSchema.validate({ upstreamTechnologyComponent: upstream, downstreamTechnologyComponent: downstream, usesProtocol: 'Carrier Pigeon', hasSynchronicity: 'Synchronous' });
      expect(error).toBeDefined();
    });

    it('rejects downstreamTechnologyComponent equal to upstreamTechnologyComponent', () => {
      const { error } = createSchema.validate({ upstreamTechnologyComponent: upstream, downstreamTechnologyComponent: upstream, usesProtocol: 'DatabaseConnection', hasSynchronicity: 'Synchronous' });
      expect(error).toBeDefined();
      expect(error.message).toMatch(/different/);
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        upstreamTechnologyComponent: upstream,
        downstreamTechnologyComponent: downstream,
        usesProtocol: 'DatabaseConnection',
        hasSynchronicity: 'Synchronous',
      });
      expect(error).toBeUndefined();
      expect(value.usesProtocol).toBe('DatabaseConnection');
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('rejects downstreamTechnologyComponent equal to upstreamTechnologyComponent when both are present', () => {
      const { error } = updateSchema.validate({ upstreamTechnologyComponent: upstream, downstreamTechnologyComponent: upstream });
      expect(error).toBeDefined();
    });

    it('allows updating just one side (checked against the DB by the schema-level validator)', () => {
      const { error } = updateSchema.validate({ downstreamTechnologyComponent: downstream });
      expect(error).toBeUndefined();
    });
  });
});
