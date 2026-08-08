jest.mock('../../../src/modules/organization-units/organizationUnit.repository');

const repository = require('../../../src/modules/organization-units/organizationUnit.repository');
const service = require('../../../src/modules/organization-units/organizationUnit.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('OrganizationUnit Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { name: 'Engineering' };
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

    it('translates a location filter directly', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ location: 'loc1' });
      expect(repository.findAll).toHaveBeenCalledWith({ location: 'loc1' });
    });

    it('builds a case-insensitive $or search across name, description, and costCenterCode', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ search: 'engineering' });
      expect(repository.findAll).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: 'engineering', $options: 'i' } },
          { description: { $regex: 'engineering', $options: 'i' } },
          { costCenterCode: { $regex: 'engineering', $options: 'i' } },
        ],
      });
    });
  });

  describe('findById', () => {
    it('returns the organization unit when found', async () => {
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
