jest.mock('../../../src/modules/performance-assessments/performanceAssessment.repository');

const repository = require('../../../src/modules/performance-assessments/performanceAssessment.repository');
const service = require('../../../src/modules/performance-assessments/performanceAssessment.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PerformanceAssessment Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { assessesApplication: 'app1', assessedOn: '2026-03-01' };
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

    it('translates assessesApplication and assessedBy filters directly', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ assessesApplication: 'app1', assessedBy: 'actor1' });
      expect(repository.findAll).toHaveBeenCalledWith({ assessesApplication: 'app1', assessedBy: 'actor1' });
    });
  });

  describe('findById', () => {
    it('returns the assessment when found', async () => {
      repository.findById.mockResolvedValue({ _id: '1' });
      await expect(service.findById('1')).resolves.toEqual({ _id: '1' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('returns the updated assessment', async () => {
      repository.updateById.mockResolvedValue({ _id: '1', businessFitScore: 4 });
      await expect(service.update('1', { businessFitScore: 4 })).resolves.toEqual({ _id: '1', businessFitScore: 4 });
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
