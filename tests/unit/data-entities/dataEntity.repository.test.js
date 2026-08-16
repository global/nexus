jest.mock('../../../src/modules/data-entities/dataEntity.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const DataEntity = require('../../../src/modules/data-entities/dataEntity.schema');
const repository = require('../../../src/modules/data-entities/dataEntity.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DataEntity Repository', () => {
  it('create constructs and saves a new DataEntity document', async () => {
    const data = { name: 'Employee Record', hasDataSensitivity: ['PII'] };
    const result = await repository.create(data);
    expect(DataEntity).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'Employee Record' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    DataEntity.find.mockReturnValue({ sort });
    const query = { hasDataSensitivity: { $in: ['PII'] } };
    await repository.findAll(query);
    expect(DataEntity.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to DataEntity.findById', async () => {
    DataEntity.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(DataEntity.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    DataEntity.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { retentionPeriod: 'P7Y' };
    await repository.updateById('1', data);
    expect(DataEntity.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to DataEntity.findByIdAndDelete', async () => {
    DataEntity.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(DataEntity.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
