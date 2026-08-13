jest.mock('../../../src/modules/application-dependencies/applicationDependency.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const ApplicationDependency = require('../../../src/modules/application-dependencies/applicationDependency.schema');
const repository = require('../../../src/modules/application-dependencies/applicationDependency.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ApplicationDependency Repository', () => {
  it('create constructs and saves a new ApplicationDependency document', async () => {
    const data = { upstreamApplication: 'app1', downstreamApplication: 'app2', usesProtocol: 'RESTAPI', hasSynchronicity: 'Synchronous' };
    const result = await repository.create(data);
    expect(ApplicationDependency).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ upstreamApplication: 'app1' }));
  });

  it('findAll queries with the given filter and sorts by createdAt', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    ApplicationDependency.find.mockReturnValue({ sort });
    const query = { upstreamApplication: 'app1' };
    await repository.findAll(query);
    expect(ApplicationDependency.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ createdAt: 1 });
  });

  it('findById delegates to ApplicationDependency.findById', async () => {
    ApplicationDependency.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(ApplicationDependency.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    ApplicationDependency.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { usesProtocol: 'SOAP' };
    await repository.updateById('1', data);
    expect(ApplicationDependency.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to ApplicationDependency.findByIdAndDelete', async () => {
    ApplicationDependency.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(ApplicationDependency.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
