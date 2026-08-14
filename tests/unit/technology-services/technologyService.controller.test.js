jest.mock('../../../src/modules/technology-services/technologyService.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/technology-services/technologyService.service');
const technologyServiceRoutes = require('../../../src/modules/technology-services/technologyService.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/technology-services', technologyServiceRoutes);
app.use(errorHandler);

const mockTechnologyService = { _id: 'ts1', name: 'Container Orchestration' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TechnologyService Controller', () => {
  describe('POST /api/technology-services', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/technology-services').send({ description: 'x' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 201 with the created technology service on success', async () => {
      service.create.mockResolvedValue(mockTechnologyService);
      const res = await request(app).post('/api/technology-services').send({ name: 'Container Orchestration' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Container Orchestration');
    });

    it('returns 409 when the name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/technology-services').send({ name: 'Container Orchestration' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/technology-services', () => {
    it('returns 200 with an array of technology services', async () => {
      service.findAll.mockResolvedValue([mockTechnologyService]);
      const res = await request(app).get('/api/technology-services');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/technology-services?search=Container');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'Container' }));
    });
  });

  describe('GET /api/technology-services/:id', () => {
    it('returns 200 with the technology service when found', async () => {
      service.findById.mockResolvedValue(mockTechnologyService);
      const res = await request(app).get('/api/technology-services/ts1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('ts1');
    });

    it('returns 404 when the technology service is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Technology service not found'));
      const res = await request(app).get('/api/technology-services/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/technology-services/:id', () => {
    it('returns 200 with the updated technology service', async () => {
      const updated = { ...mockTechnologyService, description: 'Updated' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/technology-services/ts1').send({ description: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Updated');
    });

    it('returns 404 when the technology service is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Technology service not found'));
      const res = await request(app).put('/api/technology-services/nonexistent').send({ description: 'x' });
      expect(res.status).toBe(404);
    });

    it('returns 409 when the updated name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.update.mockRejectedValue(err);
      const res = await request(app).put('/api/technology-services/ts1').send({ name: 'Other Service' });
      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/technology-services/:id', () => {
    it('returns 204 when the technology service is deleted', async () => {
      service.remove.mockResolvedValue(mockTechnologyService);
      const res = await request(app).delete('/api/technology-services/ts1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the technology service is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Technology service not found'));
      const res = await request(app).delete('/api/technology-services/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
