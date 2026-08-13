jest.mock('../../../src/modules/application-contacts/applicationContact.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const ApplicationContact = require('../../../src/modules/application-contacts/applicationContact.schema');
const repository = require('../../../src/modules/application-contacts/applicationContact.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ApplicationContact Repository', () => {
  it('create constructs and saves a new ApplicationContact document', async () => {
    const data = { forApplication: 'app1', contactActor: 'actor1', contactRole: 'role1' };
    const result = await repository.create(data);
    expect(ApplicationContact).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ forApplication: 'app1' }));
  });

  it('findAll queries with the given filter and sorts by createdAt', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    ApplicationContact.find.mockReturnValue({ sort });
    const query = { forApplication: 'app1' };
    await repository.findAll(query);
    expect(ApplicationContact.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ createdAt: 1 });
  });

  it('findById delegates to ApplicationContact.findById', async () => {
    ApplicationContact.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(ApplicationContact.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    ApplicationContact.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { contactRole: 'role2' };
    await repository.updateById('1', data);
    expect(ApplicationContact.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to ApplicationContact.findByIdAndDelete', async () => {
    ApplicationContact.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(ApplicationContact.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
