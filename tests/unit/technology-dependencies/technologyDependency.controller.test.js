jest.mock('../../../src/modules/technology-dependencies/technologyDependency.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/technology-dependencies/technologyDependency.service');
const technologyDependencyRoutes = require('../../../src/modules/technology-dependencies/technologyDependency.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/technology-dependencies', technologyDependencyRoutes);
app.use(errorHandler);

const upstream = '507f1f77bcf86cd799439011';
const downstream = '507f1f77bcf86cd799439012';
const mockDependency = { _id: 'd1', upstreamTechnologyComponent: upstream, downstreamTechnologyComponent: downstream, usesProtocol: 'DatabaseConnection', hasSynchronicity: 'Synchronous' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TechnologyDependency Controller', () => {
  describe('POST /api/technology-dependencies', () => {
    it('returns 400 when upstreamTechnologyComponent is missing', async () => {
      const res = await request(app).post('/api/technology-dependencies').send({ downstreamTechnologyComponent: downstream, usesProtocol: 'DatabaseConnection', hasSynchronicity: 'Synchronous' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/upstreamTechnologyComponent/);
    });

    it('returns 400 when downstreamTechnologyComponent equals upstreamTechnologyComponent', async () => {
      const res = await request(app).post('/api/technology-dependencies').send({ upstreamTechnologyComponent: upstream, downstreamTechnologyComponent: upstream, usesProtocol: 'DatabaseConnection', hasSynchronicity: 'Synchronous' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/different/);
    });

    it('returns 201 with the created dependency on success', async () => {
      service.create.mockResolvedValue(mockDependency);
      const res = await request(app).post('/api/technology-dependencies').send({ upstreamTechnologyComponent: upstream, downstreamTechnologyComponent: downstream, usesProtocol: 'DatabaseConnection', hasSynchronicity: 'Synchronous' });
      expect(res.status).toBe(201);
      expect(res.body.upstreamTechnologyComponent).toBe(upstream);
    });
  });

  describe('GET /api/technology-dependencies', () => {
    it('returns 200 with an array of dependencies', async () => {
      service.findAll.mockResolvedValue([mockDependency]);
      const res = await request(app).get('/api/technology-dependencies');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/technology-dependencies?upstreamTechnologyComponent=' + upstream);
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ upstreamTechnologyComponent: upstream }));
    });
  });

  describe('GET /api/technology-dependencies/:id', () => {
    it('returns 200 with the dependency when found', async () => {
      service.findById.mockResolvedValue(mockDependency);
      const res = await request(app).get('/api/technology-dependencies/d1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('d1');
    });

    it('returns 404 when the dependency is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Technology dependency not found'));
      const res = await request(app).get('/api/technology-dependencies/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/technology-dependencies/:id', () => {
    it('returns 200 with the updated dependency', async () => {
      const updated = { ...mockDependency, usesProtocol: 'RESTAPI' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/technology-dependencies/d1').send({ usesProtocol: 'RESTAPI' });
      expect(res.status).toBe(200);
      expect(res.body.usesProtocol).toBe('RESTAPI');
    });

    it('returns 404 when the dependency is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Technology dependency not found'));
      const res = await request(app).put('/api/technology-dependencies/nonexistent').send({ usesProtocol: 'RESTAPI' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/technology-dependencies/:id', () => {
    it('returns 204 when the dependency is deleted', async () => {
      service.remove.mockResolvedValue(mockDependency);
      const res = await request(app).delete('/api/technology-dependencies/d1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the dependency is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Technology dependency not found'));
      const res = await request(app).delete('/api/technology-dependencies/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
