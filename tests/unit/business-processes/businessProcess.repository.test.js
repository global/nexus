jest.mock('../../../src/modules/business-processes/businessProcess.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const BusinessProcess = require('../../../src/modules/business-processes/businessProcess.schema');
const repository = require('../../../src/modules/business-processes/businessProcess.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BusinessProcess Repository', () => {
  it('create constructs and saves a new BusinessProcess document', async () => {
    const data = { name: 'Order-to-Cash' };
    const result = await repository.create(data);
    expect(BusinessProcess).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'Order-to-Cash' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    BusinessProcess.find.mockReturnValue({ sort });
    const query = { $or: [{ name: { $regex: 'Order', $options: 'i' } }] };
    await repository.findAll(query);
    expect(BusinessProcess.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to BusinessProcess.findById', async () => {
    BusinessProcess.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(BusinessProcess.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    BusinessProcess.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { description: 'Updated' };
    await repository.updateById('1', data);
    expect(BusinessProcess.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to BusinessProcess.findByIdAndDelete', async () => {
    BusinessProcess.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(BusinessProcess.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
