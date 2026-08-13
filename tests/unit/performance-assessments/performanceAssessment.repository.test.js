jest.mock('../../../src/modules/performance-assessments/performanceAssessment.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const PerformanceAssessment = require('../../../src/modules/performance-assessments/performanceAssessment.schema');
const repository = require('../../../src/modules/performance-assessments/performanceAssessment.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PerformanceAssessment Repository', () => {
  it('create constructs and saves a new PerformanceAssessment document', async () => {
    const data = { assessesApplication: 'app1', assessedOn: '2026-03-01' };
    const result = await repository.create(data);
    expect(PerformanceAssessment).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ assessesApplication: 'app1' }));
  });

  it('findAll queries with the given filter and sorts by assessedOn', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    PerformanceAssessment.find.mockReturnValue({ sort });
    const query = { assessesApplication: 'app1' };
    await repository.findAll(query);
    expect(PerformanceAssessment.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ assessedOn: 1 });
  });

  it('findById delegates to PerformanceAssessment.findById', async () => {
    PerformanceAssessment.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(PerformanceAssessment.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    PerformanceAssessment.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { businessFitScore: 4 };
    await repository.updateById('1', data);
    expect(PerformanceAssessment.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to PerformanceAssessment.findByIdAndDelete', async () => {
    PerformanceAssessment.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(PerformanceAssessment.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
