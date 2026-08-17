jest.mock('../../../src/modules/software-products/softwareProduct.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const SoftwareProduct = require('../../../src/modules/software-products/softwareProduct.schema');
const repository = require('../../../src/modules/software-products/softwareProduct.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SoftwareProduct Repository', () => {
  it('create constructs and saves a new SoftwareProduct document', async () => {
    const data = { name: 'BuildForge Enterprise', version: '5.4' };
    const result = await repository.create(data);
    expect(SoftwareProduct).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'BuildForge Enterprise' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    SoftwareProduct.find.mockReturnValue({ sort });
    const query = { suppliedBy: 'supplier1' };
    await repository.findAll(query);
    expect(SoftwareProduct.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to SoftwareProduct.findById', async () => {
    SoftwareProduct.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(SoftwareProduct.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    SoftwareProduct.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { version: '5.5' };
    await repository.updateById('1', data);
    expect(SoftwareProduct.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to SoftwareProduct.findByIdAndDelete', async () => {
    SoftwareProduct.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(SoftwareProduct.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
