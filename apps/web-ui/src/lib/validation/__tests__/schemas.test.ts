/**
 * Validation Schemas Tests
 * Story 9.6: Input Validation Layer
 */

import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import {
  emailSchema,
  uuidSchema,
  urlSchema,
  titleSchema,
  nameSchema,
  slugSchema,
  apiKeySchema,
  portSchema,
  positiveNumberSchema,
  nonEmptyArraySchema,
  createStrictSchema,
  createHtmlSchema,
  sanitizeHtml,
} from '../schemas';

describe('Validation Schemas', () => {
  describe('Email Schema', () => {
    it('should accept valid email addresses', () => {
      expect(emailSchema.safeParse('user@example.com').success).toBe(true);
      expect(emailSchema.safeParse('test.user+tag@domain.co.uk').success).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      const result = emailSchema.safeParse('not-an-email');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email address');
      }
    });

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(310) + '@example.com';
      const result = emailSchema.safeParse(longEmail);
      expect(result.success).toBe(false);
    });

    it('should trim and lowercase emails', () => {
      const result = emailSchema.safeParse('  User@Example.COM  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('user@example.com');
      }
    });
  });

  describe('UUID Schema', () => {
    it('should accept valid UUIDs', () => {
      expect(uuidSchema.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(uuidSchema.safeParse('not-a-uuid').success).toBe(false);
      expect(uuidSchema.safeParse('550e8400-e29b-41d4').success).toBe(false); // Too short
    });
  });

  describe('URL Schema', () => {
    it('should accept valid URLs', () => {
      expect(urlSchema.safeParse('https://example.com').success).toBe(true);
      expect(urlSchema.safeParse('http://localhost:42001').success).toBe(true);
      expect(urlSchema.safeParse('https://api.example.com/v1/users').success).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(urlSchema.safeParse('not-a-url').success).toBe(false);
    });

    it('should reject URLs with unsafe protocols', () => {
      const result = urlSchema.safeParse('javascript:alert(1)');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('protocol');
      }
    });
  });

  describe('Title Schema', () => {
    it('should accept valid titles', () => {
      expect(titleSchema.safeParse('My Project').success).toBe(true);
      expect(titleSchema.safeParse('A'.repeat(200)).success).toBe(true);
    });

    it('should reject empty titles', () => {
      const result = titleSchema.safeParse('   ');
      expect(result.success).toBe(false);
    });

    it('should reject titles that are too long', () => {
      const result = titleSchema.safeParse('A'.repeat(201));
      expect(result.success).toBe(false);
    });

    it('should trim whitespace', () => {
      const result = titleSchema.safeParse('  My Title  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('My Title');
      }
    });
  });

  describe('Name Schema', () => {
    it('should accept valid names', () => {
      expect(nameSchema.safeParse('John Doe').success).toBe(true);
    });

    it('should reject names that are too short', () => {
      const result = nameSchema.safeParse('A');
      expect(result.success).toBe(false);
    });

    it('should reject names that are too long', () => {
      const result = nameSchema.safeParse('A'.repeat(101));
      expect(result.success).toBe(false);
    });
  });

  describe('Slug Schema', () => {
    it('should accept valid slugs', () => {
      expect(slugSchema.safeParse('my-slug-123').success).toBe(true);
      expect(slugSchema.safeParse('test').success).toBe(true);
    });

    it('should reject slugs with invalid characters', () => {
      expect(slugSchema.safeParse('My_Slug').success).toBe(false);
      expect(slugSchema.safeParse('slug with spaces').success).toBe(false);
    });
  });

  describe('API Key Schema', () => {
    it('should accept valid API key formats', () => {
      expect(apiKeySchema.safeParse('abc123-def456_ghi789ABCDEFGHIJKLMNOP').success).toBe(true);
      expect(apiKeySchema.safeParse('A'.repeat(32)).success).toBe(true);
    });

    it('should reject short API keys', () => {
      const result = apiKeySchema.safeParse('short');
      expect(result.success).toBe(false);
    });
  });

  describe('Port Schema', () => {
    it('should accept valid port numbers', () => {
      expect(portSchema.safeParse(80).success).toBe(true);
      expect(portSchema.safeParse(443).success).toBe(true);
      expect(portSchema.safeParse(8080).success).toBe(true);
      expect(portSchema.safeParse(65535).success).toBe(true);
    });

    it('should reject invalid port numbers', () => {
      expect(portSchema.safeParse(0).success).toBe(false);
      expect(portSchema.safeParse(-1).success).toBe(false);
      expect(portSchema.safeParse(65536).success).toBe(false);
      expect(portSchema.safeParse(80.5).success).toBe(false);
    });
  });

  describe('Positive Number Schema', () => {
    it('should accept positive numbers', () => {
      expect(positiveNumberSchema.safeParse(1).success).toBe(true);
      expect(positiveNumberSchema.safeParse(100.5).success).toBe(true);
    });

    it('should reject non-positive numbers', () => {
      expect(positiveNumberSchema.safeParse(0).success).toBe(false);
      expect(positiveNumberSchema.safeParse(-1).success).toBe(false);
    });
  });

  describe('Non-Empty Array Schema', () => {
    it('should accept non-empty arrays', () => {
      const schema = nonEmptyArraySchema(z.string());
      expect(schema.safeParse(['a', 'b']).success).toBe(true);
    });

    it('should reject empty arrays', () => {
      const schema = nonEmptyArraySchema(z.string());
      const result = schema.safeParse([]);
      expect(result.success).toBe(false);
    });
  });

  describe('Strict Schema', () => {
    it('should accept known properties', () => {
      const schema = createStrictSchema({
        name: z.string(),
        age: z.number(),
      });
      expect(schema.safeParse({ name: 'John', age: 30 }).success).toBe(true);
    });

    it('should reject unknown properties', () => {
      const schema = createStrictSchema({
        name: z.string(),
        age: z.number(),
      });
      const result = schema.safeParse({ name: 'John', age: 30, unknown: 'field' });
      expect(result.success).toBe(false);
    });
  });
});

describe('HTML Sanitization', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const input = '<p>Hello</p><script>alert("XSS")</script>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      expect(result).toContain('<p>Hello</p>');
    });

    it('should remove event handlers', () => {
      const input = '<p onclick="alert(1)">Click me</p>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('onclick');
      expect(result).toContain('<p>');
    });

    it('should remove javascript: protocol', () => {
      const input = '<a href="javascript:alert(1)">Link</a>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('javascript:');
    });

    it('should remove iframe tags', () => {
      const input = '<p>Content</p><iframe src="evil.com"></iframe>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<iframe');
      expect(result).toContain('<p>Content</p>');
    });

    it('should remove form tags', () => {
      const input = '<form action="/evil"><input type="text"></form>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<form');
    });

    it('should preserve safe HTML', () => {
      const input = '<p><strong>Bold</strong> and <em>italic</em></p>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
      expect(result).toContain('<em>');
    });
  });

  describe('createHtmlSchema', () => {
    it('should create a schema that sanitizes HTML', () => {
      const schema = createHtmlSchema(1000);
      const input = '<p>Safe</p><script>alert(1)</script>';
      const result = schema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toContain('<script>');
      }
    });

    it('should enforce max length', () => {
      const schema = createHtmlSchema(10);
      const input = '<p>Too long content</p>';
      const result = schema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
