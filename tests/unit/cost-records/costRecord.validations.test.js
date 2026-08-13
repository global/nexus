const { createSchema, updateSchema } = require('../../../src/modules/cost-records/costRecord.validations');

const appId = '507f1f77bcf86cd799439011';

const validPayload = {
  incurredByApplication: appId,
  hasCostCategory: 'Licensing',
  costAmount: 1000,
  costCurrency: 'USD',
  fiscalYear: '2026',
};

describe('CostRecord Validations', () => {
  describe('createSchema', () => {
    it('requires incurredByApplication', () => {
      const { error } = createSchema.validate({ ...validPayload, incurredByApplication: undefined });
      expect(error.details[0].path).toContain('incurredByApplication');
    });

    it('requires hasCostCategory', () => {
      const { error } = createSchema.validate({ ...validPayload, hasCostCategory: undefined });
      expect(error.details[0].path).toContain('hasCostCategory');
    });

    it('requires costAmount', () => {
      const { error } = createSchema.validate({ ...validPayload, costAmount: undefined });
      expect(error.details[0].path).toContain('costAmount');
    });

    it('requires costCurrency', () => {
      const { error } = createSchema.validate({ ...validPayload, costCurrency: undefined });
      expect(error.details[0].path).toContain('costCurrency');
    });

    it('requires fiscalYear', () => {
      const { error } = createSchema.validate({ ...validPayload, fiscalYear: undefined });
      expect(error.details[0].path).toContain('fiscalYear');
    });

    it('rejects an invalid hasCostCategory', () => {
      const { error } = createSchema.validate({ ...validPayload, hasCostCategory: 'NotARealCategory' });
      expect(error).toBeDefined();
    });

    it('rejects a currency code that is not 3 letters', () => {
      const { error } = createSchema.validate({ ...validPayload, costCurrency: 'US' });
      expect(error).toBeDefined();
    });

    it('uppercases a lowercase currency code', () => {
      const { error, value } = createSchema.validate({ ...validPayload, costCurrency: 'usd' });
      expect(error).toBeUndefined();
      expect(value.costCurrency).toBe('USD');
    });

    it('rejects a fiscalYear that is not a 4-digit year', () => {
      const { error } = createSchema.validate({ ...validPayload, fiscalYear: '26' });
      expect(error).toBeDefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate(validPayload);
      expect(error).toBeUndefined();
      expect(value.fiscalYear).toBe('2026');
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('rejects an invalid fiscalYear on partial update', () => {
      const { error } = updateSchema.validate({ fiscalYear: 'FY26' });
      expect(error).toBeDefined();
    });
  });
});
