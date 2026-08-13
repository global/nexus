jest.mock('../../../src/modules/business-functions/businessFunction.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/business-functions/businessFunction.service');
const businessFunctionRoutes = require('../../../src/modules/business-functions/businessFunction.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/business-functions', businessFunctionRoutes);
app.use(errorHandler);

const mockBusinessFunction = { _id: 'bf1', name: 'Order Fulfillment' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BusinessFunction Controller', () => {
  describe('POST /api/business-functions', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/business-functions').send({ description: 'x' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 201 with the created business function on success', async () => {
      service.create.mockResolvedValue(mockBusinessFunction);
      const res = await request(app).post('/api/business-functions').send({ name: 'Order Fulfillment' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Order Fulfillment');
    });

    it('returns 409 when the name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/business-functions').send({ name: 'Order Fulfillment' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/business-functions', () => {
    it('returns 200 with an array of business functions', async () => {
      service.findAll.mockResolvedValue([mockBusinessFunction]);
      const res = await request(app).get('/api/business-functions');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/business-functions?search=Order');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'Order' }));
    });
  });

  describe('GET /api/business-functions/:id', () => {
    it('returns 200 with the business function when found', async () => {
      service.findById.mockResolvedValue(mockBusinessFunction);
      const res = await request(app).get('/api/business-functions/bf1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('bf1');
    });

    it('returns 404 when the business function is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Business function not found'));
      const res = await request(app).get('/api/business-functions/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/business-functions/:id', () => {
    it('returns 200 with the updated business function', async () => {
      const updated = { ...mockBusinessFunction, description: 'Updated' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/business-functions/bf1').send({ description: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Updated');
    });

    it('returns 404 when the business function is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Business function not found'));
      const res = await request(app).put('/api/business-functions/nonexistent').send({ description: 'x' });
      expect(res.status).toBe(404);
    });

    it('returns 409 when the updated name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.update.mockRejectedValue(err);
      const res = await request(app).put('/api/business-functions/bf1').send({ name: 'Other Function' });
      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/business-functions/:id', () => {
    it('returns 204 when the business function is deleted', async () => {
      service.remove.mockResolvedValue(mockBusinessFunction);
      const res = await request(app).delete('/api/business-functions/bf1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the business function is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Business function not found'));
      const res = await request(app).delete('/api/business-functions/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
