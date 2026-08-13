jest.mock('../../../src/modules/code-repositories/codeRepository.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const CodeRepository = require('../../../src/modules/code-repositories/codeRepository.schema');
const repository = require('../../../src/modules/code-repositories/codeRepository.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CodeRepository Repository', () => {
  it('create constructs and saves a new CodeRepository document', async () => {
    const data = { name: 'customer-portal-web', url: 'https://git.example.com/sales/customer-portal-web' };
    const result = await repository.create(data);
    expect(CodeRepository).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'customer-portal-web' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    CodeRepository.find.mockReturnValue({ sort });
    const query = { $or: [{ name: { $regex: 'portal', $options: 'i' } }] };
    await repository.findAll(query);
    expect(CodeRepository.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to CodeRepository.findById', async () => {
    CodeRepository.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(CodeRepository.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    CodeRepository.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { lastUpdated: '2026-07-05' };
    await repository.updateById('1', data);
    expect(CodeRepository.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to CodeRepository.findByIdAndDelete', async () => {
    CodeRepository.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(CodeRepository.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
