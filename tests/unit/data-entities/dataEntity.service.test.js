jest.mock('../../../src/modules/data-entities/dataEntity.repository');

const repository = require('../../../src/modules/data-entities/dataEntity.repository');
const service = require('../../../src/modules/data-entities/dataEntity.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DataEntity Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { name: 'Employee Record', hasDataSensitivity: ['PII'] };
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

    it('wraps a single hasDataSensitivity value in $in', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ hasDataSensitivity: 'PII' });
      expect(repository.findAll).toHaveBeenCalledWith({ hasDataSensitivity: { $in: ['PII'] } });
    });

    it('passes an array of hasDataSensitivity values through to $in', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ hasDataSensitivity: ['PII', 'Confidential'] });
      expect(repository.findAll).toHaveBeenCalledWith({ hasDataSensitivity: { $in: ['PII', 'Confidential'] } });
    });

    it('builds a case-insensitive $or search across name and description', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ search: 'Employee' });
      expect(repository.findAll).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: 'Employee', $options: 'i' } },
          { description: { $regex: 'Employee', $options: 'i' } },
        ],
      });
    });
  });

  describe('findById', () => {
    it('returns the data entity when found', async () => {
      repository.findById.mockResolvedValue({ _id: '1' });
      await expect(service.findById('1')).resolves.toEqual({ _id: '1' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('returns the updated data entity', async () => {
      repository.updateById.mockResolvedValue({ _id: '1', retentionPeriod: 'P7Y' });
      await expect(service.update('1', { retentionPeriod: 'P7Y' })).resolves.toEqual({ _id: '1', retentionPeriod: 'P7Y' });
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
