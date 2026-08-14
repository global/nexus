jest.mock('../../../src/modules/physical-application-components/physicalApplicationComponent.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const PhysicalApplicationComponent = require('../../../src/modules/physical-application-components/physicalApplicationComponent.schema');
const repository = require('../../../src/modules/physical-application-components/physicalApplicationComponent.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PhysicalApplicationComponent Repository', () => {
  it('create constructs and saves a new PhysicalApplicationComponent document', async () => {
    const data = { name: 'DeployTrack Release Manager — Production Instance' };
    const result = await repository.create(data);
    expect(PhysicalApplicationComponent).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'DeployTrack Release Manager — Production Instance' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    PhysicalApplicationComponent.find.mockReturnValue({ sort });
    const query = { hasEnvironment: 'Production' };
    await repository.findAll(query);
    expect(PhysicalApplicationComponent.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to PhysicalApplicationComponent.findById', async () => {
    PhysicalApplicationComponent.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(PhysicalApplicationComponent.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    PhysicalApplicationComponent.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { hasEnvironment: 'Staging' };
    await repository.updateById('1', data);
    expect(PhysicalApplicationComponent.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to PhysicalApplicationComponent.findByIdAndDelete', async () => {
    PhysicalApplicationComponent.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(PhysicalApplicationComponent.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
