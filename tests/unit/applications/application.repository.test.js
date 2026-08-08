jest.mock('../../../src/modules/applications/application.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  mockModel.aggregate = jest.fn();
  mockModel.countDocuments = jest.fn();
  return mockModel;
});

const Application = require('../../../src/modules/applications/application.schema');
const repository = require('../../../src/modules/applications/application.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Application Repository', () => {
  it('create constructs and saves a new Application document', async () => {
    const data = { name: 'Payments API', owners: ['507f1f77bcf86cd799439011'] };
    const result = await repository.create(data);
    expect(Application).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'Payments API' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    Application.find.mockReturnValue({ sort });
    const query = { lifecycleStatus: 'Operate' };
    await repository.findAll(query);
    expect(Application.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to Application.findById', async () => {
    Application.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(Application.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with new + runValidators options', async () => {
    Application.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { lifecycleStatus: 'Retired' };
    await repository.updateById('1', data);
    expect(Application.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to Application.findByIdAndDelete', async () => {
    Application.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(Application.findByIdAndDelete).toHaveBeenCalledWith('1');
  });

  it('aggregate delegates to Application.aggregate', async () => {
    const pipeline = [{ $group: { _id: '$lifecycleStatus', count: { $sum: 1 } } }];
    Application.aggregate.mockResolvedValue([{ _id: 'Operate', count: 2 }]);
    const result = await repository.aggregate(pipeline);
    expect(Application.aggregate).toHaveBeenCalledWith(pipeline);
    expect(result).toEqual([{ _id: 'Operate', count: 2 }]);
  });

  it('countDocuments delegates to Application.countDocuments', async () => {
    Application.countDocuments.mockResolvedValue(5);
    const result = await repository.countDocuments();
    expect(result).toBe(5);
  });
});
