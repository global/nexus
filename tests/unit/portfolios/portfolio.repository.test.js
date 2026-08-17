jest.mock('../../../src/modules/portfolios/portfolio.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const Portfolio = require('../../../src/modules/portfolios/portfolio.schema');
const repository = require('../../../src/modules/portfolios/portfolio.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Portfolio Repository', () => {
  it('create constructs and saves a new Portfolio document', async () => {
    const data = { name: 'Core Business Systems Portfolio', containsApplication: ['app1'], portfolioOwner: 'actor1', alignsToCapability: 'cap1' };
    const result = await repository.create(data);
    expect(Portfolio).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'Core Business Systems Portfolio' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    Portfolio.find.mockReturnValue({ sort });
    const query = { portfolioOwner: 'actor1' };
    await repository.findAll(query);
    expect(Portfolio.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to Portfolio.findById', async () => {
    Portfolio.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(Portfolio.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    Portfolio.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { description: 'Updated' };
    await repository.updateById('1', data);
    expect(Portfolio.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to Portfolio.findByIdAndDelete', async () => {
    Portfolio.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(Portfolio.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
