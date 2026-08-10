jest.mock('../../../src/modules/findings/finding.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const Finding = require('../../../src/modules/findings/finding.schema');
const repository = require('../../../src/modules/findings/finding.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Finding Repository', () => {
  it('create constructs and saves a new Finding document', async () => {
    const data = { findingDetails: 'x', findingCategory: 'TechnicalRisk' };
    const result = await repository.create(data);
    expect(Finding).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ findingDetails: 'x' }));
  });

  it('findAll queries with the given filter and sorts by dueDate', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    Finding.find.mockReturnValue({ sort });
    const query = { findingStatus: 'Open' };
    await repository.findAll(query);
    expect(Finding.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ dueDate: 1 });
  });

  it('findById delegates to Finding.findById', async () => {
    Finding.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(Finding.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    Finding.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { findingStatus: 'Remediated' };
    await repository.updateById('1', data);
    expect(Finding.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to Finding.findByIdAndDelete', async () => {
    Finding.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(Finding.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
