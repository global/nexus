jest.mock('../../../src/modules/business-processes/businessProcess.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/business-processes/businessProcess.service');
const businessProcessRoutes = require('../../../src/modules/business-processes/businessProcess.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/business-processes', businessProcessRoutes);
app.use(errorHandler);

const functionId = '507f1f77bcf86cd799439011';
const mockBusinessProcess = { _id: 'bp1', name: 'Order-to-Cash', realizesFunction: [functionId] };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BusinessProcess Controller', () => {
  describe('POST /api/business-processes', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/business-processes').send({ description: 'x' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 201 with the created business process on success', async () => {
      service.create.mockResolvedValue(mockBusinessProcess);
      const res = await request(app).post('/api/business-processes').send({ name: 'Order-to-Cash', realizesFunction: [functionId] });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Order-to-Cash');
    });

    it('returns 409 when the name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/business-processes').send({ name: 'Order-to-Cash' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/business-processes', () => {
    it('returns 200 with an array of business processes', async () => {
      service.findAll.mockResolvedValue([mockBusinessProcess]);
      const res = await request(app).get('/api/business-processes');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/business-processes?search=Order');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'Order' }));
    });
  });

  describe('GET /api/business-processes/:id', () => {
    it('returns 200 with the business process when found', async () => {
      service.findById.mockResolvedValue(mockBusinessProcess);
      const res = await request(app).get('/api/business-processes/bp1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('bp1');
    });

    it('returns 404 when the business process is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Business process not found'));
      const res = await request(app).get('/api/business-processes/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/business-processes/:id', () => {
    it('returns 200 with the updated business process', async () => {
      const updated = { ...mockBusinessProcess, description: 'Updated' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/business-processes/bp1').send({ description: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Updated');
    });

    it('returns 404 when the business process is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Business process not found'));
      const res = await request(app).put('/api/business-processes/nonexistent').send({ description: 'x' });
      expect(res.status).toBe(404);
    });

    it('returns 409 when the updated name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.update.mockRejectedValue(err);
      const res = await request(app).put('/api/business-processes/bp1').send({ name: 'Procure-to-Pay' });
      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/business-processes/:id', () => {
    it('returns 204 when the business process is deleted', async () => {
      service.remove.mockResolvedValue(mockBusinessProcess);
      const res = await request(app).delete('/api/business-processes/bp1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the business process is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Business process not found'));
      const res = await request(app).delete('/api/business-processes/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
