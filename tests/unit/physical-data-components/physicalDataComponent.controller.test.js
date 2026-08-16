jest.mock('../../../src/modules/physical-data-components/physicalDataComponent.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/physical-data-components/physicalDataComponent.service');
const physicalDataComponentRoutes = require('../../../src/modules/physical-data-components/physicalDataComponent.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/physical-data-components', physicalDataComponentRoutes);
app.use(errorHandler);

const mockComponent = { _id: 'pdc1', name: 'HR Postgres Database' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PhysicalDataComponent Controller', () => {
  describe('POST /api/physical-data-components', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/physical-data-components').send({ description: 'x' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 201 with the created component on success', async () => {
      service.create.mockResolvedValue(mockComponent);
      const res = await request(app).post('/api/physical-data-components').send({ name: 'HR Postgres Database' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('HR Postgres Database');
    });

    it('returns 409 when the name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/physical-data-components').send({ name: 'HR Postgres Database' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/physical-data-components', () => {
    it('returns 200 with an array of components', async () => {
      service.findAll.mockResolvedValue([mockComponent]);
      const res = await request(app).get('/api/physical-data-components');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/physical-data-components?search=HR');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'HR' }));
    });
  });

  describe('GET /api/physical-data-components/:id', () => {
    it('returns 200 with the component when found', async () => {
      service.findById.mockResolvedValue(mockComponent);
      const res = await request(app).get('/api/physical-data-components/pdc1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('pdc1');
    });

    it('returns 404 when the component is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Physical data component not found'));
      const res = await request(app).get('/api/physical-data-components/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/physical-data-components/:id', () => {
    it('returns 200 with the updated component', async () => {
      const updated = { ...mockComponent, description: 'Updated' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/physical-data-components/pdc1').send({ description: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Updated');
    });

    it('returns 404 when the component is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Physical data component not found'));
      const res = await request(app).put('/api/physical-data-components/nonexistent').send({ description: 'x' });
      expect(res.status).toBe(404);
    });

    it('returns 409 when the updated name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.update.mockRejectedValue(err);
      const res = await request(app).put('/api/physical-data-components/pdc1').send({ name: 'Other Component' });
      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/physical-data-components/:id', () => {
    it('returns 204 when the component is deleted', async () => {
      service.remove.mockResolvedValue(mockComponent);
      const res = await request(app).delete('/api/physical-data-components/pdc1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the component is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Physical data component not found'));
      const res = await request(app).delete('/api/physical-data-components/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
