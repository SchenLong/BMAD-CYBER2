/**
 * Validation Middleware Tests
 * Story 9.6: Input Validation Layer
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { validateBody, validateQuery, validateParams } from '../middleware';
import { z } from 'zod';

// Mock NextRequest
class MockNextRequest {
  public url: string;
  public headers: Headers;
  private _body?: string;

  constructor({ url = 'http://localhost:42001/api/test', headers = {}, body }: {
    url?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {}) {
    this.url = url;
    this.headers = new Headers(headers);
    this._body = body;
  }

  async text() {
    return this._body || '';
  }

  async json() {
    const text = await this.text();
    return text ? JSON.parse(text) : {};
  }
}

describe('Validation Middleware', () => {
  describe('validateBody', () => {
    it('should validate valid request body', async () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number(),
      });
      const req = new MockNextRequest({
        body: JSON.stringify({ name: 'John', age: 30 }),
      });

      const result = await validateBody(req, schema);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'John', age: 30 });
      }
    });

    it('should reject invalid request body', async () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number(),
      });
      const req = new MockNextRequest({
        body: JSON.stringify({ name: '', age: 'not-a-number' }),
      });

      const result = await validateBody(req, schema);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response).toBeDefined();
        expect(result.response.statusCode).toBe(400);
        expect(result.response.body.error).toBe('Validation failed');
      }
    });

    it('should handle empty body as empty object', async () => {
      const schema = z.object({}).strict();
      const req = new MockNextRequest({ body: '' });

      const result = await validateBody(req, schema);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });

    it('should handle invalid JSON', async () => {
      const schema = z.object({});
      const req = new MockNextRequest({ body: 'invalid json' });

      const result = await validateBody(req, schema);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.body.error).toBe('Invalid JSON');
      }
    });

    it('should reject unknown properties with strict schema', async () => {
      const schema = z.object({
        name: z.string(),
      }).strict();

      const req = new MockNextRequest({
        body: JSON.stringify({ name: 'John', unknown: 'field' }),
      });

      const result = await validateBody(req, schema);

      expect(result.success).toBe(false);
    });
  });

  describe('validateQuery', () => {
    it('should validate valid query parameters', () => {
      const schema = z.object({
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(20),
      });

      const req = new MockNextRequest({
        url: 'http://localhost:42001/api/test?page=2&limit=10',
      });

      const result = validateQuery(req, schema);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ page: 2, limit: 10 });
      }
    });

    it('should apply default values', () => {
      const schema = z.object({
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(20),
      });

      const req = new MockNextRequest({
        url: 'http://localhost:42001/api/test',
      });

      const result = validateQuery(req, schema);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ page: 1, limit: 20 });
      }
    });

    it('should reject invalid query parameters', () => {
      const schema = z.object({
        page: z.coerce.number(),
      });

      const req = new MockNextRequest({
        url: 'http://localhost:42001/api/test?page=abc',
      });

      const result = validateQuery(req, schema);

      expect(result.success).toBe(false);
    });
  });

  describe('validateParams', () => {
    it('should validate valid params', () => {
      const schema = z.object({
        id: z.string().uuid(),
      });

      const params = { id: '550e8400-e29b-41d4-a716-446655440000' };
      const result = validateParams(params, schema);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(params);
      }
    });

    it('should reject invalid params', () => {
      const schema = z.object({
        id: z.string().uuid(),
      });

      const params = { id: 'not-a-uuid' };
      const result = validateParams(params, schema);

      expect(result.success).toBe(false);
    });

    it('should handle string array params from Next.js', () => {
      const schema = z.object({
        ids: z.array(z.string()),
      });

      const params = { ids: ['id1', 'id2'] };
      const result = validateParams(params, schema);

      expect(result.success).toBe(true);
    });
  });

  describe('Error Formatting', () => {
    it('should format validation errors with path information', async () => {
      const schema = z.object({
        user: z.object({
          name: z.string().min(3),
          email: z.string().email(),
        }),
      });

      const req = new MockNextRequest({
        body: JSON.stringify({
          user: { name: 'AB', email: 'not-an-email' },
        }),
      });

      const result = await validateBody(req, schema);

      expect(result.success).toBe(false);
      if (!result.success) {
        const details = result.response.body.details;
        expect(details).toHaveLength(2);
        expect(details[0].path).toEqual(['user', 'name']);
        expect(details[1].path).toEqual(['user', 'email']);
      }
    });

    it('should include helpful error messages', async () => {
      const schema = z.object({
        email: z.string().email(),
      });

      const req = new MockNextRequest({
        body: JSON.stringify({ email: 'invalid' }),
      });

      const result = await validateBody(req, schema);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.body.details[0].message).toContain('email');
      }
    });
  });
});
