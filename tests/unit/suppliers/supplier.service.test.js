jest.mock('../../../src/modules/suppliers/supplier.repository');

const repository = require('../../../src/modules/suppliers/supplier.repository');
const service = require('../../../src/modules/suppliers/supplier.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Supplier Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { name: 'WorkforceCloud Inc.' };
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

    it('wraps a scalar certifications filter into a $in array', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ certifications: 'SOC2' });
      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ certifications: { $in: ['SOC2'] } })
      );
    });

    it('passes an array certifications filter through as-is', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ certifications: ['SOC2', 'ISO27001'] });
      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ certifications: { $in: ['SOC2', 'ISO27001'] } })
      );
    });

    it('builds a case-insensitive $or search across name and description', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ search: 'workforce' });
      expect(repository.findAll).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: 'workforce', $options: 'i' } },
          { description: { $regex: 'workforce', $options: 'i' } },
        ],
      });
    });
  });

  describe('findById', () => {
    it('returns the supplier when found', async () => {
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
