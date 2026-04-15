/**
 * Integration Tests
 * 
 * End-to-end API testing.
 */

import request from 'supertest';
import app from '../../src/index';

describe('API Integration Tests', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('Root Endpoint', () => {
    it('should return API info', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('Trace Endpoints', () => {
    it('should require authentication', async () => {
      await request(app)
        .post('/api/v1/trace/origin')
        .send({ walletAddress: 'test123' })
        .expect(401);
    });
  });

  describe('Stats Endpoint', () => {
    it('should return rate limit stats', async () => {
      const response = await request(app)
        .get('/api/v1/stats')
        .expect(200);

      expect(response.body).toHaveProperty('rateLimitStats');
      expect(response.body).toHaveProperty('status');
    });
  });
});
