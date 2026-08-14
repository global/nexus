jest.mock('../../../src/modules/technology-services/technologyService.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const TechnologyService = require('../../../src/modules/technology-services/technologyService.schema');
const repository = require('../../../src/modules/technology-services/technologyService.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TechnologyService Repository', () => {
  it('create constructs and saves a new TechnologyService document', async () => {
    const data = { name: 'Container Orchestration' };
    const result = await repository.create(data);
    expect(TechnologyService).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'Container Orchestration' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    TechnologyService.find.mockReturnValue({ sort });
    const query = { $or: [{ name: { $regex: 'Container', $options: 'i' } }] };
    await repository.findAll(query);
    expect(TechnologyService.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to TechnologyService.findById', async () => {
    TechnologyService.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(TechnologyService.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    TechnologyService.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { description: 'Updated' };
    await repository.updateById('1', data);
    expect(TechnologyService.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to TechnologyService.findByIdAndDelete', async () => {
    TechnologyService.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(TechnologyService.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
