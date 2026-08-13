jest.mock('../../../src/modules/business-functions/businessFunction.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const BusinessFunction = require('../../../src/modules/business-functions/businessFunction.schema');
const repository = require('../../../src/modules/business-functions/businessFunction.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BusinessFunction Repository', () => {
  it('create constructs and saves a new BusinessFunction document', async () => {
    const data = { name: 'Order Fulfillment' };
    const result = await repository.create(data);
    expect(BusinessFunction).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'Order Fulfillment' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    BusinessFunction.find.mockReturnValue({ sort });
    const query = { $or: [{ name: { $regex: 'Order', $options: 'i' } }] };
    await repository.findAll(query);
    expect(BusinessFunction.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to BusinessFunction.findById', async () => {
    BusinessFunction.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(BusinessFunction.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    BusinessFunction.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { description: 'Updated' };
    await repository.updateById('1', data);
    expect(BusinessFunction.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to BusinessFunction.findByIdAndDelete', async () => {
    BusinessFunction.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(BusinessFunction.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
