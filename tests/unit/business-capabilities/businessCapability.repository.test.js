jest.mock('../../../src/modules/business-capabilities/businessCapability.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const BusinessCapability = require('../../../src/modules/business-capabilities/businessCapability.schema');
const repository = require('../../../src/modules/business-capabilities/businessCapability.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BusinessCapability Repository', () => {
  it('create constructs and saves a new BusinessCapability document', async () => {
    const data = { name: 'Information Technology' };
    const result = await repository.create(data);
    expect(BusinessCapability).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'Information Technology' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    BusinessCapability.find.mockReturnValue({ sort });
    const query = { capabilityLevel: 1 };
    await repository.findAll(query);
    expect(BusinessCapability.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to BusinessCapability.findById', async () => {
    BusinessCapability.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(BusinessCapability.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    BusinessCapability.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { capabilityWeight: 4 };
    await repository.updateById('1', data);
    expect(BusinessCapability.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to BusinessCapability.findByIdAndDelete', async () => {
    BusinessCapability.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(BusinessCapability.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
