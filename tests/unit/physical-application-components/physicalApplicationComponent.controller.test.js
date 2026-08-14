jest.mock('../../../src/modules/physical-application-components/physicalApplicationComponent.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/physical-application-components/physicalApplicationComponent.service');
const physicalApplicationComponentRoutes = require('../../../src/modules/physical-application-components/physicalApplicationComponent.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/physical-application-components', physicalApplicationComponentRoutes);
app.use(errorHandler);

const mockComponent = { _id: 'pac1', name: 'DeployTrack Release Manager — Production Instance', assetIdentifier: 'app-deploytrack-prod-01.example.com' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PhysicalApplicationComponent Controller', () => {
  describe('POST /api/physical-application-components', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/physical-application-components').send({ assetIdentifier: 'x' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 201 with the created component on success', async () => {
      service.create.mockResolvedValue(mockComponent);
      const res = await request(app).post('/api/physical-application-components').send({ name: 'DeployTrack Release Manager — Production Instance' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('DeployTrack Release Manager — Production Instance');
    });

    it('returns 409 for a duplicate name', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000, keyPattern: { name: 1 } });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/physical-application-components').send({ name: 'X' });
      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 409 for a duplicate assetIdentifier', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000, keyPattern: { assetIdentifier: 1 } });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/physical-application-components').send({ name: 'Other Instance', assetIdentifier: 'app-deploytrack-prod-01.example.com' });
      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/assetIdentifier/);
    });
  });

  describe('GET /api/physical-application-components', () => {
    it('returns 200 with an array of components', async () => {
      service.findAll.mockResolvedValue([mockComponent]);
      const res = await request(app).get('/api/physical-application-components');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/physical-application-components?hasEnvironment=Production');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ hasEnvironment: 'Production' }));
    });
  });

  describe('GET /api/physical-application-components/:id', () => {
    it('returns 200 with the component when found', async () => {
      service.findById.mockResolvedValue(mockComponent);
      const res = await request(app).get('/api/physical-application-components/pac1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('pac1');
    });

    it('returns 404 when the component is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Physical application component not found'));
      const res = await request(app).get('/api/physical-application-components/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/physical-application-components/:id', () => {
    it('returns 200 with the updated component', async () => {
      const updated = { ...mockComponent, hasEnvironment: 'Staging' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/physical-application-components/pac1').send({ hasEnvironment: 'Staging' });
      expect(res.status).toBe(200);
      expect(res.body.hasEnvironment).toBe('Staging');
    });

    it('returns 404 when the component is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Physical application component not found'));
      const res = await request(app).put('/api/physical-application-components/nonexistent').send({ hasEnvironment: 'Staging' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/physical-application-components/:id', () => {
    it('returns 204 when the component is deleted', async () => {
      service.remove.mockResolvedValue(mockComponent);
      const res = await request(app).delete('/api/physical-application-components/pac1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the component is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Physical application component not found'));
      const res = await request(app).delete('/api/physical-application-components/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
