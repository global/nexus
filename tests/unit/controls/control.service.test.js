jest.mock('../../../src/modules/controls/control.repository');

const repository = require('../../../src/modules/controls/control.repository');
const service = require('../../../src/modules/controls/control.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Control Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { name: 'Multi-Factor Authentication' };
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

    it('wraps a scalar supportsComplianceStandard filter into a $in array', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ supportsComplianceStandard: 'ISO27001' });
      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ supportsComplianceStandard: { $in: ['ISO27001'] } })
      );
    });

    it('passes an array supportsComplianceStandard filter through as-is', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ supportsComplianceStandard: ['ISO27001', 'SOC2'] });
      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ supportsComplianceStandard: { $in: ['ISO27001', 'SOC2'] } })
      );
    });

    it('builds a case-insensitive $or search across name, description, and controlReference', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ search: 'access' });
      expect(repository.findAll).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: 'access', $options: 'i' } },
          { description: { $regex: 'access', $options: 'i' } },
          { controlReference: { $regex: 'access', $options: 'i' } },
        ],
      });
    });
  });

  describe('findById', () => {
    it('returns the control when found', async () => {
      repository.findById.mockResolvedValue({ _id: '1' });
      await expect(service.findById('1')).resolves.toEqual({ _id: '1' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
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
