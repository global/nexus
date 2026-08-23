jest.mock('../../../src/modules/dependency-intelligence/dependencyIntelligence.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/dependency-intelligence/dependencyIntelligence.service');
const dependencyIntelligenceRoutes = require('../../../src/modules/dependency-intelligence/dependencyIntelligence.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/dependency-intelligence', dependencyIntelligenceRoutes);
app.use(errorHandler);

const mockBlastRadius = {
  startId: 'A',
  maxDepth: null,
  reachable: [{ id: 'B', hop: 1, edge: {} }],
  hasCycle: false,
  cycle: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DependencyIntelligence Controller', () => {
  describe('GET /api/dependency-intelligence/applications/:id/blast-radius', () => {
    it('returns 200 with the blast radius', async () => {
      service.getApplicationBlastRadius.mockResolvedValue(mockBlastRadius);
      const res = await request(app).get('/api/dependency-intelligence/applications/A/blast-radius');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockBlastRadius);
      expect(service.getApplicationBlastRadius).toHaveBeenCalledWith('A', { maxDepth: undefined });
    });

    it('forwards a valid maxDepth query parameter as a number', async () => {
      service.getApplicationBlastRadius.mockResolvedValue(mockBlastRadius);
      await request(app).get('/api/dependency-intelligence/applications/A/blast-radius?maxDepth=2');
      expect(service.getApplicationBlastRadius).toHaveBeenCalledWith('A', { maxDepth: 2 });
    });

    it('ignores a non-positive maxDepth query parameter', async () => {
      service.getApplicationBlastRadius.mockResolvedValue(mockBlastRadius);
      await request(app).get('/api/dependency-intelligence/applications/A/blast-radius?maxDepth=-1');
      expect(service.getApplicationBlastRadius).toHaveBeenCalledWith('A', { maxDepth: undefined });
    });

    it('returns 404 when the start application is not found', async () => {
      service.getApplicationBlastRadius.mockRejectedValue(new NotFoundError('Application not found'));
      const res = await request(app).get('/api/dependency-intelligence/applications/nonexistent/blast-radius');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/dependency-intelligence/technology-components/:id/blast-radius', () => {
    it('returns 200 with the blast radius', async () => {
      service.getTechnologyBlastRadius.mockResolvedValue({ ...mockBlastRadius, startId: 'T1' });
      const res = await request(app).get('/api/dependency-intelligence/technology-components/T1/blast-radius');
      expect(res.status).toBe(200);
      expect(res.body.startId).toBe('T1');
    });

    it('returns 404 when the start component is not found', async () => {
      service.getTechnologyBlastRadius.mockRejectedValue(new NotFoundError('Physical technology component not found'));
      const res = await request(app).get('/api/dependency-intelligence/technology-components/nonexistent/blast-radius');
      expect(res.status).toBe(404);
    });
  });
});
