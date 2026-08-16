jest.mock('../../../src/modules/sla-metrics/slaMetric.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const SLAMetric = require('../../../src/modules/sla-metrics/slaMetric.schema');
const repository = require('../../../src/modules/sla-metrics/slaMetric.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SLAMetric Repository', () => {
  it('create constructs and saves a new SLAMetric document', async () => {
    const data = { hasSLACategory: 'Availability', targetValue: 99.9, unitOfMeasure: 'percent' };
    const result = await repository.create(data);
    expect(SLAMetric).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ targetValue: 99.9 }));
  });

  it('findAll queries with the given filter and sorts by createdAt', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    SLAMetric.find.mockReturnValue({ sort });
    const query = { hasSLACategory: 'Availability' };
    await repository.findAll(query);
    expect(SLAMetric.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ createdAt: 1 });
  });

  it('findById delegates to SLAMetric.findById', async () => {
    SLAMetric.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(SLAMetric.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    SLAMetric.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { targetValue: 99.95 };
    await repository.updateById('1', data);
    expect(SLAMetric.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to SLAMetric.findByIdAndDelete', async () => {
    SLAMetric.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(SLAMetric.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
