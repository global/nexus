jest.mock('../../../src/modules/sla-metrics/slaMetric.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/sla-metrics/slaMetric.service');
const slaMetricRoutes = require('../../../src/modules/sla-metrics/slaMetric.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/sla-metrics', slaMetricRoutes);
app.use(errorHandler);

const mockMetric = { _id: 'm1', hasSLACategory: 'Availability', targetValue: 99.9, unitOfMeasure: 'percent' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SLAMetric Controller', () => {
  describe('POST /api/sla-metrics', () => {
    it('returns 400 when hasSLACategory is missing', async () => {
      const res = await request(app).post('/api/sla-metrics').send({ targetValue: 99.9, unitOfMeasure: 'percent' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/hasSLACategory/);
    });

    it('returns 201 with the created metric on success', async () => {
      service.create.mockResolvedValue(mockMetric);
      const res = await request(app).post('/api/sla-metrics').send({ hasSLACategory: 'Availability', targetValue: 99.9, unitOfMeasure: 'percent' });
      expect(res.status).toBe(201);
      expect(res.body.targetValue).toBe(99.9);
    });
  });

  describe('GET /api/sla-metrics', () => {
    it('returns 200 with an array of metrics', async () => {
      service.findAll.mockResolvedValue([mockMetric]);
      const res = await request(app).get('/api/sla-metrics');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/sla-metrics?hasSLACategory=Availability');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ hasSLACategory: 'Availability' }));
    });
  });

  describe('GET /api/sla-metrics/:id', () => {
    it('returns 200 with the metric when found', async () => {
      service.findById.mockResolvedValue(mockMetric);
      const res = await request(app).get('/api/sla-metrics/m1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('m1');
    });

    it('returns 404 when the metric is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('SLA metric not found'));
      const res = await request(app).get('/api/sla-metrics/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/sla-metrics/:id', () => {
    it('returns 200 with the updated metric', async () => {
      const updated = { ...mockMetric, targetValue: 99.95 };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/sla-metrics/m1').send({ targetValue: 99.95 });
      expect(res.status).toBe(200);
      expect(res.body.targetValue).toBe(99.95);
    });

    it('returns 404 when the metric is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('SLA metric not found'));
      const res = await request(app).put('/api/sla-metrics/nonexistent').send({ targetValue: 99.95 });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/sla-metrics/:id', () => {
    it('returns 204 when the metric is deleted', async () => {
      service.remove.mockResolvedValue(mockMetric);
      const res = await request(app).delete('/api/sla-metrics/m1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the metric is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('SLA metric not found'));
      const res = await request(app).delete('/api/sla-metrics/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
