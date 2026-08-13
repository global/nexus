jest.mock('../../../src/modules/application-dependencies/applicationDependency.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/application-dependencies/applicationDependency.service');
const applicationDependencyRoutes = require('../../../src/modules/application-dependencies/applicationDependency.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/application-dependencies', applicationDependencyRoutes);
app.use(errorHandler);

const upstream = '507f1f77bcf86cd799439011';
const downstream = '507f1f77bcf86cd799439012';
const mockDependency = { _id: 'd1', upstreamApplication: upstream, downstreamApplication: downstream, usesProtocol: 'RESTAPI', hasSynchronicity: 'Synchronous' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ApplicationDependency Controller', () => {
  describe('POST /api/application-dependencies', () => {
    it('returns 400 when upstreamApplication is missing', async () => {
      const res = await request(app).post('/api/application-dependencies').send({ downstreamApplication: downstream, usesProtocol: 'RESTAPI', hasSynchronicity: 'Synchronous' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/upstreamApplication/);
    });

    it('returns 400 when downstreamApplication equals upstreamApplication', async () => {
      const res = await request(app).post('/api/application-dependencies').send({ upstreamApplication: upstream, downstreamApplication: upstream, usesProtocol: 'RESTAPI', hasSynchronicity: 'Synchronous' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/different/);
    });

    it('returns 201 with the created dependency on success', async () => {
      service.create.mockResolvedValue(mockDependency);
      const res = await request(app).post('/api/application-dependencies').send({ upstreamApplication: upstream, downstreamApplication: downstream, usesProtocol: 'RESTAPI', hasSynchronicity: 'Synchronous' });
      expect(res.status).toBe(201);
      expect(res.body.upstreamApplication).toBe(upstream);
    });
  });

  describe('GET /api/application-dependencies', () => {
    it('returns 200 with an array of dependencies', async () => {
      service.findAll.mockResolvedValue([mockDependency]);
      const res = await request(app).get('/api/application-dependencies');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/application-dependencies?upstreamApplication=' + upstream);
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ upstreamApplication: upstream }));
    });
  });

  describe('GET /api/application-dependencies/:id', () => {
    it('returns 200 with the dependency when found', async () => {
      service.findById.mockResolvedValue(mockDependency);
      const res = await request(app).get('/api/application-dependencies/d1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('d1');
    });

    it('returns 404 when the dependency is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Application dependency not found'));
      const res = await request(app).get('/api/application-dependencies/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/application-dependencies/:id', () => {
    it('returns 200 with the updated dependency', async () => {
      const updated = { ...mockDependency, usesProtocol: 'SOAP' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/application-dependencies/d1').send({ usesProtocol: 'SOAP' });
      expect(res.status).toBe(200);
      expect(res.body.usesProtocol).toBe('SOAP');
    });

    it('returns 404 when the dependency is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Application dependency not found'));
      const res = await request(app).put('/api/application-dependencies/nonexistent').send({ usesProtocol: 'SOAP' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/application-dependencies/:id', () => {
    it('returns 204 when the dependency is deleted', async () => {
      service.remove.mockResolvedValue(mockDependency);
      const res = await request(app).delete('/api/application-dependencies/d1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the dependency is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Application dependency not found'));
      const res = await request(app).delete('/api/application-dependencies/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
