jest.mock('../../../src/modules/actors/actor.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/actors/actor.service');
const actorRoutes = require('../../../src/modules/actors/actor.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/actors', actorRoutes);
app.use(errorHandler);

const mockActor = { _id: 'actor1', name: 'Jane Austen', emailAddress: 'jane.austen@nexusapm.example' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Actor Controller', () => {
  describe('POST /api/actors', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/actors').send({ emailAddress: 'jane.austen@nexusapm.example' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 201 with the created actor on success', async () => {
      service.create.mockResolvedValue(mockActor);
      const res = await request(app).post('/api/actors').send({ name: 'Jane Austen' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Jane Austen');
    });

    it('returns 409 when the email address already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/actors').send({ name: 'Jane Austen', emailAddress: 'jane.austen@nexusapm.example' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/actors', () => {
    it('returns 200 with an array of actors', async () => {
      service.findAll.mockResolvedValue([mockActor]);
      const res = await request(app).get('/api/actors');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/actors?search=austen');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'austen' }));
    });
  });

  describe('GET /api/actors/:id', () => {
    it('returns 200 with the actor when found', async () => {
      service.findById.mockResolvedValue(mockActor);
      const res = await request(app).get('/api/actors/actor1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('actor1');
    });

    it('returns 404 when the actor is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Actor not found'));
      const res = await request(app).get('/api/actors/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/actors/:id', () => {
    it('returns 400 for an invalid field value', async () => {
      const res = await request(app).put('/api/actors/actor1').send({ emailAddress: 'not-an-email' });
      expect(res.status).toBe(400);
    });

    it('returns 200 with the updated actor', async () => {
      const updated = { ...mockActor, phoneNumber: '+1-555-0100' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/actors/actor1').send({ phoneNumber: '+1-555-0100' });
      expect(res.status).toBe(200);
      expect(res.body.phoneNumber).toBe('+1-555-0100');
    });

    it('returns 404 when the actor is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Actor not found'));
      const res = await request(app).put('/api/actors/nonexistent').send({ phoneNumber: '+1-555-0100' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/actors/:id', () => {
    it('returns 204 when the actor is deleted', async () => {
      service.remove.mockResolvedValue(mockActor);
      const res = await request(app).delete('/api/actors/actor1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the actor is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Actor not found'));
      const res = await request(app).delete('/api/actors/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
