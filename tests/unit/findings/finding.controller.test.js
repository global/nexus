jest.mock('../../../src/modules/findings/finding.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/findings/finding.service');
const findingRoutes = require('../../../src/modules/findings/finding.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError, ValidationError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/findings', findingRoutes);
app.use(errorHandler);

const mockFinding = { _id: 'f1', findingDetails: 'x', findingCategory: 'TechnicalRisk', findingStatus: 'Open' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Finding Controller', () => {
  describe('POST /api/findings', () => {
    it('returns 400 when findingDetails is missing', async () => {
      const res = await request(app).post('/api/findings').send({ findingCategory: 'TechnicalRisk' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/findingDetails/);
    });

    it('returns 400 when findingCategory is missing', async () => {
      const res = await request(app).post('/api/findings').send({ findingDetails: 'x' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/findingCategory/);
    });

    it('returns 400 for cvssScore on a non-Vulnerability finding', async () => {
      const res = await request(app).post('/api/findings').send({ findingDetails: 'x', findingCategory: 'TechnicalRisk', cvssScore: 5 });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Vulnerability/);
    });

    it('returns 201 with the created finding on success', async () => {
      service.create.mockResolvedValue(mockFinding);
      const res = await request(app).post('/api/findings').send({ findingDetails: 'x', findingCategory: 'TechnicalRisk' });
      expect(res.status).toBe(201);
      expect(res.body.findingDetails).toBe('x');
    });
  });

  describe('GET /api/findings', () => {
    it('returns 200 with an array of findings', async () => {
      service.findAll.mockResolvedValue([mockFinding]);
      const res = await request(app).get('/api/findings');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/findings?findingStatus=Open');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ findingStatus: 'Open' }));
    });
  });

  describe('GET /api/findings/:id', () => {
    it('returns 200 with the finding when found', async () => {
      service.findById.mockResolvedValue(mockFinding);
      const res = await request(app).get('/api/findings/f1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('f1');
    });

    it('returns 404 when the finding is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Finding not found'));
      const res = await request(app).get('/api/findings/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/findings/:id', () => {
    it('returns 200 with the updated finding', async () => {
      const updated = { ...mockFinding, findingStatus: 'Remediated' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/findings/f1').send({ findingStatus: 'Remediated' });
      expect(res.status).toBe(200);
      expect(res.body.findingStatus).toBe('Remediated');
    });

    it('returns 404 when the finding is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Finding not found'));
      const res = await request(app).put('/api/findings/nonexistent').send({ findingStatus: 'Remediated' });
      expect(res.status).toBe(404);
    });

    it('returns 400 when the service rejects a cross-field cvssScore conflict', async () => {
      service.update.mockRejectedValue(new ValidationError('cvssScore may only be populated on a Finding categorized as Vulnerability.'));
      const res = await request(app).put('/api/findings/f1').send({ cvssScore: 5 });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/findings/:id', () => {
    it('returns 204 when the finding is deleted', async () => {
      service.remove.mockResolvedValue(mockFinding);
      const res = await request(app).delete('/api/findings/f1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the finding is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Finding not found'));
      const res = await request(app).delete('/api/findings/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
