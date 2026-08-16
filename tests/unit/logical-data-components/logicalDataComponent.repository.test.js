jest.mock('../../../src/modules/logical-data-components/logicalDataComponent.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const LogicalDataComponent = require('../../../src/modules/logical-data-components/logicalDataComponent.schema');
const repository = require('../../../src/modules/logical-data-components/logicalDataComponent.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LogicalDataComponent Repository', () => {
  it('create constructs and saves a new LogicalDataComponent document', async () => {
    const data = { name: 'HR Data Model' };
    const result = await repository.create(data);
    expect(LogicalDataComponent).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'HR Data Model' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    LogicalDataComponent.find.mockReturnValue({ sort });
    const query = { encapsulatesDataEntity: 'de1' };
    await repository.findAll(query);
    expect(LogicalDataComponent.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to LogicalDataComponent.findById', async () => {
    LogicalDataComponent.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(LogicalDataComponent.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    LogicalDataComponent.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { description: 'Updated' };
    await repository.updateById('1', data);
    expect(LogicalDataComponent.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to LogicalDataComponent.findByIdAndDelete', async () => {
    LogicalDataComponent.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(LogicalDataComponent.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
