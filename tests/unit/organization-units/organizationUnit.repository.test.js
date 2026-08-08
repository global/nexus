jest.mock('../../../src/modules/organization-units/organizationUnit.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const OrganizationUnit = require('../../../src/modules/organization-units/organizationUnit.schema');
const repository = require('../../../src/modules/organization-units/organizationUnit.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('OrganizationUnit Repository', () => {
  it('create constructs and saves a new OrganizationUnit document', async () => {
    const data = { name: 'Engineering' };
    const result = await repository.create(data);
    expect(OrganizationUnit).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'Engineering' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    OrganizationUnit.find.mockReturnValue({ sort });
    const query = { location: '507f1f77bcf86cd799439011' };
    await repository.findAll(query);
    expect(OrganizationUnit.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to OrganizationUnit.findById', async () => {
    OrganizationUnit.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(OrganizationUnit.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    OrganizationUnit.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { costCenterCode: 'CC-400' };
    await repository.updateById('1', data);
    expect(OrganizationUnit.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to OrganizationUnit.findByIdAndDelete', async () => {
    OrganizationUnit.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(OrganizationUnit.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
