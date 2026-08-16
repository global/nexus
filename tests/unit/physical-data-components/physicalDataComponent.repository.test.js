jest.mock('../../../src/modules/physical-data-components/physicalDataComponent.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const PhysicalDataComponent = require('../../../src/modules/physical-data-components/physicalDataComponent.schema');
const repository = require('../../../src/modules/physical-data-components/physicalDataComponent.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PhysicalDataComponent Repository', () => {
  it('create constructs and saves a new PhysicalDataComponent document', async () => {
    const data = { name: 'HR Postgres Database' };
    const result = await repository.create(data);
    expect(PhysicalDataComponent).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'HR Postgres Database' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    PhysicalDataComponent.find.mockReturnValue({ sort });
    const query = { realizesLogicalDataComponent: 'ldc1' };
    await repository.findAll(query);
    expect(PhysicalDataComponent.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to PhysicalDataComponent.findById', async () => {
    PhysicalDataComponent.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(PhysicalDataComponent.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    PhysicalDataComponent.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { description: 'Updated' };
    await repository.updateById('1', data);
    expect(PhysicalDataComponent.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to PhysicalDataComponent.findByIdAndDelete', async () => {
    PhysicalDataComponent.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(PhysicalDataComponent.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
