jest.mock('../../../src/modules/software-entitlements/softwareEntitlement.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const SoftwareEntitlement = require('../../../src/modules/software-entitlements/softwareEntitlement.schema');
const repository = require('../../../src/modules/software-entitlements/softwareEntitlement.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SoftwareEntitlement Repository', () => {
  it('create constructs and saves a new SoftwareEntitlement document', async () => {
    const data = { entitledQuantity: 500, measuredByMetric: 'metric1' };
    const result = await repository.create(data);
    expect(SoftwareEntitlement).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ entitledQuantity: 500 }));
  });

  it('findAll queries with the given filter and sorts by createdAt', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    SoftwareEntitlement.find.mockReturnValue({ sort });
    const query = { measuredByMetric: 'metric1' };
    await repository.findAll(query);
    expect(SoftwareEntitlement.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ createdAt: 1 });
  });

  it('findById delegates to SoftwareEntitlement.findById', async () => {
    SoftwareEntitlement.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(SoftwareEntitlement.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    SoftwareEntitlement.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { entitledQuantity: 600 };
    await repository.updateById('1', data);
    expect(SoftwareEntitlement.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to SoftwareEntitlement.findByIdAndDelete', async () => {
    SoftwareEntitlement.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(SoftwareEntitlement.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
