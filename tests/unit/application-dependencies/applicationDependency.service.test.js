jest.mock('../../../src/modules/application-dependencies/applicationDependency.repository');

const repository = require('../../../src/modules/application-dependencies/applicationDependency.repository');
const service = require('../../../src/modules/application-dependencies/applicationDependency.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ApplicationDependency Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { upstreamApplication: 'app1', downstreamApplication: 'app2', usesProtocol: 'RESTAPI', hasSynchronicity: 'Synchronous' };
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

    it('translates upstreamApplication, downstreamApplication, usesProtocol, and hasSynchronicity filters directly', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({
        upstreamApplication: 'app1',
        downstreamApplication: 'app2',
        usesProtocol: 'RESTAPI',
        hasSynchronicity: 'Synchronous',
      });
      expect(repository.findAll).toHaveBeenCalledWith({
        upstreamApplication: 'app1',
        downstreamApplication: 'app2',
        usesProtocol: 'RESTAPI',
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
      repository.updateById.mockResolvedValue({ _id: '1', usesProtocol: 'SOAP' });
      await expect(service.update('1', { usesProtocol: 'SOAP' })).resolves.toEqual({ _id: '1', usesProtocol: 'SOAP' });
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
