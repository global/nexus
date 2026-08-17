const { createSchema, updateSchema } = require('../../../src/modules/portfolios/portfolio.validations');

const appId = '507f1f77bcf86cd799439011';
const actorId = '507f1f77bcf86cd799439012';
const capabilityId = '507f1f77bcf86cd799439013';

describe('Portfolio Validations', () => {
  describe('createSchema', () => {
    it('requires name, containsApplication, portfolioOwner, and alignsToCapability', () => {
      expect(createSchema.validate({}).error.details[0].path).toContain('name');
      expect(createSchema.validate({ name: 'Core Business Systems Portfolio' }).error.details[0].path).toContain('containsApplication');
      expect(createSchema.validate({ name: 'Core Business Systems Portfolio', containsApplication: [appId] }).error.details[0].path).toContain('portfolioOwner');
      expect(createSchema.validate({ name: 'Core Business Systems Portfolio', containsApplication: [appId], portfolioOwner: actorId }).error.details[0].path).toContain('alignsToCapability');
    });

    it('rejects an empty containsApplication array', () => {
      const { error } = createSchema.validate({
        name: 'Core Business Systems Portfolio',
        containsApplication: [],
        portfolioOwner: actorId,
        alignsToCapability: capabilityId,
      });
      expect(error).toBeDefined();
    });

    it('rejects a malformed portfolioOwner id', () => {
      const { error } = createSchema.validate({
        name: 'Core Business Systems Portfolio',
        containsApplication: [appId],
        portfolioOwner: 'not-an-object-id',
        alignsToCapability: capabilityId,
      });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        name: 'Core Business Systems Portfolio',
        description: 'Applications core to daily business operations.',
        containsApplication: [appId],
        portfolioOwner: actorId,
        alignsToCapability: capabilityId,
      });
      expect(error).toBeUndefined();
      expect(value.containsApplication).toEqual([appId]);
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('rejects an empty containsApplication array when provided', () => {
      const { error } = updateSchema.validate({ containsApplication: [] });
      expect(error).toBeDefined();
    });
  });
});
