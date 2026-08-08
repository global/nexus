jest.mock('../../../src/modules/business-capabilities/businessCapability.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/business-capabilities/businessCapability.service');
const businessCapabilityRoutes = require('../../../src/modules/business-capabilities/businessCapability.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/business-capabilities', businessCapabilityRoutes);
app.use(errorHandler);

const mockCapability = { _id: 'bc1', name: 'Information Technology', capabilityWeight: 5, capabilityLevel: 1 };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BusinessCapability Controller', () => {
  describe('POST /api/business-capabilities', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/business-capabilities').send({ capabilityWeight: 5 });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 400 for an out-of-range capabilityWeight', async () => {
      const res = await request(app).post('/api/business-capabilities').send({ name: 'IT', capabilityWeight: 10 });
      expect(res.status).toBe(400);
    });

    it('returns 201 with the created capability on success', async () => {
      service.create.mockResolvedValue(mockCapability);
      const res = await request(app).post('/api/business-capabilities').send({ name: 'Information Technology', capabilityWeight: 5 });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Information Technology');
    });

    it('returns 409 when the name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/business-capabilities').send({ name: 'Information Technology' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/business-capabilities', () => {
    it('returns 200 with an array of capabilities', async () => {
      service.findAll.mockResolvedValue([mockCapability]);
      const res = await request(app).get('/api/business-capabilities');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/business-capabilities?capabilityLevel=1');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ capabilityLevel: '1' }));
    });
  });

  describe('GET /api/business-capabilities/:id', () => {
    it('returns 200 with the capability when found', async () => {
      service.findById.mockResolvedValue(mockCapability);
      const res = await request(app).get('/api/business-capabilities/bc1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('bc1');
    });

    it('returns 404 when the capability is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Business capability not found'));
      const res = await request(app).get('/api/business-capabilities/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/business-capabilities/:id', () => {
    it('returns 200 with the updated capability', async () => {
      const updated = { ...mockCapability, capabilityWeight: 3 };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/business-capabilities/bc1').send({ capabilityWeight: 3 });
      expect(res.status).toBe(200);
      expect(res.body.capabilityWeight).toBe(3);
    });

    it('returns 404 when the capability is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Business capability not found'));
      const res = await request(app).put('/api/business-capabilities/nonexistent').send({ capabilityWeight: 3 });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/business-capabilities/:id', () => {
    it('returns 204 when the capability is deleted', async () => {
      service.remove.mockResolvedValue(mockCapability);
      const res = await request(app).delete('/api/business-capabilities/bc1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the capability is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Business capability not found'));
      const res = await request(app).delete('/api/business-capabilities/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
