jest.mock('../../../src/modules/data-entities/dataEntity.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/data-entities/dataEntity.service');
const dataEntityRoutes = require('../../../src/modules/data-entities/dataEntity.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/data-entities', dataEntityRoutes);
app.use(errorHandler);

const mockDataEntity = { _id: 'de1', name: 'Employee Record', hasDataSensitivity: ['PII'] };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DataEntity Controller', () => {
  describe('POST /api/data-entities', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/data-entities').send({ hasDataSensitivity: ['PII'] });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 201 with the created data entity on success', async () => {
      service.create.mockResolvedValue(mockDataEntity);
      const res = await request(app).post('/api/data-entities').send({ name: 'Employee Record', hasDataSensitivity: ['PII'] });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Employee Record');
    });

    it('returns 409 when the name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/data-entities').send({ name: 'Employee Record' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/data-entities', () => {
    it('returns 200 with an array of data entities', async () => {
      service.findAll.mockResolvedValue([mockDataEntity]);
      const res = await request(app).get('/api/data-entities');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/data-entities?search=Employee');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'Employee' }));
    });
  });

  describe('GET /api/data-entities/:id', () => {
    it('returns 200 with the data entity when found', async () => {
      service.findById.mockResolvedValue(mockDataEntity);
      const res = await request(app).get('/api/data-entities/de1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('de1');
    });

    it('returns 404 when the data entity is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Data entity not found'));
      const res = await request(app).get('/api/data-entities/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/data-entities/:id', () => {
    it('returns 200 with the updated data entity', async () => {
      const updated = { ...mockDataEntity, retentionPeriod: 'P7Y' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/data-entities/de1').send({ retentionPeriod: 'P7Y' });
      expect(res.status).toBe(200);
      expect(res.body.retentionPeriod).toBe('P7Y');
    });

    it('returns 404 when the data entity is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Data entity not found'));
      const res = await request(app).put('/api/data-entities/nonexistent').send({ retentionPeriod: 'P7Y' });
      expect(res.status).toBe(404);
    });

    it('returns 409 when the updated name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.update.mockRejectedValue(err);
      const res = await request(app).put('/api/data-entities/de1').send({ name: 'Other Entity' });
      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/data-entities/:id', () => {
    it('returns 204 when the data entity is deleted', async () => {
      service.remove.mockResolvedValue(mockDataEntity);
      const res = await request(app).delete('/api/data-entities/de1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the data entity is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Data entity not found'));
      const res = await request(app).delete('/api/data-entities/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
