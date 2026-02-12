/**
 * SA-04: Deterministic JSON Serialization Tests
 * ==============================================
 * Tests that deterministicStringify() produces identical output
 * regardless of object key insertion order, ensuring hash chain
 * integrity across different runtime environments.
 *
 * Risk: R-017 (CVSS 3.4)
 * Remediation: REM-008
 */

import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

/**
 * Deterministic JSON stringify — mirrors TamperEvidentAuditLogger.deterministicStringify()
 */
function deterministicStringify(obj) {
  if (obj === null || obj === undefined) return JSON.stringify(obj);
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (obj instanceof Date) return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(item => deterministicStringify(item)).join(',') + ']';
  }
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(key => {
    const value = deterministicStringify(obj[key]);
    return JSON.stringify(key) + ':' + value;
  });
  return '{' + pairs.join(',') + '}';
}

/**
 * Helper: Create a test entry matching audit-logger.ts format
 */
function createTestEntry(event, previousHash, blockIndex) {
  const TEST_KEY = 'test-hmac-secret-key-at-least-32-chars-long!!';
  const entryData = {
    ...event,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    blockIndex
  };

  const dataToHash = deterministicStringify(entryData) + previousHash;
  const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
  const signature = crypto.createHmac('sha256', TEST_KEY).update(dataToHash).digest('hex');

  return {
    ...entryData,
    hash,
    previousHash,
    signature
  };
}

