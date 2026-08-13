jest.mock('../../../src/modules/locations/location.repository');

const repository = require('../../../src/modules/locations/location.repository');
const service = require('../../../src/modules/locations/location.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Location Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { name: 'NexusAPM HQ, Dublin, Ireland' };
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

    it('builds a case-insensitive $or search across name, description, and address', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ search: 'Dublin' });
      expect(repository.findAll).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: 'Dublin', $options: 'i' } },
          { description: { $regex: 'Dublin', $options: 'i' } },
          { address: { $regex: 'Dublin', $options: 'i' } },
        ],
      });
    });
  });

  describe('findById', () => {
    it('returns the location when found', async () => {
      repository.findById.mockResolvedValue({ _id: '1' });
      await expect(service.findById('1')).resolves.toEqual({ _id: '1' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('returns the updated location', async () => {
      repository.updateById.mockResolvedValue({ _id: '1', address: 'Updated' });
      await expect(service.update('1', { address: 'Updated' })).resolves.toEqual({ _id: '1', address: 'Updated' });
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
