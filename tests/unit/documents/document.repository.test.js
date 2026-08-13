jest.mock('../../../src/modules/documents/document.schema', () => {
  const mockModel = jest.fn().mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue({ ...data, _id: '1' }) }));
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

const Document = require('../../../src/modules/documents/document.schema');
const repository = require('../../../src/modules/documents/document.repository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Document Repository', () => {
  it('create constructs and saves a new Document document', async () => {
    const data = { name: 'SecureAuth IAM Threat Model', url: 'https://wiki.example.com/threat-model' };
    const result = await repository.create(data);
    expect(Document).toHaveBeenCalledWith(data);
    expect(result).toEqual(expect.objectContaining({ name: 'SecureAuth IAM Threat Model' }));
  });

  it('findAll queries with the given filter and sorts by name', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    Document.find.mockReturnValue({ sort });
    const query = { hasDocumentType: 'ThreatModelDocType' };
    await repository.findAll(query);
    expect(Document.find).toHaveBeenCalledWith(query);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });

  it('findById delegates to Document.findById', async () => {
    Document.findById.mockResolvedValue({ _id: '1' });
    const result = await repository.findById('1');
    expect(Document.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('updateById delegates with returnDocument/runValidators options', async () => {
    Document.findByIdAndUpdate.mockResolvedValue({ _id: '1' });
    const data = { lastUpdated: '2026-03-01' };
    await repository.updateById('1', data);
    expect(Document.findByIdAndUpdate).toHaveBeenCalledWith('1', data, { returnDocument: 'after', runValidators: true });
  });

  it('deleteById delegates to Document.findByIdAndDelete', async () => {
    Document.findByIdAndDelete.mockResolvedValue({ _id: '1' });
    await repository.deleteById('1');
    expect(Document.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
