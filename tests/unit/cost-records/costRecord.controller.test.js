jest.mock('../../../src/modules/cost-records/costRecord.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/cost-records/costRecord.service');
const costRecordRoutes = require('../../../src/modules/cost-records/costRecord.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/cost-records', costRecordRoutes);
app.use(errorHandler);

const appId = '507f1f77bcf86cd799439011';
const mockRecord = { _id: 'c1', incurredByApplication: appId, hasCostCategory: 'Licensing', costAmount: 1000, costCurrency: 'USD', fiscalYear: '2026' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CostRecord Controller', () => {
  describe('POST /api/cost-records', () => {
    it('returns 400 when incurredByApplication is missing', async () => {
      const res = await request(app).post('/api/cost-records').send({ hasCostCategory: 'Licensing', costAmount: 1000, costCurrency: 'USD', fiscalYear: '2026' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/incurredByApplication/);
    });

    it('returns 400 for an invalid currency code', async () => {
      const res = await request(app).post('/api/cost-records').send({ incurredByApplication: appId, hasCostCategory: 'Licensing', costAmount: 1000, costCurrency: 'US', fiscalYear: '2026' });
      expect(res.status).toBe(400);
    });

    it('returns 201 with the created cost record on success', async () => {
      service.create.mockResolvedValue(mockRecord);
      const res = await request(app).post('/api/cost-records').send({ incurredByApplication: appId, hasCostCategory: 'Licensing', costAmount: 1000, costCurrency: 'USD', fiscalYear: '2026' });
      expect(res.status).toBe(201);
      expect(res.body.costAmount).toBe(1000);
    });
  });

  describe('GET /api/cost-records', () => {
    it('returns 200 with an array of cost records', async () => {
      service.findAll.mockResolvedValue([mockRecord]);
      const res = await request(app).get('/api/cost-records');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/cost-records?fiscalYear=2026');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ fiscalYear: '2026' }));
    });
  });

  describe('GET /api/cost-records/:id', () => {
    it('returns 200 with the cost record when found', async () => {
      service.findById.mockResolvedValue(mockRecord);
      const res = await request(app).get('/api/cost-records/c1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('c1');
    });

    it('returns 404 when the cost record is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Cost record not found'));
      const res = await request(app).get('/api/cost-records/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/cost-records/:id', () => {
    it('returns 200 with the updated cost record', async () => {
      const updated = { ...mockRecord, costAmount: 2000 };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/cost-records/c1').send({ costAmount: 2000 });
      expect(res.status).toBe(200);
      expect(res.body.costAmount).toBe(2000);
    });

    it('returns 404 when the cost record is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Cost record not found'));
      const res = await request(app).put('/api/cost-records/nonexistent').send({ costAmount: 2000 });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/cost-records/:id', () => {
    it('returns 204 when the cost record is deleted', async () => {
      service.remove.mockResolvedValue(mockRecord);
      const res = await request(app).delete('/api/cost-records/c1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the cost record is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Cost record not found'));
      const res = await request(app).delete('/api/cost-records/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
