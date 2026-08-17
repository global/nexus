jest.mock('../../../src/modules/software-entitlements/softwareEntitlement.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/software-entitlements/softwareEntitlement.service');
const softwareEntitlementRoutes = require('../../../src/modules/software-entitlements/softwareEntitlement.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/software-entitlements', softwareEntitlementRoutes);
app.use(errorHandler);

const metricId = '507f1f77bcf86cd799439011';
const mockEntitlement = { _id: 'e1', entitledQuantity: 500, measuredByMetric: metricId };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SoftwareEntitlement Controller', () => {
  describe('POST /api/software-entitlements', () => {
    it('returns 400 when entitledQuantity is missing', async () => {
      const res = await request(app).post('/api/software-entitlements').send({ measuredByMetric: metricId });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/entitledQuantity/);
    });

    it('returns 201 with the created entitlement on success', async () => {
      service.create.mockResolvedValue(mockEntitlement);
      const res = await request(app).post('/api/software-entitlements').send({ entitledQuantity: 500, measuredByMetric: metricId });
      expect(res.status).toBe(201);
      expect(res.body.entitledQuantity).toBe(500);
    });
  });

  describe('GET /api/software-entitlements', () => {
    it('returns 200 with an array of entitlements', async () => {
      service.findAll.mockResolvedValue([mockEntitlement]);
      const res = await request(app).get('/api/software-entitlements');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get(`/api/software-entitlements?measuredByMetric=${metricId}`);
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ measuredByMetric: metricId }));
    });
  });

  describe('GET /api/software-entitlements/:id', () => {
    it('returns 200 with the entitlement when found', async () => {
      service.findById.mockResolvedValue(mockEntitlement);
      const res = await request(app).get('/api/software-entitlements/e1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('e1');
    });

    it('returns 404 when the entitlement is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Software entitlement not found'));
      const res = await request(app).get('/api/software-entitlements/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/software-entitlements/:id', () => {
    it('returns 200 with the updated entitlement', async () => {
      const updated = { ...mockEntitlement, entitledQuantity: 600 };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/software-entitlements/e1').send({ entitledQuantity: 600 });
      expect(res.status).toBe(200);
      expect(res.body.entitledQuantity).toBe(600);
    });

    it('returns 404 when the entitlement is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Software entitlement not found'));
      const res = await request(app).put('/api/software-entitlements/nonexistent').send({ entitledQuantity: 600 });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/software-entitlements/:id', () => {
    it('returns 204 when the entitlement is deleted', async () => {
      service.remove.mockResolvedValue(mockEntitlement);
      const res = await request(app).delete('/api/software-entitlements/e1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the entitlement is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Software entitlement not found'));
      const res = await request(app).delete('/api/software-entitlements/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
