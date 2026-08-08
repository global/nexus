jest.mock('../../../src/modules/actors/actor.repository');

const repository = require('../../../src/modules/actors/actor.repository');
const service = require('../../../src/modules/actors/actor.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Actor Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { name: 'Jane Austen' };
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

    it('translates role and organizationUnit filters directly', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ role: 'r1', organizationUnit: 'ou1' });
      expect(repository.findAll).toHaveBeenCalledWith({ role: 'r1', organizationUnit: 'ou1' });
    });

    it('builds a case-insensitive $or search across name and emailAddress', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ search: 'austen' });
      expect(repository.findAll).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: 'austen', $options: 'i' } },
          { emailAddress: { $regex: 'austen', $options: 'i' } },
        ],
      });
    });
  });

  describe('findById', () => {
    it('returns the actor when found', async () => {
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
