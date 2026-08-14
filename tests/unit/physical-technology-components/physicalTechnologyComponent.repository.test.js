jest.mock('../../../src/modules/physical-technology-components/physicalTechnologyComponent.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const PhysicalTechnologyComponent = require('../../../src/modules/physical-technology-components/physicalTechnologyComponent.schema');
const repository = require('../../../src/modules/physical-technology-components/physicalTechnologyComponent.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PhysicalTechnologyComponent Repository', () => {
  it('create constructs and saves a new PhysicalTechnologyComponent document', async () => {
    const data = { name: 'Build Farm Server', assetIdentifier: 'build-farm-prod-01.example.com' };
    const result = await repository.create(data);
    expect(PhysicalTechnologyComponent).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'Build Farm Server' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    PhysicalTechnologyComponent.find.mockReturnValue({ sort });
    const query = { hasEnvironment: 'Production' };
    await repository.findAll(query);
    expect(PhysicalTechnologyComponent.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to PhysicalTechnologyComponent.findById', async () => {
    PhysicalTechnologyComponent.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(PhysicalTechnologyComponent.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    PhysicalTechnologyComponent.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { hasEnvironment: 'Staging' };
    await repository.updateById('1', data);
    expect(PhysicalTechnologyComponent.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to PhysicalTechnologyComponent.findByIdAndDelete', async () => {
    PhysicalTechnologyComponent.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(PhysicalTechnologyComponent.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
