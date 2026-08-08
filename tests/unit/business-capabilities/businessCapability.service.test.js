jest.mock('../../../src/modules/business-capabilities/businessCapability.repository');

const repository = require('../../../src/modules/business-capabilities/businessCapability.repository');
const service = require('../../../src/modules/business-capabilities/businessCapability.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BusinessCapability Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { name: 'Information Technology' };
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

    it('translates parentCapability and capabilityLevel filters directly', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ parentCapability: 'p1', capabilityLevel: 2 });
      expect(repository.findAll).toHaveBeenCalledWith({ parentCapability: 'p1', capabilityLevel: 2 });
    });

    it('builds a case-insensitive $or search across name and description', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ search: 'identity' });
      expect(repository.findAll).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: 'identity', $options: 'i' } },
          { description: { $regex: 'identity', $options: 'i' } },
        ],
      });
    });
  });

  describe('findById', () => {
    it('returns the capability when found', async () => {
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
  });

  describe('remove', () => {
    it('throws NotFoundError when missing', async () => {
      repository.deleteById.mockResolvedValue(null);
      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });
});
