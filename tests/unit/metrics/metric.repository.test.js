jest.mock('../../../src/modules/metrics/metric.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const Metric = require('../../../src/modules/metrics/metric.schema');
const repository = require('../../../src/modules/metrics/metric.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Metric Repository', () => {
  it('create constructs and saves a new Metric document', async () => {
    const data = { name: 'Per Named User' };
    const result = await repository.create(data);
    expect(Metric).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'Per Named User' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    Metric.find.mockReturnValue({ sort });
    const query = { $or: [{ name: { $regex: 'User', $options: 'i' } }] };
    await repository.findAll(query);
    expect(Metric.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to Metric.findById', async () => {
    Metric.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(Metric.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    Metric.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { description: 'Updated' };
    await repository.updateById('1', data);
    expect(Metric.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to Metric.findByIdAndDelete', async () => {
    Metric.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(Metric.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
