jest.mock('../../../src/modules/sla-metrics/slaMetric.repository');

const repository = require('../../../src/modules/sla-metrics/slaMetric.repository');
const service = require('../../../src/modules/sla-metrics/slaMetric.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SLAMetric Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { hasSLACategory: 'Availability', targetValue: 99.9, unitOfMeasure: 'percent' };
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

    it('translates hasSLACategory filter directly', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ hasSLACategory: 'ResponseTime' });
      expect(repository.findAll).toHaveBeenCalledWith({ hasSLACategory: 'ResponseTime' });
    });
  });

  describe('findById', () => {
    it('returns the metric when found', async () => {
      repository.findById.mockResolvedValue({ _id: '1' });
      await expect(service.findById('1')).resolves.toEqual({ _id: '1' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('returns the updated metric', async () => {
      repository.updateById.mockResolvedValue({ _id: '1', targetValue: 99.95 });
      await expect(service.update('1', { targetValue: 99.95 })).resolves.toEqual({ _id: '1', targetValue: 99.95 });
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
