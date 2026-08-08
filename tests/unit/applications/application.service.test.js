jest.mock('../../../src/modules/applications/application.repository');

const repository = require('../../../src/modules/applications/application.repository');
const service = require('../../../src/modules/applications/application.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Application Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { name: 'App', owners: ['507f1f77bcf86cd799439011'] };
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

    it('translates scalar filters directly', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ lifecycleStatus: 'Operate', criticalityTier: 'Critical', investmentStrategy: 'Invest', hostingModel: 'ExternallyHosted' });
      expect(repository.findAll).toHaveBeenCalledWith({
        lifecycleStatus: 'Operate',
        criticalityTier: 'Critical',
        investmentStrategy: 'Invest',
        hostingModel: 'ExternallyHosted',
      });
    });

    it('wraps a scalar complianceStandards filter into a $in array', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ complianceStandards: 'SOC2' });
      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ complianceStandards: { $in: ['SOC2'] } })
      );
    });

    it('passes an array complianceStandards filter through as-is', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ complianceStandards: ['SOC2', 'GDPR'] });
      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ complianceStandards: { $in: ['SOC2', 'GDPR'] } })
      );
    });

    it('builds a case-insensitive $or search across name and description', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ search: 'payments' });
      expect(repository.findAll).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: 'payments', $options: 'i' } },
          { description: { $regex: 'payments', $options: 'i' } },
        ],
      });
    });
  });

  describe('findById', () => {
    it('returns the application when found', async () => {
      repository.findById.mockResolvedValue({ _id: '1' });
      await expect(service.findById('1')).resolves.toEqual({ _id: '1' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('returns the updated application when found', async () => {
      repository.updateById.mockResolvedValue({ _id: '1', lifecycleStatus: 'Retired' });
      await expect(service.update('1', { lifecycleStatus: 'Retired' })).resolves.toEqual({ _id: '1', lifecycleStatus: 'Retired' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.updateById.mockResolvedValue(null);
      await expect(service.update('nonexistent', {})).rejects.toThrow(NotFoundError);
    });
  });

  describe('remove', () => {
    it('returns the removed application when found', async () => {
      repository.deleteById.mockResolvedValue({ _id: '1' });
      await expect(service.remove('1')).resolves.toEqual({ _id: '1' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.deleteById.mockResolvedValue(null);
      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getStats', () => {
    it('aggregates by lifecycleStatus, criticalityTier, investmentStrategy, plus total', async () => {
      repository.aggregate
        .mockResolvedValueOnce([{ _id: 'Operate', count: 3 }])
        .mockResolvedValueOnce([{ _id: 'Critical', count: 1 }])
        .mockResolvedValueOnce([{ _id: 'Invest', count: 2 }]);
      repository.countDocuments.mockResolvedValue(5);

      const stats = await service.getStats();

      expect(stats).toEqual({
        byLifecycleStatus: [{ _id: 'Operate', count: 3 }],
        byCriticalityTier: [{ _id: 'Critical', count: 1 }],
        byInvestmentStrategy: [{ _id: 'Invest', count: 2 }],
        total: 5,
      });
    });
  });
});