describe('Deterministic JSON Serialization (SA-04)', () => {

  describe('Key order independence', () => {
    it('should produce identical output for objects with different key insertion order', () => {
      const obj1 = { action: 'test', resource: 'file', outcome: 'success' };
      const obj2 = { outcome: 'success', action: 'test', resource: 'file' };
      const obj3 = { resource: 'file', outcome: 'success', action: 'test' };

      const result1 = deterministicStringify(obj1);
      const result2 = deterministicStringify(obj2);
      const result3 = deterministicStringify(obj3);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('should produce identical hashes for entries with different key order', () => {
      const data1 = { action: 'login', resource: 'auth', outcome: 'success', details: { ip: '127.0.0.1' } };
      const data2 = { details: { ip: '127.0.0.1' }, outcome: 'success', resource: 'auth', action: 'login' };

      const hash1 = crypto.createHash('sha256').update(deterministicStringify(data1)).digest('hex');
      const hash2 = crypto.createHash('sha256').update(deterministicStringify(data2)).digest('hex');

      expect(hash1).toBe(hash2);
    });

    it('should sort keys alphabetically', () => {
      const obj = { zebra: 1, apple: 2, mango: 3 };
      const result = deterministicStringify(obj);

      expect(result).toBe('{"apple":2,"mango":3,"zebra":1}');
    });

    it('should handle single-key objects', () => {
      const obj = { key: 'value' };
      expect(deterministicStringify(obj)).toBe('{"key":"value"}');
    });

    it('should handle empty objects', () => {
      expect(deterministicStringify({})).toBe('{}');
    });
  });

  describe('Nested object handling', () => {
    it('should sort keys in nested objects recursively', () => {
      const obj1 = { outer: { z: 1, a: 2 }, name: 'test' };
      const obj2 = { name: 'test', outer: { a: 2, z: 1 } };

      expect(deterministicStringify(obj1)).toBe(deterministicStringify(obj2));
    });

    it('should handle deeply nested objects', () => {
      const obj1 = { a: { b: { c: { z: 1, a: 2 } } } };
      const obj2 = { a: { b: { c: { a: 2, z: 1 } } } };

      expect(deterministicStringify(obj1)).toBe(deterministicStringify(obj2));
    });

    it('should handle mixed nested types', () => {
      const obj = { arr: [1, 2], nested: { b: 'B', a: 'A' }, str: 'hello' };
      const result = deterministicStringify(obj);

      expect(result).toBe('{"arr":[1,2],"nested":{"a":"A","b":"B"},"str":"hello"}');
    });
  });

  describe('Array handling', () => {
    it('should preserve array element order', () => {
      const arr = [3, 1, 2];
      expect(deterministicStringify(arr)).toBe('[3,1,2]');
    });

    it('should handle arrays of objects with different key orders', () => {
      const arr1 = [{ b: 2, a: 1 }, { d: 4, c: 3 }];
      const arr2 = [{ a: 1, b: 2 }, { c: 3, d: 4 }];

      expect(deterministicStringify(arr1)).toBe(deterministicStringify(arr2));
    });

    it('should handle empty arrays', () => {
      expect(deterministicStringify([])).toBe('[]');
    });

    it('should handle nested arrays', () => {
      const arr = [[1, 2], [3, 4]];
      expect(deterministicStringify(arr)).toBe('[[1,2],[3,4]]');
    });
  });

  describe('Primitive handling', () => {
    it('should handle null', () => {
      expect(deterministicStringify(null)).toBe('null');
    });

    it('should handle undefined', () => {
      expect(deterministicStringify(undefined)).toBe(undefined);
    });

    it('should handle strings', () => {
      expect(deterministicStringify('hello')).toBe('"hello"');
    });

    it('should handle numbers', () => {
      expect(deterministicStringify(42)).toBe('42');
      expect(deterministicStringify(3.14)).toBe('3.14');
      expect(deterministicStringify(0)).toBe('0');
      expect(deterministicStringify(-1)).toBe('-1');
    });

    it('should handle booleans', () => {
      expect(deterministicStringify(true)).toBe('true');
      expect(deterministicStringify(false)).toBe('false');
    });

    it('should handle Date objects', () => {
      const date = new Date('2026-01-15T12:00:00.000Z');
      expect(deterministicStringify(date)).toBe(JSON.stringify(date));
    });
  });

  describe('Special value handling', () => {
    it('should handle null values in objects', () => {
      const obj = { b: null, a: 'value' };
      expect(deterministicStringify(obj)).toBe('{"a":"value","b":null}');
    });

    it('should handle undefined values in objects (omitted by JSON.stringify)', () => {
      const obj = { b: undefined, a: 'value' };
      // undefined values should still appear since we iterate Object.keys
      const result = deterministicStringify(obj);
      expect(result).toContain('"a":"value"');
    });

    it('should handle objects with numeric-like string keys', () => {
      const obj = { '2': 'b', '1': 'a', '10': 'c' };
      const result = deterministicStringify(obj);
      // Numeric keys get sorted as strings: "1" < "10" < "2"
      expect(result).toBe('{"1":"a","10":"c","2":"b"}');
    });

    it('should handle empty strings as values', () => {
      const obj = { key: '' };
      expect(deterministicStringify(obj)).toBe('{"key":""}');
    });
  });

  describe('Hash chain integrity with deterministic serialization', () => {
    it('should produce valid hash chain entries', () => {
      const entries = [];
      let prevHash = '';

      for (let i = 0; i < 5; i++) {
        const entry = createTestEntry(
          { action: `action_${i}`, resource: 'r', outcome: 'success', details: { i } },
          prevHash, i
        );
        entries.push(entry);
        prevHash = entry.hash;
      }

      // Verify chain linkage
      for (let i = 1; i < entries.length; i++) {
        expect(entries[i].previousHash).toBe(entries[i - 1].hash);
      }
    });

    it('should verify chain integrity after round-trip JSON serialization', () => {
      const entries = [];
      let prevHash = '';

      for (let i = 0; i < 3; i++) {
        const entry = createTestEntry(
          { action: `act_${i}`, resource: 'res', outcome: 'success', details: {} },
          prevHash, i
        );
        entries.push(entry);
        prevHash = entry.hash;
      }

      // Round-trip through JSON (simulates reading from log file)
      const serialized = entries.map(e => JSON.stringify(e));
      const deserialized = serialized.map(s => JSON.parse(s));

      // Verify each entry's hash is still correct after round-trip
      let chainPrevHash = '';
      for (const entry of deserialized) {
        const { hash, previousHash, signature, merkleRoot, ...entryData } = entry;
        const expectedHash = crypto.createHash('sha256')
          .update(deterministicStringify(entryData) + chainPrevHash)
          .digest('hex');
        expect(hash).toBe(expectedHash);
        expect(previousHash).toBe(chainPrevHash);
        chainPrevHash = hash;
      }
    });

    it('should detect tampering even when key order changes after round-trip', () => {
      const entry = createTestEntry(
        { action: 'test', resource: 'r', outcome: 'success', details: { secret: 'data' } },
        '', 0
      );

      // Tamper with the entry
      const tampered = { ...entry, action: 'tampered' };
      const { hash, previousHash, signature, merkleRoot, ...entryData } = tampered;
      const recomputedHash = crypto.createHash('sha256')
        .update(deterministicStringify(entryData) + previousHash)
        .digest('hex');

      // Original hash should NOT match recomputed hash
      expect(hash).not.toBe(recomputedHash);
    });
  });

  describe('Compatibility with JSON.stringify for sorted objects', () => {
    it('should produce same output as JSON.stringify when keys are already sorted', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(deterministicStringify(obj)).toBe(JSON.stringify(obj));
    });

    it('should differ from JSON.stringify when keys are unsorted', () => {
      const obj = { c: 3, a: 1, b: 2 };
      // JSON.stringify preserves insertion order: {"c":3,"a":1,"b":2}
      // deterministicStringify sorts keys: {"a":1,"b":2,"c":3}
      expect(deterministicStringify(obj)).not.toBe(JSON.stringify(obj));
      expect(deterministicStringify(obj)).toBe('{"a":1,"b":2,"c":3}');
    });
  });

  describe('Audit entry format compatibility', () => {
    it('should handle typical audit entry structure', () => {
      const entryData = {
        action: 'agent_access',
        resource: 'src/cybersec-team/agents/penetration-tester',
        outcome: 'success',
        category: 'authorization',
        details: {
          userId: 'user-123',
          role: 'security-engineer',
          module: 'cybersec-team'
        },
        severity: 'medium',
        id: 'test-uuid-1234',
        timestamp: '2026-02-12T10:00:00.000Z',
        blockIndex: 42
      };

      // Should produce consistent output
      const result1 = deterministicStringify(entryData);
      const result2 = deterministicStringify(entryData);
      expect(result1).toBe(result2);

      // Keys should be in sorted order
      const parsed = result1;
      const actionIdx = parsed.indexOf('"action"');
      const blockIdx = parsed.indexOf('"blockIndex"');
      const categoryIdx = parsed.indexOf('"category"');
      expect(actionIdx).toBeLessThan(blockIdx);
      expect(blockIdx).toBeLessThan(categoryIdx);
    });

    it('should handle entry with all field types', () => {
      const entryData = {
        stringField: 'text',
        numberField: 42,
        boolField: true,
        nullField: null,
        arrayField: [1, 'two', { three: 3 }],
        objectField: { nested: true }
      };

      const result = deterministicStringify(entryData);
      expect(result).toContain('"arrayField"');
      expect(result).toContain('"boolField":true');
      expect(result).toContain('"nullField":null');
      expect(result).toContain('"numberField":42');
      expect(result).toContain('"objectField":{"nested":true}');
      expect(result).toContain('"stringField":"text"');
    });
  });
});
