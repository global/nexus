jest.mock('../../../src/modules/locations/location.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/locations/location.service');
const locationRoutes = require('../../../src/modules/locations/location.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/locations', locationRoutes);
app.use(errorHandler);

const mockLocation = { _id: 'l1', name: 'NexusAPM HQ, Dublin, Ireland' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Location Controller', () => {
  describe('POST /api/locations', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/locations').send({ address: '123 Main St' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 201 with the created location on success', async () => {
      service.create.mockResolvedValue(mockLocation);
      const res = await request(app).post('/api/locations').send({ name: 'NexusAPM HQ, Dublin, Ireland' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('NexusAPM HQ, Dublin, Ireland');
    });

    it('returns 409 when the name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/locations').send({ name: 'NexusAPM HQ, Dublin, Ireland' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/locations', () => {
    it('returns 200 with an array of locations', async () => {
      service.findAll.mockResolvedValue([mockLocation]);
      const res = await request(app).get('/api/locations');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/locations?search=Dublin');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'Dublin' }));
    });
  });

  describe('GET /api/locations/:id', () => {
    it('returns 200 with the location when found', async () => {
      service.findById.mockResolvedValue(mockLocation);
      const res = await request(app).get('/api/locations/l1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('l1');
    });

    it('returns 404 when the location is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Location not found'));
      const res = await request(app).get('/api/locations/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/locations/:id', () => {
    it('returns 200 with the updated location', async () => {
      const updated = { ...mockLocation, address: '1 Grand Canal Quay' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/locations/l1').send({ address: '1 Grand Canal Quay' });
      expect(res.status).toBe(200);
      expect(res.body.address).toBe('1 Grand Canal Quay');
    });

    it('returns 404 when the location is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Location not found'));
      const res = await request(app).put('/api/locations/nonexistent').send({ address: 'x' });
      expect(res.status).toBe(404);
    });

    it('returns 409 when the updated name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.update.mockRejectedValue(err);
      const res = await request(app).put('/api/locations/l1').send({ name: 'Engineering Hub, Toronto, ON' });
      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/locations/:id', () => {
    it('returns 204 when the location is deleted', async () => {
      service.remove.mockResolvedValue(mockLocation);
      const res = await request(app).delete('/api/locations/l1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the location is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Location not found'));
      const res = await request(app).delete('/api/locations/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
