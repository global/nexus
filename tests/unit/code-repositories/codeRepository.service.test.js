jest.mock('../../../src/modules/code-repositories/codeRepository.repository');

const repository = require('../../../src/modules/code-repositories/codeRepository.repository');
const service = require('../../../src/modules/code-repositories/codeRepository.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CodeRepository Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { name: 'customer-portal-web', url: 'https://git.example.com/sales/customer-portal-web' };
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

    it('builds a case-insensitive $or search across name and url', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ search: 'portal' });
      expect(repository.findAll).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: 'portal', $options: 'i' } },
          { url: { $regex: 'portal', $options: 'i' } },
        ],
      });
    });
  });

  describe('findById', () => {
    it('returns the repository when found', async () => {
      repository.findById.mockResolvedValue({ _id: '1' });
      await expect(service.findById('1')).resolves.toEqual({ _id: '1' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('returns the updated repository', async () => {
      repository.updateById.mockResolvedValue({ _id: '1', lastUpdated: '2026-07-05' });
      await expect(service.update('1', { lastUpdated: '2026-07-05' })).resolves.toEqual({ _id: '1', lastUpdated: '2026-07-05' });
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
