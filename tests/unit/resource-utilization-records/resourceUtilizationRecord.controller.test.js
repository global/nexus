jest.mock('../../../src/modules/resource-utilization-records/resourceUtilizationRecord.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/resource-utilization-records/resourceUtilizationRecord.service');
const resourceUtilizationRecordRoutes = require('../../../src/modules/resource-utilization-records/resourceUtilizationRecord.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/resource-utilization-records', resourceUtilizationRecordRoutes);
app.use(errorHandler);

const productId = '507f1f77bcf86cd799439011';
const metricId = '507f1f77bcf86cd799439012';
const mockRecord = { _id: 'r1', measuresProduct: productId, measuredAgainstMetric: metricId, measuredValue: 340, measurementPeriodStart: '2026-01-01', measurementPeriodEnd: '2026-06-30' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ResourceUtilizationRecord Controller', () => {
  describe('POST /api/resource-utilization-records', () => {
    it('returns 400 when measuresProduct is missing', async () => {
      const res = await request(app).post('/api/resource-utilization-records').send({ measuredAgainstMetric: metricId, measuredValue: 340, measurementPeriodStart: '2026-01-01', measurementPeriodEnd: '2026-06-30' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/measuresProduct/);
    });

    it('returns 201 with the created record on success', async () => {
      service.create.mockResolvedValue(mockRecord);
      const res = await request(app).post('/api/resource-utilization-records').send({ measuresProduct: productId, measuredAgainstMetric: metricId, measuredValue: 340, measurementPeriodStart: '2026-01-01', measurementPeriodEnd: '2026-06-30' });
      expect(res.status).toBe(201);
      expect(res.body.measuredValue).toBe(340);
    });
  });

  describe('GET /api/resource-utilization-records', () => {
    it('returns 200 with an array of records', async () => {
      service.findAll.mockResolvedValue([mockRecord]);
      const res = await request(app).get('/api/resource-utilization-records');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get(`/api/resource-utilization-records?measuresProduct=${productId}`);
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ measuresProduct: productId }));
    });
  });

  describe('GET /api/resource-utilization-records/:id', () => {
    it('returns 200 with the record when found', async () => {
      service.findById.mockResolvedValue(mockRecord);
      const res = await request(app).get('/api/resource-utilization-records/r1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('r1');
    });

    it('returns 404 when the record is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Resource utilization record not found'));
      const res = await request(app).get('/api/resource-utilization-records/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/resource-utilization-records/:id', () => {
    it('returns 200 with the updated record', async () => {
      const updated = { ...mockRecord, measuredValue: 350 };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/resource-utilization-records/r1').send({ measuredValue: 350 });
      expect(res.status).toBe(200);
      expect(res.body.measuredValue).toBe(350);
    });

    it('returns 404 when the record is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Resource utilization record not found'));
      const res = await request(app).put('/api/resource-utilization-records/nonexistent').send({ measuredValue: 350 });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/resource-utilization-records/:id', () => {
    it('returns 204 when the record is deleted', async () => {
      service.remove.mockResolvedValue(mockRecord);
      const res = await request(app).delete('/api/resource-utilization-records/r1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the record is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Resource utilization record not found'));
      const res = await request(app).delete('/api/resource-utilization-records/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
