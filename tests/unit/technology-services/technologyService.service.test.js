jest.mock('../../../src/modules/technology-services/technologyService.repository');

const repository = require('../../../src/modules/technology-services/technologyService.repository');
const service = require('../../../src/modules/technology-services/technologyService.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TechnologyService Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { name: 'Container Orchestration' };
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

    it('builds a case-insensitive $or search across name and description', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ search: 'Container' });
      expect(repository.findAll).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: 'Container', $options: 'i' } },
          { description: { $regex: 'Container', $options: 'i' } },
        ],
      });
    });
  });

  describe('findById', () => {
    it('returns the technology service when found', async () => {
      repository.findById.mockResolvedValue({ _id: '1' });
      await expect(service.findById('1')).resolves.toEqual({ _id: '1' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('returns the updated technology service', async () => {
      repository.updateById.mockResolvedValue({ _id: '1', description: 'Updated' });
      await expect(service.update('1', { description: 'Updated' })).resolves.toEqual({ _id: '1', description: 'Updated' });
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
