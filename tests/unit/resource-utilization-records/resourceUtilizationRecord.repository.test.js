jest.mock('../../../src/modules/resource-utilization-records/resourceUtilizationRecord.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const ResourceUtilizationRecord = require('../../../src/modules/resource-utilization-records/resourceUtilizationRecord.schema');
const repository = require('../../../src/modules/resource-utilization-records/resourceUtilizationRecord.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ResourceUtilizationRecord Repository', () => {
  it('create constructs and saves a new ResourceUtilizationRecord document', async () => {
    const data = { measuresProduct: 'product1', measuredAgainstMetric: 'metric1', measuredValue: 340, measurementPeriodStart: '2026-01-01', measurementPeriodEnd: '2026-06-30' };
    const result = await repository.create(data);
    expect(ResourceUtilizationRecord).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ measuredValue: 340 }));
  });

  it('findAll queries with the given filter and sorts by measurementPeriodStart', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    ResourceUtilizationRecord.find.mockReturnValue({ sort });
    const query = { measuresProduct: 'product1' };
    await repository.findAll(query);
    expect(ResourceUtilizationRecord.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ measurementPeriodStart: 1 });
  });

  it('findById delegates to ResourceUtilizationRecord.findById', async () => {
    ResourceUtilizationRecord.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(ResourceUtilizationRecord.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    ResourceUtilizationRecord.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { measuredValue: 350 };
    await repository.updateById('1', data);
    expect(ResourceUtilizationRecord.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to ResourceUtilizationRecord.findByIdAndDelete', async () => {
    ResourceUtilizationRecord.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(ResourceUtilizationRecord.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
