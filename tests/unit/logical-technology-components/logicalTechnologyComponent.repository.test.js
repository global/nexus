jest.mock('../../../src/modules/logical-technology-components/logicalTechnologyComponent.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const LogicalTechnologyComponent = require('../../../src/modules/logical-technology-components/logicalTechnologyComponent.schema');
const repository = require('../../../src/modules/logical-technology-components/logicalTechnologyComponent.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LogicalTechnologyComponent Repository', () => {
  it('create constructs and saves a new LogicalTechnologyComponent document', async () => {
    const data = { name: 'Kubernetes Cluster' };
    const result = await repository.create(data);
    expect(LogicalTechnologyComponent).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'Kubernetes Cluster' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    LogicalTechnologyComponent.find.mockReturnValue({ sort });
    const query = { providesTechnologyService: 'ts1' };
    await repository.findAll(query);
    expect(LogicalTechnologyComponent.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to LogicalTechnologyComponent.findById', async () => {
    LogicalTechnologyComponent.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(LogicalTechnologyComponent.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    LogicalTechnologyComponent.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { description: 'Updated' };
    await repository.updateById('1', data);
    expect(LogicalTechnologyComponent.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to LogicalTechnologyComponent.findByIdAndDelete', async () => {
    LogicalTechnologyComponent.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(LogicalTechnologyComponent.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
