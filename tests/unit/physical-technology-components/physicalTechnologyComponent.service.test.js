jest.mock('../../../src/modules/physical-technology-components/physicalTechnologyComponent.repository');

const repository = require('../../../src/modules/physical-technology-components/physicalTechnologyComponent.repository');
const service = require('../../../src/modules/physical-technology-components/physicalTechnologyComponent.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PhysicalTechnologyComponent Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { name: 'Build Farm Server' };
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

    it('translates hasEnvironment and realizesLogicalTechnologyComponent directly and builds a case-insensitive $or search', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ hasEnvironment: 'Production', realizesLogicalTechnologyComponent: 'ltc1', search: 'Build' });
      expect(repository.findAll).toHaveBeenCalledWith({
        hasEnvironment: 'Production',
        realizesLogicalTechnologyComponent: 'ltc1',
        $or: [
          { name: { $regex: 'Build', $options: 'i' } },
          { description: { $regex: 'Build', $options: 'i' } },
          { assetIdentifier: { $regex: 'Build', $options: 'i' } },
        ],
      });
    });
  });

  describe('findById', () => {
    it('returns the component when found', async () => {
      repository.findById.mockResolvedValue({ _id: '1' });
      await expect(service.findById('1')).resolves.toEqual({ _id: '1' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('returns the updated component', async () => {
      repository.updateById.mockResolvedValue({ _id: '1', hasEnvironment: 'Staging' });
      await expect(service.update('1', { hasEnvironment: 'Staging' })).resolves.toEqual({ _id: '1', hasEnvironment: 'Staging' });
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
