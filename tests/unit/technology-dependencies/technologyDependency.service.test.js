jest.mock('../../../src/modules/technology-dependencies/technologyDependency.repository');

const repository = require('../../../src/modules/technology-dependencies/technologyDependency.repository');
const service = require('../../../src/modules/technology-dependencies/technologyDependency.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TechnologyDependency Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { upstreamTechnologyComponent: 'ptc1', downstreamTechnologyComponent: 'ptc2', usesProtocol: 'DatabaseConnection', hasSynchronicity: 'Synchronous' };
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

    it('translates upstreamTechnologyComponent, downstreamTechnologyComponent, usesProtocol, and hasSynchronicity filters directly', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({
        upstreamTechnologyComponent: 'ptc1',
        downstreamTechnologyComponent: 'ptc2',
        usesProtocol: 'DatabaseConnection',
        hasSynchronicity: 'Synchronous',
      });
      expect(repository.findAll).toHaveBeenCalledWith({
        upstreamTechnologyComponent: 'ptc1',
        downstreamTechnologyComponent: 'ptc2',
        usesProtocol: 'DatabaseConnection',
        hasSynchronicity: 'Synchronous',
      });
    });
  });

  describe('findById', () => {
    it('returns the dependency when found', async () => {
      repository.findById.mockResolvedValue({ _id: '1' });
      await expect(service.findById('1')).resolves.toEqual({ _id: '1' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('returns the updated dependency', async () => {
      repository.updateById.mockResolvedValue({ _id: '1', usesProtocol: 'RESTAPI' });
      await expect(service.update('1', { usesProtocol: 'RESTAPI' })).resolves.toEqual({ _id: '1', usesProtocol: 'RESTAPI' });
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
