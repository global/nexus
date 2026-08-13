jest.mock('../../../src/modules/locations/location.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const Location = require('../../../src/modules/locations/location.schema');
const repository = require('../../../src/modules/locations/location.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Location Repository', () => {
  it('create constructs and saves a new Location document', async () => {
    const data = { name: 'NexusAPM HQ, Dublin, Ireland' };
    const result = await repository.create(data);
    expect(Location).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'NexusAPM HQ, Dublin, Ireland' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    Location.find.mockReturnValue({ sort });
    const query = { $or: [{ name: { $regex: 'Dublin', $options: 'i' } }] };
    await repository.findAll(query);
    expect(Location.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to Location.findById', async () => {
    Location.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(Location.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    Location.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { address: 'Updated address' };
    await repository.updateById('1', data);
    expect(Location.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to Location.findByIdAndDelete', async () => {
    Location.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(Location.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
