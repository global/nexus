jest.mock('../../../src/modules/software-entitlements/softwareEntitlement.repository');

const repository = require('../../../src/modules/software-entitlements/softwareEntitlement.repository');
const service = require('../../../src/modules/software-entitlements/softwareEntitlement.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SoftwareEntitlement Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { entitledQuantity: 500, measuredByMetric: 'metric1' };
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

    it('translates measuredByMetric filter directly', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ measuredByMetric: 'metric1' });
      expect(repository.findAll).toHaveBeenCalledWith({ measuredByMetric: 'metric1' });
    });
  });

  describe('findById', () => {
    it('returns the entitlement when found', async () => {
      repository.findById.mockResolvedValue({ _id: '1' });
      await expect(service.findById('1')).resolves.toEqual({ _id: '1' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('returns the updated entitlement', async () => {
      repository.updateById.mockResolvedValue({ _id: '1', entitledQuantity: 600 });
      await expect(service.update('1', { entitledQuantity: 600 })).resolves.toEqual({ _id: '1', entitledQuantity: 600 });
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
