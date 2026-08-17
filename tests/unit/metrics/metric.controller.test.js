jest.mock('../../../src/modules/metrics/metric.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/metrics/metric.service');
const metricRoutes = require('../../../src/modules/metrics/metric.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/metrics', metricRoutes);
app.use(errorHandler);

const mockMetric = { _id: 'm1', name: 'Per Named User' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Metric Controller', () => {
  describe('POST /api/metrics', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/metrics').send({ description: 'x' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 201 with the created metric on success', async () => {
      service.create.mockResolvedValue(mockMetric);
      const res = await request(app).post('/api/metrics').send({ name: 'Per Named User' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Per Named User');
    });

    it('returns 409 when the name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/metrics').send({ name: 'Per Named User' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/metrics', () => {
    it('returns 200 with an array of metrics', async () => {
      service.findAll.mockResolvedValue([mockMetric]);
      const res = await request(app).get('/api/metrics');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/metrics?search=User');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'User' }));
    });
  });

  describe('GET /api/metrics/:id', () => {
    it('returns 200 with the metric when found', async () => {
      service.findById.mockResolvedValue(mockMetric);
      const res = await request(app).get('/api/metrics/m1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('m1');
    });

    it('returns 404 when the metric is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Metric not found'));
      const res = await request(app).get('/api/metrics/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/metrics/:id', () => {
    it('returns 200 with the updated metric', async () => {
      const updated = { ...mockMetric, description: 'Updated' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/metrics/m1').send({ description: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Updated');
    });

    it('returns 404 when the metric is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Metric not found'));
      const res = await request(app).put('/api/metrics/nonexistent').send({ description: 'x' });
      expect(res.status).toBe(404);
    });

    it('returns 409 when the updated name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.update.mockRejectedValue(err);
      const res = await request(app).put('/api/metrics/m1').send({ name: 'Per Device' });
      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/metrics/:id', () => {
    it('returns 204 when the metric is deleted', async () => {
      service.remove.mockResolvedValue(mockMetric);
      const res = await request(app).delete('/api/metrics/m1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the metric is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Metric not found'));
      const res = await request(app).delete('/api/metrics/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
