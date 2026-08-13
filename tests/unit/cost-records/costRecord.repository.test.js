jest.mock('../../../src/modules/cost-records/costRecord.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const CostRecord = require('../../../src/modules/cost-records/costRecord.schema');
const repository = require('../../../src/modules/cost-records/costRecord.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CostRecord Repository', () => {
  it('create constructs and saves a new CostRecord document', async () => {
    const data = { incurredByApplication: 'app1', hasCostCategory: 'Licensing', costAmount: 1000, costCurrency: 'USD', fiscalYear: '2026' };
    const result = await repository.create(data);
    expect(CostRecord).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ costAmount: 1000 }));
  });

  it('findAll queries with the given filter and sorts by fiscalYear', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    CostRecord.find.mockReturnValue({ sort });
    const query = { hasCostCategory: 'Support' };
    await repository.findAll(query);
    expect(CostRecord.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ fiscalYear: 1 });
  });

  it('findById delegates to CostRecord.findById', async () => {
    CostRecord.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(CostRecord.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    CostRecord.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { costAmount: 2000 };
    await repository.updateById('1', data);
    expect(CostRecord.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to CostRecord.findByIdAndDelete', async () => {
    CostRecord.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(CostRecord.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
