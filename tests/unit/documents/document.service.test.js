jest.mock('../../../src/modules/documents/document.repository');

const repository = require('../../../src/modules/documents/document.repository');
const service = require('../../../src/modules/documents/document.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Document Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { name: 'Threat Model', url: 'https://wiki.example.com/threat-model' };
      const result = await service.create(data);
      expect(repository.create).toHaveBeenCalledWith(data);
      expect(result).toEqual({ _id: '1' });
    });
  });

  describe('findAll', () => {
    it('queries everything when no filters are given', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll();
      expect(repository.findAll).toHaveBeenCalledWith({});
    });

    it('translates hasDocumentType directly and builds a case-insensitive $or search across name and url', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ hasDocumentType: 'ThreatModelDocType', search: 'IAM' });
      expect(repository.findAll).toHaveBeenCalledWith({
        hasDocumentType: 'ThreatModelDocType',
        $or: [
          { name: { $regex: 'IAM', $options: 'i' } },
          { url: { $regex: 'IAM', $options: 'i' } },
        ],
      });
    });
  });

  describe('findById', () => {
    it('returns the document when found', async () => {
      repository.findById.mockResolvedValue({ _id: '1' });
      await expect(service.findById('1')).resolves.toEqual({ _id: '1' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('returns the updated document', async () => {
      repository.updateById.mockResolvedValue({ _id: '1', lastUpdated: '2026-03-01' });
      await expect(service.update('1', { lastUpdated: '2026-03-01' })).resolves.toEqual({ _id: '1', lastUpdated: '2026-03-01' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.updateById.mockResolvedValue(null);
      await expect(service.update('nonexistent', {})).rejects.toThrow(NotFoundError);
    });
  });

  describe('remove', () => {
    it('throws NotFoundError when missing', async () => {
      repository.deleteById.mockResolvedValue(null);
      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });
});
