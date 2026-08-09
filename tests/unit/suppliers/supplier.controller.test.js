jest.mock('../../../src/modules/suppliers/supplier.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/suppliers/supplier.service');
const supplierRoutes = require('../../../src/modules/suppliers/supplier.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/suppliers', supplierRoutes);
app.use(errorHandler);

const mockSupplier = { _id: 'sup1', name: 'WorkforceCloud Inc.', certifications: ['SOC2', 'ISO27001'] };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Supplier Controller', () => {
  describe('POST /api/suppliers', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/suppliers').send({ certifications: ['SOC2'] });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 400 for an invalid certification value', async () => {
      const res = await request(app).post('/api/suppliers').send({ name: 'X', certifications: ['NOT_REAL'] });
      expect(res.status).toBe(400);
    });

    it('returns 201 with the created supplier on success', async () => {
      service.create.mockResolvedValue(mockSupplier);
      const res = await request(app).post('/api/suppliers').send({ name: 'WorkforceCloud Inc.' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('WorkforceCloud Inc.');
    });

    it('returns 409 when the name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/suppliers').send({ name: 'WorkforceCloud Inc.' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/suppliers', () => {
    it('returns 200 with an array of suppliers', async () => {
      service.findAll.mockResolvedValue([mockSupplier]);
      const res = await request(app).get('/api/suppliers');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/suppliers?search=workforce');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'workforce' }));
    });
  });

  describe('GET /api/suppliers/:id', () => {
    it('returns 200 with the supplier when found', async () => {
      service.findById.mockResolvedValue(mockSupplier);
      const res = await request(app).get('/api/suppliers/sup1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('sup1');
    });

    it('returns 404 when the supplier is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Supplier not found'));
      const res = await request(app).get('/api/suppliers/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/suppliers/:id', () => {
    it('returns 200 with the updated supplier', async () => {
      const updated = { ...mockSupplier, certifications: ['SOC2'] };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/suppliers/sup1').send({ certifications: ['SOC2'] });
      expect(res.status).toBe(200);
      expect(res.body.certifications).toEqual(['SOC2']);
    });

    it('returns 404 when the supplier is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Supplier not found'));
      const res = await request(app).put('/api/suppliers/nonexistent').send({ certifications: ['SOC2'] });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/suppliers/:id', () => {
    it('returns 204 when the supplier is deleted', async () => {
      service.remove.mockResolvedValue(mockSupplier);
      const res = await request(app).delete('/api/suppliers/sup1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the supplier is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Supplier not found'));
      const res = await request(app).delete('/api/suppliers/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
