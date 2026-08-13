jest.mock('../../../src/modules/roles/role.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/roles/role.service');
const roleRoutes = require('../../../src/modules/roles/role.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/roles', roleRoutes);
app.use(errorHandler);

const mockRole = { _id: 'r1', name: 'Chief Technology Officer' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Role Controller', () => {
  describe('POST /api/roles', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/roles').send({ description: 'x' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 201 with the created role on success', async () => {
      service.create.mockResolvedValue(mockRole);
      const res = await request(app).post('/api/roles').send({ name: 'Chief Technology Officer' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Chief Technology Officer');
    });

    it('returns 409 when the name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/roles').send({ name: 'Chief Technology Officer' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/roles', () => {
    it('returns 200 with an array of roles', async () => {
      service.findAll.mockResolvedValue([mockRole]);
      const res = await request(app).get('/api/roles');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/roles?search=CTO');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'CTO' }));
    });
  });

  describe('GET /api/roles/:id', () => {
    it('returns 200 with the role when found', async () => {
      service.findById.mockResolvedValue(mockRole);
      const res = await request(app).get('/api/roles/r1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('r1');
    });

    it('returns 404 when the role is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Role not found'));
      const res = await request(app).get('/api/roles/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/roles/:id', () => {
    it('returns 200 with the updated role', async () => {
      const updated = { ...mockRole, description: 'Updated' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/roles/r1').send({ description: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Updated');
    });

    it('returns 404 when the role is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Role not found'));
      const res = await request(app).put('/api/roles/nonexistent').send({ description: 'x' });
      expect(res.status).toBe(404);
    });

    it('returns 409 when the updated name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.update.mockRejectedValue(err);
      const res = await request(app).put('/api/roles/r1').send({ name: 'Chief Information Security Officer' });
      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/roles/:id', () => {
    it('returns 204 when the role is deleted', async () => {
      service.remove.mockResolvedValue(mockRole);
      const res = await request(app).delete('/api/roles/r1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the role is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Role not found'));
      const res = await request(app).delete('/api/roles/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
