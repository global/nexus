jest.mock('../../../src/modules/business-services/businessService.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const BusinessService = require('../../../src/modules/business-services/businessService.schema');
const repository = require('../../../src/modules/business-services/businessService.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BusinessService Repository', () => {
  it('create constructs and saves a new BusinessService document', async () => {
    const data = { name: 'Customer Onboarding API' };
    const result = await repository.create(data);
    expect(BusinessService).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'Customer Onboarding API' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    BusinessService.find.mockReturnValue({ sort });
    const query = { supportsCapability: 'cap1' };
    await repository.findAll(query);
    expect(BusinessService.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to BusinessService.findById', async () => {
    BusinessService.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(BusinessService.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    BusinessService.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { description: 'Updated' };
    await repository.updateById('1', data);
    expect(BusinessService.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to BusinessService.findByIdAndDelete', async () => {
    BusinessService.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(BusinessService.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
