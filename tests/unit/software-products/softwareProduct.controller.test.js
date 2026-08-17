jest.mock('../../../src/modules/software-products/softwareProduct.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/software-products/softwareProduct.service');
const softwareProductRoutes = require('../../../src/modules/software-products/softwareProduct.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/software-products', softwareProductRoutes);
app.use(errorHandler);

const mockProduct = { _id: 'sp1', name: 'BuildForge Enterprise', version: '5.4' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SoftwareProduct Controller', () => {
  describe('POST /api/software-products', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/software-products').send({ version: '5.4' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 201 with the created product on success', async () => {
      service.create.mockResolvedValue(mockProduct);
      const res = await request(app).post('/api/software-products').send({ name: 'BuildForge Enterprise', version: '5.4' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('BuildForge Enterprise');
    });

    it('returns 409 when the name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/software-products').send({ name: 'BuildForge Enterprise' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/software-products', () => {
    it('returns 200 with an array of products', async () => {
      service.findAll.mockResolvedValue([mockProduct]);
      const res = await request(app).get('/api/software-products');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/software-products?search=BuildForge');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'BuildForge' }));
    });
  });

  describe('GET /api/software-products/:id', () => {
    it('returns 200 with the product when found', async () => {
      service.findById.mockResolvedValue(mockProduct);
      const res = await request(app).get('/api/software-products/sp1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('sp1');
    });

    it('returns 404 when the product is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Software product not found'));
      const res = await request(app).get('/api/software-products/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/software-products/:id', () => {
    it('returns 200 with the updated product', async () => {
      const updated = { ...mockProduct, version: '5.5' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/software-products/sp1').send({ version: '5.5' });
      expect(res.status).toBe(200);
      expect(res.body.version).toBe('5.5');
    });

    it('returns 404 when the product is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Software product not found'));
      const res = await request(app).put('/api/software-products/nonexistent').send({ version: '5.5' });
      expect(res.status).toBe(404);
    });

    it('returns 409 when the updated name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.update.mockRejectedValue(err);
      const res = await request(app).put('/api/software-products/sp1').send({ name: 'Other Product' });
      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/software-products/:id', () => {
    it('returns 204 when the product is deleted', async () => {
      service.remove.mockResolvedValue(mockProduct);
      const res = await request(app).delete('/api/software-products/sp1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the product is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Software product not found'));
      const res = await request(app).delete('/api/software-products/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
