const { createSchema, updateSchema } = require('../../../src/modules/findings/finding.validations');

describe('Finding Validations', () => {
  describe('createSchema', () => {
    it('requires findingDetails', () => {
      const { error } = createSchema.validate({ findingCategory: 'TechnicalRisk' });
      expect(error.details[0].path).toContain('findingDetails');
    });

    it('requires findingCategory', () => {
      const { error } = createSchema.validate({ findingDetails: 'x' });
      expect(error.details[0].path).toContain('findingCategory');
    });

    it('does not require findingStatus (defaults to Open at the schema layer)', () => {
      const { error } = createSchema.validate({ findingDetails: 'x', findingCategory: 'TechnicalRisk' });
      expect(error).toBeUndefined();
    });

    it('rejects an invalid findingCategory', () => {
      const { error } = createSchema.validate({ findingDetails: 'x', findingCategory: 'NotARealCategory' });
      expect(error).toBeDefined();
    });

    it('rejects riskScore outside 1-5', () => {
      const { error } = createSchema.validate({ findingDetails: 'x', findingCategory: 'TechnicalRisk', riskScore: 6 });
      expect(error).toBeDefined();
    });

    it('rejects cvssScore on a non-Vulnerability finding', () => {
      const { error } = createSchema.validate({ findingDetails: 'x', findingCategory: 'TechnicalRisk', cvssScore: 7.5 });
      expect(error).toBeDefined();
      expect(error.message).toMatch(/Vulnerability/);
    });

    it('accepts cvssScore on a Vulnerability finding', () => {
      const { error } = createSchema.validate({ findingDetails: 'x', findingCategory: 'Vulnerability', cvssScore: 9.1 });
      expect(error).toBeUndefined();
    });

    it('accepts a fully valid payload', () => {
      const { error, value } = createSchema.validate({
        findingDetails: 'Unauthenticated RCE in the payment integration library.',
        findingCategory: 'Vulnerability',
        findingStatus: 'Open',
        cveId: 'CVE-2026-13371',
        cvssScore: 9.1,
        riskScore: 5,
        likelihoodScore: 5,
        impactScore: 5,
        impactTypes: ['DataBreach', 'RegulatoryFine'],
      });
      expect(error).toBeUndefined();
      expect(value.cveId).toBe('CVE-2026-13371');
    });
  });

  describe('updateSchema', () => {
    it('allows an empty object (every field optional)', () => {
      const { error } = updateSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('rejects cvssScore paired with a non-Vulnerability findingCategory in the same payload', () => {
      const { error } = updateSchema.validate({ findingCategory: 'TechnicalRisk', cvssScore: 5 });
      expect(error).toBeDefined();
    });

    it('allows cvssScore alone, with no findingCategory in the payload (checked against the DB by the service layer)', () => {
      const { error } = updateSchema.validate({ cvssScore: 5 });
      expect(error).toBeUndefined();
    });
  });
});
