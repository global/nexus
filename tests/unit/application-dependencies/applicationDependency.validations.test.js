const { createSchema, updateSchema } = require('../../../src/modules/application-dependencies/applicationDependency.validations');

const upstream = '507f1f77bcf86cd799439011';
const downstream = '507f1f77bcf86cd799439012';

describe('ApplicationDependency Validations', () => {
  describe('createSchema', () => {
    it('requires upstreamApplication', () => {
      const { error } = createSchema.validate({ downstreamApplication: downstream, usesProtocol: 'RESTAPI', hasSynchronicity: 'Synchronous' });
      expect(error.details[0].path).toContain('upstreamApplication');
    });

    it('requires downstreamApplication', () => {
      const { error } = createSchema.validate({ upstreamApplication: upstream, usesProtocol: 'RESTAPI', hasSynchronicity: 'Synchronous' });
      expect(error.details[0].path).toContain('downstreamApplication');
    });

    it('requires usesProtocol', () => {
      const { error } = createSchema.validate({ upstreamApplication: upstream, downstreamApplication: downstream, hasSynchronicity: 'Synchronous' });
      expect(error.details[0].path).toContain('usesProtocol');
    });

    it('requires hasSynchronicity', () => {
      const { error } = createSchema.validate({ upstreamApplication: upstream, downstreamApplication: downstream, usesProtocol: 'RESTAPI' });
      expect(error.details[0].path).toContain('hasSynchronicity');
    });

    it('rejects an invalid usesProtocol', () => {
      const { error } = createSchema.validate({ upstreamApplication: upstream, downstreamApplication: downstream, usesProtocol: 'Carrier Pigeon', hasSynchronicity: 'Synchronous' });
      expect(error).toBeDefined();
    });

    it('rejects downstreamApplication equal to upstreamApplication', () => {
      const { error } = createSchema.validate({ upstreamApplication: upstream, downstreamApplication: upstream, usesProtocol: 'RESTAPI', hasSynchronicity: 'Synchronous' });
      expect(error).toBeDefined();
      expect(error.message).toMatch(/different/);
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        upstreamApplication: upstream,
        downstreamApplication: downstream,
        usesProtocol: 'RESTAPI',
        hasSynchronicity: 'Synchronous',
      });
      expect(error).toBeUndefined();
      expect(value.usesProtocol).toBe('RESTAPI');
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('rejects downstreamApplication equal to upstreamApplication when both are present', () => {
      const { error } = updateSchema.validate({ upstreamApplication: upstream, downstreamApplication: upstream });
      expect(error).toBeDefined();
    });

    it('allows updating just one side (checked against the DB by the schema-level validator)', () => {
      const { error } = updateSchema.validate({ downstreamApplication: downstream });
      expect(error).toBeUndefined();
    });
  });
});
