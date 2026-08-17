jest.mock('../../../src/modules/portfolios/portfolio.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/portfolios/portfolio.service');
const portfolioRoutes = require('../../../src/modules/portfolios/portfolio.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/portfolios', portfolioRoutes);
app.use(errorHandler);

const appId = '507f1f77bcf86cd799439011';
const actorId = '507f1f77bcf86cd799439012';
const capabilityId = '507f1f77bcf86cd799439013';
const mockPortfolio = { _id: 'p1', name: 'Core Business Systems Portfolio', containsApplication: [appId], portfolioOwner: actorId, alignsToCapability: capabilityId };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Portfolio Controller', () => {
  describe('POST /api/portfolios', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/portfolios').send({ containsApplication: [appId], portfolioOwner: actorId, alignsToCapability: capabilityId });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 201 with the created portfolio on success', async () => {
      service.create.mockResolvedValue(mockPortfolio);
      const res = await request(app).post('/api/portfolios').send({ name: 'Core Business Systems Portfolio', containsApplication: [appId], portfolioOwner: actorId, alignsToCapability: capabilityId });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Core Business Systems Portfolio');
    });

    it('returns 409 when the name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/portfolios').send({ name: 'Core Business Systems Portfolio', containsApplication: [appId], portfolioOwner: actorId, alignsToCapability: capabilityId });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/portfolios', () => {
    it('returns 200 with an array of portfolios', async () => {
      service.findAll.mockResolvedValue([mockPortfolio]);
      const res = await request(app).get('/api/portfolios');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/portfolios?search=Core');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'Core' }));
    });
  });

  describe('GET /api/portfolios/:id', () => {
    it('returns 200 with the portfolio when found', async () => {
      service.findById.mockResolvedValue(mockPortfolio);
      const res = await request(app).get('/api/portfolios/p1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('p1');
    });

    it('returns 404 when the portfolio is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Portfolio not found'));
      const res = await request(app).get('/api/portfolios/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/portfolios/:id', () => {
    it('returns 200 with the updated portfolio', async () => {
      const updated = { ...mockPortfolio, description: 'Updated' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/portfolios/p1').send({ description: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Updated');
    });

    it('returns 404 when the portfolio is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Portfolio not found'));
      const res = await request(app).put('/api/portfolios/nonexistent').send({ description: 'x' });
      expect(res.status).toBe(404);
    });

    it('returns 409 when the updated name already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.update.mockRejectedValue(err);
      const res = await request(app).put('/api/portfolios/p1').send({ name: 'Other Portfolio' });
      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/portfolios/:id', () => {
    it('returns 204 when the portfolio is deleted', async () => {
      service.remove.mockResolvedValue(mockPortfolio);
      const res = await request(app).delete('/api/portfolios/p1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the portfolio is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Portfolio not found'));
      const res = await request(app).delete('/api/portfolios/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
