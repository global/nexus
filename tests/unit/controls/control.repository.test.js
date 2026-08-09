jest.mock('../../../src/modules/controls/control.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const Control = require('../../../src/modules/controls/control.schema');
const repository = require('../../../src/modules/controls/control.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Control Repository', () => {
  it('create constructs and saves a new Control document', async () => {
    const data = { name: 'Multi-Factor Authentication' };
    const result = await repository.create(data);
    expect(Control).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'Multi-Factor Authentication' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    Control.find.mockReturnValue({ sort });
    const query = { supportsComplianceStandard: { $in: ['ISO27001'] } };
    await repository.findAll(query);
    expect(Control.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to Control.findById', async () => {
    Control.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(Control.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    Control.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { controlReference: 'ISO/IEC 27002:2022 5.18' };
    await repository.updateById('1', data);
    expect(Control.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to Control.findByIdAndDelete', async () => {
    Control.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(Control.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
