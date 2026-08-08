jest.mock('../../../src/modules/applications/application.service');
jest.mock('../../../src/middleware/auth', () => {
  const { authorize } = jest.requireActual('../../../src/middleware/authorize');
  return {
    authenticate: (req, res, next) => {
      const header = req.headers['x-test-roles'];
      req.user = { id: 'test-user', username: 'tester', roles: header ? header.split(',') : [] };
      next();
    },
    authorize,
  };
});

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/applications/application.service');
const applicationRoutes = require('../../../src/modules/applications/application.routes');
const { errorHandler } = require('../../../src/middleware/error');

const app = express();
app.use(express.json());
app.use('/api/applications', applicationRoutes);
app.use(errorHandler);

const validOwnerId = '507f1f77bcf86cd799439011';

beforeEach(() => {
  jest.clearAllMocks();
  service.findAll.mockResolvedValue([]);
  service.create.mockResolvedValue({ _id: '1', name: 'App', owners: [validOwnerId] });
  service.remove.mockResolvedValue({ _id: '1' });
});

describe('Application routes RBAC (real authorize, faked authenticate)', () => {
  describe('reads (GET /) — admin, portfolio-manager, and viewer are all allowed', () => {
    it.each(['admin', 'portfolio-manager', 'viewer'])('%s -> 200', async (role) => {
      const res = await request(app).get('/api/applications').set('x-test-roles', role);
      expect(res.status).toBe(200);
    });

    it('a caller with no recognized role -> 403', async () => {
      const res = await request(app).get('/api/applications').set('x-test-roles', 'nobody');
      expect(res.status).toBe(403);
    });

    it('an unauthenticated caller (no roles at all) -> 403', async () => {
      const res = await request(app).get('/api/applications');
      expect(res.status).toBe(403);
    });
  });

  describe('writes (POST /) — admin and portfolio-manager allowed, viewer is not', () => {
    it.each(['admin', 'portfolio-manager'])('%s -> 201', async (role) => {
      const res = await request(app)
        .post('/api/applications')
        .set('x-test-roles', role)
        .send({ name: 'App', owners: [validOwnerId] });
      expect(res.status).toBe(201);
    });

    it('viewer -> 403', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('x-test-roles', 'viewer')
        .send({ name: 'App', owners: [validOwnerId] });
      expect(res.status).toBe(403);
    });
  });

  describe('delete (DELETE /:id) — admin only', () => {
    it('admin -> 204', async () => {
      const res = await request(app).delete('/api/applications/1').set('x-test-roles', 'admin');
      expect(res.status).toBe(204);
    });

    it.each(['portfolio-manager', 'viewer'])('%s -> 403', async (role) => {
      const res = await request(app).delete('/api/applications/1').set('x-test-roles', role);
      expect(res.status).toBe(403);
    });
  });
});
