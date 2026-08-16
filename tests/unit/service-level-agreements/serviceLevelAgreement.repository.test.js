jest.mock('../../../src/modules/service-level-agreements/serviceLevelAgreement.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const ServiceLevelAgreement = require('../../../src/modules/service-level-agreements/serviceLevelAgreement.schema');
const repository = require('../../../src/modules/service-level-agreements/serviceLevelAgreement.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ServiceLevelAgreement Repository', () => {
  it('create constructs and saves a new ServiceLevelAgreement document', async () => {
    const data = { appliesToApplication: 'app1', effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31', hasSLAMetric: ['m1'] };
    const result = await repository.create(data);
    expect(ServiceLevelAgreement).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ appliesToApplication: 'app1' }));
  });

  it('findAll queries with the given filter and sorts by effectiveFrom', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    ServiceLevelAgreement.find.mockReturnValue({ sort });
    const query = { appliesToApplication: 'app1' };
    await repository.findAll(query);
    expect(ServiceLevelAgreement.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ effectiveFrom: 1 });
  });

  it('findById delegates to ServiceLevelAgreement.findById', async () => {
    ServiceLevelAgreement.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(ServiceLevelAgreement.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    ServiceLevelAgreement.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { effectiveTo: '2027-12-31' };
    await repository.updateById('1', data);
    expect(ServiceLevelAgreement.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to ServiceLevelAgreement.findByIdAndDelete', async () => {
    ServiceLevelAgreement.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(ServiceLevelAgreement.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
