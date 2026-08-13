jest.mock('../../../src/modules/application-contacts/applicationContact.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/application-contacts/applicationContact.service');
const applicationContactRoutes = require('../../../src/modules/application-contacts/applicationContact.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/application-contacts', applicationContactRoutes);
app.use(errorHandler);

const appId = '507f1f77bcf86cd799439011';
const actorId = '507f1f77bcf86cd799439012';
const roleId = '507f1f77bcf86cd799439013';
const mockContact = { _id: 'c1', forApplication: appId, contactActor: actorId, contactRole: roleId };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ApplicationContact Controller', () => {
  describe('POST /api/application-contacts', () => {
    it('returns 400 when forApplication is missing', async () => {
      const res = await request(app).post('/api/application-contacts').send({ contactActor: actorId, contactRole: roleId });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/forApplication/);
    });

    it('returns 201 with the created contact on success', async () => {
      service.create.mockResolvedValue(mockContact);
      const res = await request(app).post('/api/application-contacts').send({ forApplication: appId, contactActor: actorId, contactRole: roleId });
      expect(res.status).toBe(201);
      expect(res.body.forApplication).toBe(appId);
    });
  });

  describe('GET /api/application-contacts', () => {
    it('returns 200 with an array of contacts', async () => {
      service.findAll.mockResolvedValue([mockContact]);
      const res = await request(app).get('/api/application-contacts');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/application-contacts?forApplication=' + appId);
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ forApplication: appId }));
    });
  });

  describe('GET /api/application-contacts/:id', () => {
    it('returns 200 with the contact when found', async () => {
      service.findById.mockResolvedValue(mockContact);
      const res = await request(app).get('/api/application-contacts/c1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('c1');
    });

    it('returns 404 when the contact is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Application contact not found'));
      const res = await request(app).get('/api/application-contacts/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/application-contacts/:id', () => {
    it('returns 200 with the updated contact', async () => {
      const newRoleId = '507f1f77bcf86cd799439014';
      const updated = { ...mockContact, contactRole: newRoleId };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/application-contacts/c1').send({ contactRole: newRoleId });
      expect(res.status).toBe(200);
      expect(res.body.contactRole).toBe(newRoleId);
    });

    it('returns 404 when the contact is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Application contact not found'));
      const res = await request(app).put('/api/application-contacts/nonexistent').send({ contactRole: roleId });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/application-contacts/:id', () => {
    it('returns 204 when the contact is deleted', async () => {
      service.remove.mockResolvedValue(mockContact);
      const res = await request(app).delete('/api/application-contacts/c1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the contact is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Application contact not found'));
      const res = await request(app).delete('/api/application-contacts/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
