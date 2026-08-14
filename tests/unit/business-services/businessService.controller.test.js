jest.mock('../../../src/modules/business-services/businessService.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/business-services/businessService.service');
const businessServiceRoutes = require('../../../src/modules/business-services/businessService.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/business-services', businessServiceRoutes);
app.use(errorHandler);

const capabilityId = '507f1f77bcf86cd799439011';
const mockBusinessService = { _id: 'bs1', name: 'Customer Onboarding API', supportsCapability: capabilityId };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BusinessService Controller', () => {
  describe('POST /api/business-services', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/business-services').send({ description: 'x' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 201 with the created business service on success', async () => {
      service.create.mockResolvedValue(mockBusinessService);
      const res = await request(app).post('/api/business-services').send({ name: 'Customer Onboarding API', supportsCapability: capabilityId });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Customer Onboarding API');
    });

    it('returns 409 when the name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/business-services').send({ name: 'Customer Onboarding API' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/business-services', () => {
    it('returns 200 with an array of business services', async () => {
      service.findAll.mockResolvedValue([mockBusinessService]);
      const res = await request(app).get('/api/business-services');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/business-services?search=Onboarding');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'Onboarding' }));
    });
  });

  describe('GET /api/business-services/:id', () => {
    it('returns 200 with the business service when found', async () => {
      service.findById.mockResolvedValue(mockBusinessService);
      const res = await request(app).get('/api/business-services/bs1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('bs1');
    });

    it('returns 404 when the business service is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Business service not found'));
      const res = await request(app).get('/api/business-services/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/business-services/:id', () => {
    it('returns 200 with the updated business service', async () => {
      const updated = { ...mockBusinessService, description: 'Updated' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/business-services/bs1').send({ description: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Updated');
    });

    it('returns 404 when the business service is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Business service not found'));
      const res = await request(app).put('/api/business-services/nonexistent').send({ description: 'x' });
      expect(res.status).toBe(404);
    });

    it('returns 409 when the updated name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.update.mockRejectedValue(err);
      const res = await request(app).put('/api/business-services/bs1').send({ name: 'Other Service' });
      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/business-services/:id', () => {
    it('returns 204 when the business service is deleted', async () => {
      service.remove.mockResolvedValue(mockBusinessService);
      const res = await request(app).delete('/api/business-services/bs1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the business service is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Business service not found'));
      const res = await request(app).delete('/api/business-services/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
