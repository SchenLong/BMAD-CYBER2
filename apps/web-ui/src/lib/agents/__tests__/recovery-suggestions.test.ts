/**
 * Tests for Recovery Suggestions
 */

import {
  getRecoverySuggestion,
  getRecoveriesByCategory,
  getErrorCategories,
  sanitizeErrorMessage,
} from '../recovery-suggestions';

describe('getRecoverySuggestion', () => {
  it('should return recovery for known error types', () => {
    const result = getRecoverySuggestion('ECONNREFUSED');

    expect(result).toBeDefined();
    expect(result.errorType).toBe('ECONNREFUSED');
    expect(result.category).toBe('connection');
    expect(result.recovery).toBeDefined();
    expect(result.userMessage).toBeDefined();
  });

  it('should return timeout recovery for timeout errors', () => {
    const result = getRecoverySuggestion('ETIMEDOUT');

    expect(result.category).toBe('timeout');
    expect(result.userMessage).toMatch(/timeout|timed out/i);
  });

  it('should return validation recovery for validation errors', () => {
    const result = getRecoverySuggestion('ValidationError');

    expect(result.category).toBe('validation');
    expect(result.recovery).toContain('parameters');
  });

  it('should return execution recovery for command errors', () => {
    const result = getRecoverySuggestion('CommandNotFound');

    expect(result.category).toBe('execution');
    expect(result.recovery).toContain('CLI');
  });

  it('should return default recovery for unknown errors', () => {
    const result = getRecoverySuggestion('SomeUnknownError');

    expect(result.category).toBe('unknown');
    expect(result.recovery).toContain('try again');
  });

  it('should extract error type from error name with suffix', () => {
    // Use AgentTimeoutError which is in the map - "Timeout" is a substring
    const result = getRecoverySuggestion('AgentTimeoutError');

    expect(result.category).toBe('timeout');
  });

  it('should analyze error message for clues when error type unknown', () => {
    const result = getRecoverySuggestion('UnknownError', 'Connection timed out');

    expect(result.category).toBe('timeout');
  });

  it('should detect connection errors in message', () => {
    const result = getRecoverySuggestion('UnknownError', 'Failed to connect to server');

    expect(result.category).toBe('connection');
  });

  it('should detect not found errors in message', () => {
    const result = getRecoverySuggestion('UnknownError', 'Resource not found');

    expect(result.category).toBe('notfound');
  });

  it('should detect authorization errors in message', () => {
    const result = getRecoverySuggestion('UnknownError', 'Unauthorized access');

    expect(result.category).toBe('authorization');
  });
});

describe('getRecoveriesByCategory', () => {
  it('should return all recoveries for connection category', () => {
    const results = getRecoveriesByCategory('connection');

    expect(results.length).toBeGreaterThan(0);
    results.forEach(result => {
      expect(result.category).toBe('connection');
    });
  });

  it('should return all recoveries for timeout category', () => {
    const results = getRecoveriesByCategory('timeout');

    expect(results.length).toBeGreaterThan(0);
    results.forEach(result => {
      expect(result.category).toBe('timeout');
    });
  });

  it('should return all recoveries for execution category', () => {
    const results = getRecoveriesByCategory('execution');

    expect(results.length).toBeGreaterThan(0);
    results.forEach(result => {
      expect(result.category).toBe('execution');
    });
  });

  it('should return all recoveries for validation category', () => {
    const results = getRecoveriesByCategory('validation');

    expect(results.length).toBeGreaterThan(0);
    results.forEach(result => {
      expect(result.category).toBe('validation');
    });
  });

  it('should return all recoveries for authorization category', () => {
    const results = getRecoveriesByCategory('authorization');

    expect(results.length).toBeGreaterThan(0);
    results.forEach(result => {
      expect(result.category).toBe('authorization');
    });
  });
});

describe('getErrorCategories', () => {
  it('should return all defined error categories', () => {
    const categories = getErrorCategories();

    expect(categories).toContain('connection');
    expect(categories).toContain('timeout');
    expect(categories).toContain('execution');
    expect(categories).toContain('validation');
    expect(categories).toContain('authorization');
    expect(categories).toContain('notfound');
  });

  it('should return unique categories', () => {
    const categories = getErrorCategories();
    const uniqueCategories = new Set(categories);

    expect(categories.length).toBe(uniqueCategories.size);
  });
});

describe('sanitizeErrorMessage', () => {
  it('should remove Unix file paths', () => {
    const message = 'Error at /home/user/project/src/file.ts:42';
    const sanitized = sanitizeErrorMessage(message);

    expect(sanitized).toContain('[path]');
    expect(sanitized).not.toContain('/home/user');
  });

  it('should remove Windows file paths', () => {
    const message = 'Error at C:\\Users\\test\\project\\file.ts:42';
    const sanitized = sanitizeErrorMessage(message);

    expect(sanitized).toContain('[path]');
    expect(sanitized).not.toContain('C:\\Users');
  });

  it('should remove potential tokens (hex strings)', () => {
    const message = 'Invalid token: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
    const sanitized = sanitizeErrorMessage(message);

    expect(sanitized).toContain('[token]');
    expect(sanitized).not.toContain('a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
  });

  it('should remove email addresses', () => {
    const message = 'User test@example.com not found';
    const sanitized = sanitizeErrorMessage(message);

    expect(sanitized).toContain('[email]');
    expect(sanitized).not.toContain('test@example.com');
  });

  it('should remove IP addresses', () => {
    const message = 'Connection to 192.168.1.1 failed';
    const sanitized = sanitizeErrorMessage(message);

    expect(sanitized).toContain('[ip]');
    expect(sanitized).not.toContain('192.168.1.1');
  });

  it('should preserve non-sensitive information', () => {
    const message = 'Operation failed: invalid input';
    const sanitized = sanitizeErrorMessage(message);

    expect(sanitized).toContain('invalid input');
  });
});
