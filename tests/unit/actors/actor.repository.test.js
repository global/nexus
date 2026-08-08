jest.mock('../../../src/modules/actors/actor.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const Actor = require('../../../src/modules/actors/actor.schema');
const repository = require('../../../src/modules/actors/actor.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Actor Repository', () => {
  it('create constructs and saves a new Actor document', async () => {
    const data = { name: 'Jane Austen' };
    const result = await repository.create(data);
    expect(Actor).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'Jane Austen' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    Actor.find.mockReturnValue({ sort });
    const query = { organizationUnit: '507f1f77bcf86cd799439011' };
    await repository.findAll(query);
    expect(Actor.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to Actor.findById', async () => {
    Actor.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(Actor.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    Actor.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { phoneNumber: '+1-555-0100' };
    await repository.updateById('1', data);
    expect(Actor.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to Actor.findByIdAndDelete', async () => {
    Actor.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(Actor.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
