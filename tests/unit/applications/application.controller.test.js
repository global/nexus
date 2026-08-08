jest.mock('../../../src/modules/applications/application.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/applications/application.service');
const applicationRoutes = require('../../../src/modules/applications/application.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/applications', applicationRoutes);
app.use(errorHandler);

const validOwnerId = '507f1f77bcf86cd799439011';
const mockApp = { _id: 'app1', name: 'Payments API', owners: [validOwnerId], lifecycleStatus: 'Operate' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Application Controller', () => {
  describe('POST /api/applications', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/applications').send({ owners: [validOwnerId] });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 400 when owners is missing', async () => {
      const res = await request(app).post('/api/applications').send({ name: 'App' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/owners/);
    });

    it('returns 201 with the created application on success', async () => {
      service.create.mockResolvedValue(mockApp);
      const res = await request(app).post('/api/applications').send({ name: 'Payments API', owners: [validOwnerId] });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Payments API');
    });

    it('returns 409 when the application name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/applications').send({ name: 'Payments API', owners: [validOwnerId] });
      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already exists/);
    });
  });

  describe('GET /api/applications', () => {
    it('returns 200 with an array of applications', async () => {
      service.findAll.mockResolvedValue([mockApp]);
      const res = await request(app).get('/api/applications');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/applications?lifecycleStatus=Operate&criticalityTier=Critical');
      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ lifecycleStatus: 'Operate', criticalityTier: 'Critical' })
      );
    });
  });

  describe('GET /api/applications/stats', () => {
    it('returns 200 with the stats object', async () => {
      const stats = { byLifecycleStatus: [], byCriticalityTier: [], byInvestmentStrategy: [], total: 0 };
      service.getStats.mockResolvedValue(stats);
      const res = await request(app).get('/api/applications/stats');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(stats);
    });
  });

  describe('GET /api/applications/:id', () => {
    it('returns 200 with the application when found', async () => {
      service.findById.mockResolvedValue(mockApp);
      const res = await request(app).get('/api/applications/app1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('app1');
    });

    it('returns 404 when the application is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Application not found'));
      const res = await request(app).get('/api/applications/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not found/i);
    });
  });

  describe('PUT /api/applications/:id', () => {
    it('returns 400 for an invalid field value', async () => {
      const res = await request(app).put('/api/applications/app1').send({ criticalityTier: 'extreme' });
      expect(res.status).toBe(400);
    });

    it('returns 200 with the updated application', async () => {
      const updated = { ...mockApp, lifecycleStatus: 'Retired' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/applications/app1').send({ lifecycleStatus: 'Retired' });
      expect(res.status).toBe(200);
      expect(res.body.lifecycleStatus).toBe('Retired');
    });

    it('returns 404 when the application is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Application not found'));
      const res = await request(app).put('/api/applications/nonexistent').send({ lifecycleStatus: 'Retired' });
      expect(res.status).toBe(404);
    });

    it('returns 409 on a duplicate name conflict', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.update.mockRejectedValue(err);
      const res = await request(app).put('/api/applications/app1').send({ name: 'Existing App' });
      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/applications/:id', () => {
    it('returns 204 when the application is deleted', async () => {
      service.remove.mockResolvedValue(mockApp);
      const res = await request(app).delete('/api/applications/app1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the application is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Application not found'));
      const res = await request(app).delete('/api/applications/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
