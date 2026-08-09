jest.mock('../../../src/modules/suppliers/supplier.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const Supplier = require('../../../src/modules/suppliers/supplier.schema');
const repository = require('../../../src/modules/suppliers/supplier.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Supplier Repository', () => {
  it('create constructs and saves a new Supplier document', async () => {
    const data = { name: 'WorkforceCloud Inc.' };
    const result = await repository.create(data);
    expect(Supplier).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'WorkforceCloud Inc.' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    Supplier.find.mockReturnValue({ sort });
    const query = { certifications: { $in: ['SOC2'] } };
    await repository.findAll(query);
    expect(Supplier.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to Supplier.findById', async () => {
    Supplier.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(Supplier.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    Supplier.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { certifications: ['SOC2'] };
    await repository.updateById('1', data);
    expect(Supplier.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to Supplier.findByIdAndDelete', async () => {
    Supplier.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(Supplier.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
