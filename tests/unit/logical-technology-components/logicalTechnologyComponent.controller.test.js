jest.mock('../../../src/modules/logical-technology-components/logicalTechnologyComponent.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/logical-technology-components/logicalTechnologyComponent.service');
const logicalTechnologyComponentRoutes = require('../../../src/modules/logical-technology-components/logicalTechnologyComponent.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/logical-technology-components', logicalTechnologyComponentRoutes);
app.use(errorHandler);

const serviceId = '507f1f77bcf86cd799439011';
const mockComponent = { _id: 'ltc1', name: 'Kubernetes Cluster', providesTechnologyService: serviceId };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LogicalTechnologyComponent Controller', () => {
  describe('POST /api/logical-technology-components', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/logical-technology-components').send({ description: 'x' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 201 with the created component on success', async () => {
      service.create.mockResolvedValue(mockComponent);
      const res = await request(app).post('/api/logical-technology-components').send({ name: 'Kubernetes Cluster', providesTechnologyService: serviceId });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Kubernetes Cluster');
    });

    it('returns 409 when the name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/logical-technology-components').send({ name: 'Kubernetes Cluster' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/logical-technology-components', () => {
    it('returns 200 with an array of components', async () => {
      service.findAll.mockResolvedValue([mockComponent]);
      const res = await request(app).get('/api/logical-technology-components');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/logical-technology-components?search=Kubernetes');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'Kubernetes' }));
    });
  });

  describe('GET /api/logical-technology-components/:id', () => {
    it('returns 200 with the component when found', async () => {
      service.findById.mockResolvedValue(mockComponent);
      const res = await request(app).get('/api/logical-technology-components/ltc1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('ltc1');
    });

    it('returns 404 when the component is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Logical technology component not found'));
      const res = await request(app).get('/api/logical-technology-components/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/logical-technology-components/:id', () => {
    it('returns 200 with the updated component', async () => {
      const updated = { ...mockComponent, description: 'Updated' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/logical-technology-components/ltc1').send({ description: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Updated');
    });

    it('returns 404 when the component is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Logical technology component not found'));
      const res = await request(app).put('/api/logical-technology-components/nonexistent').send({ description: 'x' });
      expect(res.status).toBe(404);
    });

    it('returns 409 when the updated name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.update.mockRejectedValue(err);
      const res = await request(app).put('/api/logical-technology-components/ltc1').send({ name: 'Other Component' });
      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/logical-technology-components/:id', () => {
    it('returns 204 when the component is deleted', async () => {
      service.remove.mockResolvedValue(mockComponent);
      const res = await request(app).delete('/api/logical-technology-components/ltc1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the component is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Logical technology component not found'));
      const res = await request(app).delete('/api/logical-technology-components/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
