jest.mock('../../../src/modules/roles/role.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const Role = require('../../../src/modules/roles/role.schema');
const repository = require('../../../src/modules/roles/role.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Role Repository', () => {
  it('create constructs and saves a new Role document', async () => {
    const data = { name: 'Chief Technology Officer' };
    const result = await repository.create(data);
    expect(Role).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'Chief Technology Officer' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    Role.find.mockReturnValue({ sort });
    const query = { $or: [{ name: { $regex: 'CTO', $options: 'i' } }] };
    await repository.findAll(query);
    expect(Role.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to Role.findById', async () => {
    Role.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(Role.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    Role.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { description: 'Updated' };
    await repository.updateById('1', data);
    expect(Role.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to Role.findByIdAndDelete', async () => {
    Role.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(Role.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
