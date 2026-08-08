jest.mock('../../../src/modules/organization-units/organizationUnit.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/organization-units/organizationUnit.service');
const organizationUnitRoutes = require('../../../src/modules/organization-units/organizationUnit.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/organization-units', organizationUnitRoutes);
app.use(errorHandler);

const mockOrgUnit = { _id: 'ou1', name: 'Engineering', costCenterCode: 'CC-400' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('OrganizationUnit Controller', () => {
  describe('POST /api/organization-units', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/organization-units').send({ costCenterCode: 'CC-400' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 201 with the created organization unit on success', async () => {
      service.create.mockResolvedValue(mockOrgUnit);
      const res = await request(app).post('/api/organization-units').send({ name: 'Engineering' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Engineering');
    });

    it('returns 409 when the cost center code already exists', async () => {
      const err = Object.assign(new Error('duplicate'), { code: 11000 });
      service.create.mockRejectedValue(err);
      const res = await request(app).post('/api/organization-units').send({ name: 'Engineering', costCenterCode: 'CC-400' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/organization-units', () => {
    it('returns 200 with an array of organization units', async () => {
      service.findAll.mockResolvedValue([mockOrgUnit]);
      const res = await request(app).get('/api/organization-units');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/organization-units?search=engineering');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'engineering' }));
    });
  });

  describe('GET /api/organization-units/:id', () => {
    it('returns 200 with the organization unit when found', async () => {
      service.findById.mockResolvedValue(mockOrgUnit);
      const res = await request(app).get('/api/organization-units/ou1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('ou1');
    });

    it('returns 404 when the organization unit is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Organization unit not found'));
      const res = await request(app).get('/api/organization-units/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/organization-units/:id', () => {
    it('returns 200 with the updated organization unit', async () => {
      const updated = { ...mockOrgUnit, costCenterCode: 'CC-999' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/organization-units/ou1').send({ costCenterCode: 'CC-999' });
      expect(res.status).toBe(200);
      expect(res.body.costCenterCode).toBe('CC-999');
    });

    it('returns 404 when the organization unit is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Organization unit not found'));
      const res = await request(app).put('/api/organization-units/nonexistent').send({ costCenterCode: 'CC-999' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/organization-units/:id', () => {
    it('returns 204 when the organization unit is deleted', async () => {
      service.remove.mockResolvedValue(mockOrgUnit);
      const res = await request(app).delete('/api/organization-units/ou1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the organization unit is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Organization unit not found'));
      const res = await request(app).delete('/api/organization-units/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
