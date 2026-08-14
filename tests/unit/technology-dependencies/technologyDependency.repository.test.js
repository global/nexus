jest.mock('../../../src/modules/technology-dependencies/technologyDependency.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const TechnologyDependency = require('../../../src/modules/technology-dependencies/technologyDependency.schema');
const repository = require('../../../src/modules/technology-dependencies/technologyDependency.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TechnologyDependency Repository', () => {
  it('create constructs and saves a new TechnologyDependency document', async () => {
    const data = { upstreamTechnologyComponent: 'ptc1', downstreamTechnologyComponent: 'ptc2', usesProtocol: 'DatabaseConnection', hasSynchronicity: 'Synchronous' };
    const result = await repository.create(data);
    expect(TechnologyDependency).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ upstreamTechnologyComponent: 'ptc1' }));
  });

  it('findAll queries with the given filter and sorts by createdAt', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    TechnologyDependency.find.mockReturnValue({ sort });
    const query = { upstreamTechnologyComponent: 'ptc1' };
    await repository.findAll(query);
    expect(TechnologyDependency.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ createdAt: 1 });
  });

  it('findById delegates to TechnologyDependency.findById', async () => {
    TechnologyDependency.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(TechnologyDependency.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    TechnologyDependency.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { usesProtocol: 'RESTAPI' };
    await repository.updateById('1', data);
    expect(TechnologyDependency.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to TechnologyDependency.findByIdAndDelete', async () => {
    TechnologyDependency.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(TechnologyDependency.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
