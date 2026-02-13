/**
 * OWASP Web Injection Extended Tests
 * Suite: tests/owasp/web-injection-extended.test.js
 * OWASP Coverage: A03-101..105 (SQL Injection)
 *
 * Source files:
 *   .claude/validators-node/src/guards/bash-safety.js (extended with SQLi)
 */

import { describe, expect, it } from 'vitest';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// ===========================================================================
// Story OWASP-01: SQL Injection Detection (A03-101..105)
// ===========================================================================

describe('OWASP Web Injection: Story OWASP-01 — SQL Injection Detection', () => {
  // Import validator functions
  let checkSQLInjection;

  beforeAll(async () => {
    // Import compiled JavaScript
    const validatorPath = path.join(PROJECT_ROOT, '.claude/validators-node/dist/src/guards/bash-safety.js');
    const module = await import(validatorPath);
    checkSQLInjection = module.checkSQLInjection;
  });

  // -------------------------------------------------------------------------
  // A03-101: UNION-based SQL injection detection
  // -------------------------------------------------------------------------
  describe('A03-101: UNION-based SQL injection detection', () => {
    it('should detect UNION SELECT pattern', () => {
      const cmd = "SELECT * FROM users WHERE id = 1 UNION SELECT NULL, username, password FROM users";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-101');
      expect(result.subtype).toBe('UNION');
    });

    it('should detect UNION ALL SELECT pattern', () => {
      const cmd = "SELECT name FROM products WHERE id = 5 UNION ALL SELECT name FROM users";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-101');
    });

    it('should detect ORDER BY with comment', () => {
      const cmd = "SELECT * FROM users ORDER BY 1--";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-101');
    });

    it('should detect HAVING 1=1 pattern', () => {
      const cmd = "SELECT * FROM users GROUP BY id HAVING 1=1--";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-101');
    });
  });

  // -------------------------------------------------------------------------
  // A03-102: Boolean-blind SQL injection detection
  // -------------------------------------------------------------------------
  describe('A03-102: Boolean-blind SQL injection detection', () => {
    it('should detect OR 1=1 pattern', () => {
      const cmd = "SELECT * FROM users WHERE id = 1 OR 1=1";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-102');
      expect(result.subtype).toBe('BOOLEAN_BLIND');
    });

    it('should detect AND 1=2 pattern', () => {
      const cmd = "SELECT * FROM users WHERE username = 'admin' AND 1=2";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-102');
    });

    it('should detect OR quotes equals pattern', () => {
      const cmd = "SELECT * FROM users WHERE name = 'test' OR 'a'='a'";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-102');
    });

    it('should detect IF statement pattern', () => {
      const cmd = "SELECT IF(1=1, username, password) FROM users";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-102');
    });
  });

  // -------------------------------------------------------------------------
  // A03-103: Time-based SQL injection detection
  // -------------------------------------------------------------------------
  describe('A03-103: Time-based SQL injection detection', () => {
    it('should detect SLEEP function', () => {
      const cmd = "SELECT * FROM users WHERE id = 1; SELECT SLEEP(5)--";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-103');
      expect(result.subtype).toBe('TIME_BASED');
    });

    it('should detect WAITFOR DELAY', () => {
      const cmd = "SELECT * FROM users; WAITFOR DELAY '0:0:5'--";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-103');
    });

    it('should detect BENCHMARK function', () => {
      const cmd = "SELECT BENCHMARK(5000000, MD5('test')) FROM users";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-103');
    });

    it('should detect pg_sleep function', () => {
      const cmd = "SELECT pg_sleep(5) FROM users";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-103');
    });
  });

  // -------------------------------------------------------------------------
  // A03-104: Error-based SQL injection detection
  // -------------------------------------------------------------------------
  describe('A03-104: Error-based SQL injection detection', () => {
    it('should detect CAST to INT', () => {
      const cmd = "SELECT * FROM users WHERE id = CAST(1 AS INT)";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-104');
      expect(result.subtype).toBe('ERROR_BASED');
    });

    it('should detect CONVERT with INT', () => {
      const cmd = "SELECT * FROM users WHERE id = CONVERT(INT, GETDATE())";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-104');
    });

    it('should detect FLOOR RAND pattern', () => {
      const cmd = "SELECT * FROM (SELECT FLOOR(RAND(0)*2))x FROM users)a";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-104');
    });

    it('should detect COUNT CONCAT pattern', () => {
      const cmd = "SELECT COUNT(*),CONCAT(0x3a, database(),0x3a,FLOOR(RAND(0)*2))x FROM users";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-104');
    });
  });

  // -------------------------------------------------------------------------
  // A03-105: Stacked query injection detection
  // -------------------------------------------------------------------------
  describe('A03-105: Stacked query injection detection', () => {
    it('should detect DROP TABLE after SELECT', () => {
      const cmd = "SELECT * FROM users; DROP TABLE users--";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-105');
      expect(result.subtype).toBe('STACKED_QUERY');
    });

    it('should detect INSERT with stacked query', () => {
      const cmd = "SELECT * FROM users; INSERT INTO users VALUES(1,'test','test')--";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-105');
    });

    it('should detect UPDATE with stacked query', () => {
      const cmd = "SELECT * FROM users; UPDATE users SET name='test'--";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-105');
    });

    it('should detect EXEC with stacked query', () => {
      const cmd = "SELECT * FROM users; EXEC sp_configure 'show advanced options', 1--";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-105');
    });

    it('should detect TRUNCATE with stacked query', () => {
      const cmd = "SELECT * FROM logs; TRUNCATE TABLE audit_log--";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.testId).toBe('A03-105');
    });
  });

  // -------------------------------------------------------------------------
  // Additional contextual patterns (A03-GENERAL)
  // -------------------------------------------------------------------------
  describe('A03-GENERAL: Contextual SQL injection patterns', () => {
    it('should detect SELECT * FROM pattern', () => {
      const cmd = "SELECT * FROM users WHERE id = 1";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.severity).toBe('WARNING');
    });

    it('should detect 1=1 always-true pattern', () => {
      const cmd = "SELECT * FROM users WHERE 1=1";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.severity).toBe('WARNING');
    });

    it('should detect SQL comment at end', () => {
      const cmd = "SELECT * FROM users WHERE id = 1--";
      const result = checkSQLInjection(cmd);
      expect(result.isSQLi).toBe(true);
      expect(result.severity).toBe('WARNING');
    });

    it('should allow legitimate SQL in comments', () => {
      const cmd = "# Example query: SELECT * FROM table\nls -la";
      const result = checkSQLInjection(cmd);
      // May detect but should be WARNING level
      if (result.isSQLi) {
        expect(result.severity).toBe('WARNING');
      }
    });
  });

  // Note: XSS Detection (A03-201..208) deferred to next phase
  // Will be implemented in a future update
});
