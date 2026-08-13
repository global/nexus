jest.mock('../../../src/modules/cost-records/costRecord.repository');

const repository = require('../../../src/modules/cost-records/costRecord.repository');
const service = require('../../../src/modules/cost-records/costRecord.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CostRecord Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { incurredByApplication: 'app1', hasCostCategory: 'Licensing', costAmount: 1000, costCurrency: 'USD', fiscalYear: '2026' };
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

    it('translates incurredByApplication, hasCostCategory, and fiscalYear filters directly', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ incurredByApplication: 'app1', hasCostCategory: 'Support', fiscalYear: '2026' });
      expect(repository.findAll).toHaveBeenCalledWith({
        incurredByApplication: 'app1',
        hasCostCategory: 'Support',
        fiscalYear: '2026',
      });
    });
  });

  describe('findById', () => {
    it('returns the cost record when found', async () => {
      repository.findById.mockResolvedValue({ _id: '1' });
      await expect(service.findById('1')).resolves.toEqual({ _id: '1' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('returns the updated cost record', async () => {
      repository.updateById.mockResolvedValue({ _id: '1', costAmount: 2000 });
      await expect(service.update('1', { costAmount: 2000 })).resolves.toEqual({ _id: '1', costAmount: 2000 });
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
