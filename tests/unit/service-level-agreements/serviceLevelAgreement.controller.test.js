jest.mock('../../../src/modules/service-level-agreements/serviceLevelAgreement.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/service-level-agreements/serviceLevelAgreement.service');
const serviceLevelAgreementRoutes = require('../../../src/modules/service-level-agreements/serviceLevelAgreement.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/service-level-agreements', serviceLevelAgreementRoutes);
app.use(errorHandler);

const appId = '507f1f77bcf86cd799439011';
const metricId = '507f1f77bcf86cd799439012';
const mockSla = { _id: 's1', appliesToApplication: appId, effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31', hasSLAMetric: [metricId] };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ServiceLevelAgreement Controller', () => {
  describe('POST /api/service-level-agreements', () => {
    it('returns 400 when appliesToApplication is missing', async () => {
      const res = await request(app).post('/api/service-level-agreements').send({ effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31', hasSLAMetric: [metricId] });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/appliesToApplication/);
    });

    it('returns 201 with the created SLA on success', async () => {
      service.create.mockResolvedValue(mockSla);
      const res = await request(app).post('/api/service-level-agreements').send({ appliesToApplication: appId, effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31', hasSLAMetric: [metricId] });
      expect(res.status).toBe(201);
      expect(res.body.appliesToApplication).toBe(appId);
    });
  });

  describe('GET /api/service-level-agreements', () => {
    it('returns 200 with an array of SLAs', async () => {
      service.findAll.mockResolvedValue([mockSla]);
      const res = await request(app).get('/api/service-level-agreements');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get(`/api/service-level-agreements?appliesToApplication=${appId}`);
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ appliesToApplication: appId }));
    });
  });

  describe('GET /api/service-level-agreements/:id', () => {
    it('returns 200 with the SLA when found', async () => {
      service.findById.mockResolvedValue(mockSla);
      const res = await request(app).get('/api/service-level-agreements/s1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('s1');
    });

    it('returns 404 when the SLA is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Service level agreement not found'));
      const res = await request(app).get('/api/service-level-agreements/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/service-level-agreements/:id', () => {
    it('returns 200 with the updated SLA', async () => {
      const updated = { ...mockSla, effectiveTo: '2027-12-31' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/service-level-agreements/s1').send({ effectiveTo: '2027-12-31' });
      expect(res.status).toBe(200);
      expect(res.body.effectiveTo).toBe('2027-12-31');
    });

    it('returns 404 when the SLA is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Service level agreement not found'));
      const res = await request(app).put('/api/service-level-agreements/nonexistent').send({ effectiveTo: '2027-12-31' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/service-level-agreements/:id', () => {
    it('returns 204 when the SLA is deleted', async () => {
      service.remove.mockResolvedValue(mockSla);
      const res = await request(app).delete('/api/service-level-agreements/s1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the SLA is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Service level agreement not found'));
      const res = await request(app).delete('/api/service-level-agreements/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
