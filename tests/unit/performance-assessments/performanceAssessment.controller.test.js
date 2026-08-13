jest.mock('../../../src/modules/performance-assessments/performanceAssessment.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/performance-assessments/performanceAssessment.service');
const performanceAssessmentRoutes = require('../../../src/modules/performance-assessments/performanceAssessment.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/performance-assessments', performanceAssessmentRoutes);
app.use(errorHandler);

const appId = '507f1f77bcf86cd799439011';
const mockAssessment = { _id: 'p1', assessesApplication: appId, businessFitScore: 4, technicalFitScore: 2, assessedOn: '2026-03-01T00:00:00.000Z' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PerformanceAssessment Controller', () => {
  describe('POST /api/performance-assessments', () => {
    it('returns 400 when assessesApplication is missing', async () => {
      const res = await request(app).post('/api/performance-assessments').send({ assessedOn: '2026-03-01' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/assessesApplication/);
    });

    it('returns 400 when assessedOn is missing', async () => {
      const res = await request(app).post('/api/performance-assessments').send({ assessesApplication: appId });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/assessedOn/);
    });

    it('returns 400 for a businessFitScore outside 1-5', async () => {
      const res = await request(app).post('/api/performance-assessments').send({ assessesApplication: appId, assessedOn: '2026-03-01', businessFitScore: 9 });
      expect(res.status).toBe(400);
    });

    it('returns 201 with the created assessment on success', async () => {
      service.create.mockResolvedValue(mockAssessment);
      const res = await request(app).post('/api/performance-assessments').send({ assessesApplication: appId, assessedOn: '2026-03-01' });
      expect(res.status).toBe(201);
      expect(res.body.businessFitScore).toBe(4);
    });
  });

  describe('GET /api/performance-assessments', () => {
    it('returns 200 with an array of assessments', async () => {
      service.findAll.mockResolvedValue([mockAssessment]);
      const res = await request(app).get('/api/performance-assessments');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/performance-assessments?assessesApplication=' + appId);
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ assessesApplication: appId }));
    });
  });

  describe('GET /api/performance-assessments/:id', () => {
    it('returns 200 with the assessment when found', async () => {
      service.findById.mockResolvedValue(mockAssessment);
      const res = await request(app).get('/api/performance-assessments/p1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('p1');
    });

    it('returns 404 when the assessment is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Performance assessment not found'));
      const res = await request(app).get('/api/performance-assessments/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/performance-assessments/:id', () => {
    it('returns 200 with the updated assessment', async () => {
      const updated = { ...mockAssessment, businessFitScore: 5 };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/performance-assessments/p1').send({ businessFitScore: 5 });
      expect(res.status).toBe(200);
      expect(res.body.businessFitScore).toBe(5);
    });

    it('returns 404 when the assessment is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Performance assessment not found'));
      const res = await request(app).put('/api/performance-assessments/nonexistent').send({ businessFitScore: 5 });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/performance-assessments/:id', () => {
    it('returns 204 when the assessment is deleted', async () => {
      service.remove.mockResolvedValue(mockAssessment);
      const res = await request(app).delete('/api/performance-assessments/p1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the assessment is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Performance assessment not found'));
      const res = await request(app).delete('/api/performance-assessments/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
