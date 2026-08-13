jest.mock('../../../src/modules/documents/document.service');
jest.mock('../../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user', username: 'tester', roles: ['admin'] };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const service = require('../../../src/modules/documents/document.service');
const documentRoutes = require('../../../src/modules/documents/document.routes');
const { errorHandler } = require('../../../src/middleware/error');
const { NotFoundError } = require('../../../src/common/errors');

const app = express();
app.use(express.json());
app.use('/api/documents', documentRoutes);
app.use(errorHandler);

const mockDocument = { _id: 'd1', name: 'SecureAuth IAM Threat Model', url: 'https://wiki.example.com/iam/threat-model' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Document Controller', () => {
  describe('POST /api/documents', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/documents').send({ url: 'https://wiki.example.com/x' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/name/);
    });

    it('returns 400 when url is missing', async () => {
      const res = await request(app).post('/api/documents').send({ name: 'Threat Model' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/url/);
    });

    it('returns 201 with the created document on success', async () => {
      service.create.mockResolvedValue(mockDocument);
      const res = await request(app).post('/api/documents').send({ name: 'SecureAuth IAM Threat Model', url: 'https://wiki.example.com/iam/threat-model' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('SecureAuth IAM Threat Model');
    });
  });

  describe('GET /api/documents', () => {
    it('returns 200 with an array of documents', async () => {
      service.findAll.mockResolvedValue([mockDocument]);
      const res = await request(app).get('/api/documents');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('forwards query parameters to the service as filters', async () => {
      service.findAll.mockResolvedValue([]);
      await request(app).get('/api/documents?search=IAM');
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'IAM' }));
    });
  });

  describe('GET /api/documents/:id', () => {
    it('returns 200 with the document when found', async () => {
      service.findById.mockResolvedValue(mockDocument);
      const res = await request(app).get('/api/documents/d1');
      expect(res.status).toBe(200);
      expect(res.body._id).toBe('d1');
    });

    it('returns 404 when the document is not found', async () => {
      service.findById.mockRejectedValue(new NotFoundError('Document not found'));
      const res = await request(app).get('/api/documents/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/documents/:id', () => {
    it('returns 200 with the updated document', async () => {
      const updated = { ...mockDocument, lastUpdated: '2026-03-01' };
      service.update.mockResolvedValue(updated);
      const res = await request(app).put('/api/documents/d1').send({ lastUpdated: '2026-03-01' });
      expect(res.status).toBe(200);
      expect(res.body.lastUpdated).toBe('2026-03-01');
    });

    it('returns 404 when the document is not found', async () => {
      service.update.mockRejectedValue(new NotFoundError('Document not found'));
      const res = await request(app).put('/api/documents/nonexistent').send({ lastUpdated: '2026-03-01' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('returns 204 when the document is deleted', async () => {
      service.remove.mockResolvedValue(mockDocument);
      const res = await request(app).delete('/api/documents/d1');
      expect(res.status).toBe(204);
    });

    it('returns 404 when the document is not found', async () => {
      service.remove.mockRejectedValue(new NotFoundError('Document not found'));
      const res = await request(app).delete('/api/documents/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
