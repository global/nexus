jest.mock('../../../src/modules/application-contacts/applicationContact.repository');

const repository = require('../../../src/modules/application-contacts/applicationContact.repository');
const service = require('../../../src/modules/application-contacts/applicationContact.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ApplicationContact Service', () => {
  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue({ _id: '1' });
      const data = { forApplication: 'app1', contactActor: 'actor1', contactRole: 'role1' };
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

    it('translates forApplication, contactActor, and contactRole filters directly', async () => {
      repository.findAll.mockResolvedValue([]);
      await service.findAll({ forApplication: 'app1', contactActor: 'actor1', contactRole: 'role1' });
      expect(repository.findAll).toHaveBeenCalledWith({
        forApplication: 'app1',
        contactActor: 'actor1',
        contactRole: 'role1',
      });
    });
  });

  describe('findById', () => {
    it('returns the contact when found', async () => {
      repository.findById.mockResolvedValue({ _id: '1' });
      await expect(service.findById('1')).resolves.toEqual({ _id: '1' });
    });

    it('throws NotFoundError when missing', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('returns the updated contact', async () => {
      repository.updateById.mockResolvedValue({ _id: '1', contactRole: 'role2' });
      await expect(service.update('1', { contactRole: 'role2' })).resolves.toEqual({ _id: '1', contactRole: 'role2' });
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
