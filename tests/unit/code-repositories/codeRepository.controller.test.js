jest.mock('../../../src/modules/code-repositories/codeRepository.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/code-repositories/codeRepository.service');
const codeRepositoryRoutes = require('../../../src/modules/code-repositories/codeRepository.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/code-repositories', codeRepositoryRoutes);
app.use(errorHandler);

const mockRepo = { _id: 'r1', name: 'customer-portal-web', url: 'https://git.example.com/sales/customer-portal-web' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CodeRepository Controller', () => {
  describe('POST /api/code-repositories', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/code-repositories').send({ url: 'https://git.example.com/x' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 400 when url is missing', async () => {
      const res = await request(app).post('/api/code-repositories').send({ name: 'customer-portal-web' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/url/);
    });

    it('returns 201 with the created repository on success', async () => {
      service.create.mockResolvedValue(mockRepo);
      const res = await request(app).post('/api/code-repositories').send({ name: 'customer-portal-web', url: 'https://git.example.com/sales/customer-portal-web' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('customer-portal-web');
    });
  });

  describe('GET /api/code-repositories', () => {
    it('returns 200 with an array of repositories', async () => {
      service.findAll.mockResolvedValue([mockRepo]);
      const res = await request(app).get('/api/code-repositories');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/code-repositories?search=portal');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'portal' }));
    });
  });

  describe('GET /api/code-repositories/:id', () => {
    it('returns 200 with the repository when found', async () => {
      service.findById.mockResolvedValue(mockRepo);
      const res = await request(app).get('/api/code-repositories/r1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('r1');
    });

    it('returns 404 when the repository is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Code repository not found'));
      const res = await request(app).get('/api/code-repositories/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/code-repositories/:id', () => {
    it('returns 200 with the updated repository', async () => {
      const updated = { ...mockRepo, lastUpdated: '2026-07-05' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/code-repositories/r1').send({ lastUpdated: '2026-07-05' });
      expect(res.status).toBe(200);
      expect(res.body.lastUpdated).toBe('2026-07-05');
    });

    it('returns 404 when the repository is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Code repository not found'));
      const res = await request(app).put('/api/code-repositories/nonexistent').send({ lastUpdated: '2026-07-05' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/code-repositories/:id', () => {
    it('returns 204 when the repository is deleted', async () => {
      service.remove.mockResolvedValue(mockRepo);
      const res = await request(app).delete('/api/code-repositories/r1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the repository is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Code repository not found'));
      const res = await request(app).delete('/api/code-repositories/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
