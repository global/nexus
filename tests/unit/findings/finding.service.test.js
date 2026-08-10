jest.mock('../../../src/modules/findings/finding.repository');

const repository = require('../../../src/modules/findings/finding.repository');
const service = require('../../../src/modules/findings/finding.service');
const { NotFoundError, ValidationError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Finding Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { findingDetails: 'x', findingCategory: 'TechnicalRisk' };
      const result = await service.create(data);
      expect(repository.create).toHaveBeenCalledWith(data);
      expect(result).toEqual({ _id: '1' });
    });
  });

  describe('findAll', () => {
    it('queries everything when no filters are given', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll();
      expect(repository.findAll).toHaveBeenCalledWith({});
    });

    it('translates findingCategory, findingStatus, and application filters directly', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ findingCategory: 'Vulnerability', findingStatus: 'Open', application: 'app1' });
      expect(repository.findAll).toHaveBeenCalledWith({ findingCategory: 'Vulnerability', findingStatus: 'Open', application: 'app1' });
    });

    it('builds a case-insensitive $or search across findingDetails and cveId', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ search: 'CVE-2026' });
      expect(repository.findAll).toHaveBeenCalledWith({
        $or: [
          { findingDetails: { $regex: 'CVE-2026', $options: 'i' } },
          { cveId: { $regex: 'CVE-2026', $options: 'i' } },
        ],
      });
    });
  });

  describe('findById', () => {
    it('returns the finding when found', async () => {
      repository.findById.mockResolvedValue({ _id: '1' });
      await expect(service.findById('1')).resolves.toEqual({ _id: '1' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('throws NotFoundError when missing', async () => {
      repository.updateById.mockResolvedValue(null);
      await expect(service.update('nonexistent', {})).rejects.toThrow(NotFoundError);
    });

    it('updates normally when cvssScore is not touched', async () => {
      repository.updateById.mockResolvedValue({ _id: '1', findingStatus: 'Remediated' });
      await service.update('1', { findingStatus: 'Remediated' });
      expect(repository.findById).not.toHaveBeenCalled();
      expect(repository.updateById).toHaveBeenCalledWith('1', { findingStatus: 'Remediated' });
    });

    it('allows setting cvssScore alongside findingCategory=Vulnerability in the same payload, without an extra lookup', async () => {
      repository.updateById.mockResolvedValue({ _id: '1', cvssScore: 8 });
      await service.update('1', { findingCategory: 'Vulnerability', cvssScore: 8 });
      expect(repository.findById).not.toHaveBeenCalled();
      expect(repository.updateById).toHaveBeenCalledWith('1', { findingCategory: 'Vulnerability', cvssScore: 8 });
    });

    it('allows setting cvssScore alone when the existing stored category is already Vulnerability', async () => {
      repository.findById.mockResolvedValue({ _id: '1', findingCategory: 'Vulnerability' });
      repository.updateById.mockResolvedValue({ _id: '1', cvssScore: 8 });
      await service.update('1', { cvssScore: 8 });
      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(repository.updateById).toHaveBeenCalledWith('1', { cvssScore: 8 });
    });

    it('rejects setting cvssScore alone when the existing stored category is not Vulnerability', async () => {
      repository.findById.mockResolvedValue({ _id: '1', findingCategory: 'TechnicalRisk' });
      await expect(service.update('1', { cvssScore: 8 })).rejects.toThrow(ValidationError);
      expect(repository.updateById).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('throws NotFoundError when missing', async () => {
      repository.deleteById.mockResolvedValue(null);
      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });
});
