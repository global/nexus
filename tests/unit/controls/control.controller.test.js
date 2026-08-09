jest.mock('../../../src/modules/controls/control.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/controls/control.service');
const controlRoutes = require('../../../src/modules/controls/control.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/controls', controlRoutes);
app.use(errorHandler);

const mockControl = { _id: 'ctrl1', name: 'Multi-Factor Authentication', controlReference: 'ISO/IEC 27002:2022 5.17' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Control Controller', () => {
  describe('POST /api/controls', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/controls').send({ controlReference: 'X' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 400 for an invalid supportsComplianceStandard value', async () => {
      const res = await request(app).post('/api/controls').send({ name: 'X', supportsComplianceStandard: ['NOT_REAL'] });
      expect(res.status).toBe(400);
    });

    it('returns 201 with the created control on success', async () => {
      service.create.mockResolvedValue(mockControl);
      const res = await request(app).post('/api/controls').send({ name: 'Multi-Factor Authentication' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Multi-Factor Authentication');
    });

    it('returns 409 when the name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/controls').send({ name: 'Multi-Factor Authentication' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/controls', () => {
    it('returns 200 with an array of controls', async () => {
      service.findAll.mockResolvedValue([mockControl]);
      const res = await request(app).get('/api/controls');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/controls?search=access');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'access' }));
    });
  });

  describe('GET /api/controls/:id', () => {
    it('returns 200 with the control when found', async () => {
      service.findById.mockResolvedValue(mockControl);
      const res = await request(app).get('/api/controls/ctrl1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('ctrl1');
    });

    it('returns 404 when the control is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Control not found'));
      const res = await request(app).get('/api/controls/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/controls/:id', () => {
    it('returns 200 with the updated control', async () => {
      const updated = { ...mockControl, controlReference: 'ISO/IEC 27002:2022 5.18' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/controls/ctrl1').send({ controlReference: 'ISO/IEC 27002:2022 5.18' });
      expect(res.status).toBe(200);
      expect(res.body.controlReference).toBe('ISO/IEC 27002:2022 5.18');
    });

    it('returns 404 when the control is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Control not found'));
      const res = await request(app).put('/api/controls/nonexistent').send({ controlReference: 'X' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/controls/:id', () => {
    it('returns 204 when the control is deleted', async () => {
      service.remove.mockResolvedValue(mockControl);
      const res = await request(app).delete('/api/controls/ctrl1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the control is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Control not found'));
      const res = await request(app).delete('/api/controls/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
