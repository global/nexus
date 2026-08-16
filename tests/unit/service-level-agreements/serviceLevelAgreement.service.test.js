jest.mock('../../../src/modules/service-level-agreements/serviceLevelAgreement.repository');

const repository = require('../../../src/modules/service-level-agreements/serviceLevelAgreement.repository');
const service = require('../../../src/modules/service-level-agreements/serviceLevelAgreement.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ServiceLevelAgreement Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { appliesToApplication: 'app1', effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31', hasSLAMetric: ['m1'] };
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

    it('translates appliesToApplication filter directly', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ appliesToApplication: 'app1' });
      expect(repository.findAll).toHaveBeenCalledWith({ appliesToApplication: 'app1' });
    });
  });

  describe('findById', () => {
    it('returns the SLA when found', async () => {
      repository.findById.mockResolvedValue({ _id: '1' });
      await expect(service.findById('1')).resolves.toEqual({ _id: '1' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('returns the updated SLA', async () => {
      repository.updateById.mockResolvedValue({ _id: '1', effectiveTo: '2027-12-31' });
      await expect(service.update('1', { effectiveTo: '2027-12-31' })).resolves.toEqual({ _id: '1', effectiveTo: '2027-12-31' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.updateById.mockResolvedValue(null);
      await expect(service.update('nonexistent', {})).rejects.toThrow(NotFoundError);
    });
  });

  describe('remove', () => {
    it('throws NotFoundError when missing', async () => {
      repository.deleteById.mockResolvedValue(null);
      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });
});
