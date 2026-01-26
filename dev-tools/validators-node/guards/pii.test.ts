/**
 * Tests for PII guard
 */

import { describe, it, expect } from 'vitest';
import {
  isTestFile,
  isSensitiveContext,
  isFakeData,
  detectPii,
  validatePiiGuard,
} from '../../.claude/validators-node/src/guards/pii/index.js';
import {
  validateLuhn,
  validateIban,
  validateAbaRouting,
  validateNhsNumber,
  validateSpanishDni,
  validateSpanishNie,
  validateDutchBsn,
  validatePolishPesel,
  validatePortugueseNif,
} from '../../.claude/validators-node/src/guards/pii/validators.js';
import { EXIT_CODES } from '../../.claude/validators-node/src/types/index.js';

describe('PII Validators', () => {
  describe('validateLuhn', () => {
    it('should validate valid credit card numbers', () => {
      expect(validateLuhn('4532015112830366')).toBe(true); // Visa
      expect(validateLuhn('5425233430109903')).toBe(true); // Mastercard
      expect(validateLuhn('374245455400126')).toBe(true);  // Amex
    });

    it('should reject invalid numbers', () => {
      expect(validateLuhn('1234567890123456')).toBe(false);
      expect(validateLuhn('123')).toBe(false); // Too short
    });
  });

  describe('validateIban', () => {
    it('should validate valid IBANs', () => {
      expect(validateIban('DE89370400440532013000')).toBe(true); // Germany
      expect(validateIban('GB82WEST12345698765432')).toBe(true); // UK
      expect(validateIban('FR1420041010050500013M02606')).toBe(true); // France
    });

    it('should reject invalid IBANs', () => {
      expect(validateIban('DE89370400440532013001')).toBe(false); // Wrong check digit
      expect(validateIban('XX00000000000000')).toBe(false); // Invalid country
      expect(validateIban('DE123')).toBe(false); // Too short
    });
  });

  describe('validateAbaRouting', () => {
    it('should validate valid routing numbers', () => {
      expect(validateAbaRouting('021000021')).toBe(true); // Chase
      expect(validateAbaRouting('011401533')).toBe(true); // Bank of America
    });

    it('should reject invalid routing numbers', () => {
      expect(validateAbaRouting('123456789')).toBe(false);
      expect(validateAbaRouting('12345678')).toBe(false); // Wrong length
    });
  });

  describe('validateNhsNumber', () => {
    it('should validate valid NHS numbers', () => {
      expect(validateNhsNumber('4505577104')).toBe(true);
    });

    it('should reject invalid NHS numbers', () => {
      expect(validateNhsNumber('1234567890')).toBe(false);
      expect(validateNhsNumber('123456789')).toBe(false); // Wrong length
    });
  });

  describe('validateSpanishDni', () => {
    it('should validate valid DNIs', () => {
      expect(validateSpanishDni('12345678Z')).toBe(true);
    });

    it('should reject invalid DNIs', () => {
      expect(validateSpanishDni('12345678A')).toBe(false); // Wrong letter
      expect(validateSpanishDni('1234567Z')).toBe(false);  // Wrong length
    });
  });

  describe('validateSpanishNie', () => {
    it('should validate valid NIEs', () => {
      expect(validateSpanishNie('X1234567L')).toBe(true);
    });

    it('should reject invalid NIEs', () => {
      expect(validateSpanishNie('X1234567A')).toBe(false); // Wrong letter
      expect(validateSpanishNie('A1234567L')).toBe(false); // Wrong prefix
    });
  });

  describe('validateDutchBsn', () => {
    it('should validate valid BSNs', () => {
      expect(validateDutchBsn('111222333')).toBe(true);
    });

    it('should reject invalid BSNs', () => {
      expect(validateDutchBsn('123456789')).toBe(false);
      expect(validateDutchBsn('12345678')).toBe(false); // Wrong length
    });
  });

  describe('validatePolishPesel', () => {
    it('should validate valid PESELs', () => {
      expect(validatePolishPesel('44051401359')).toBe(true);
    });

    it('should reject invalid PESELs', () => {
      expect(validatePolishPesel('12345678901')).toBe(false);
      expect(validatePolishPesel('1234567890')).toBe(false); // Wrong length
    });
  });

  describe('validatePortugueseNif', () => {
    it('should validate valid NIFs', () => {
      expect(validatePortugueseNif('123456789')).toBe(true);
    });

    it('should reject invalid NIFs', () => {
      expect(validatePortugueseNif('012345678')).toBe(false); // Starts with 0
      expect(validatePortugueseNif('12345678')).toBe(false);  // Wrong length
    });
  });
});

describe('isTestFile', () => {
  it('should identify test data files', () => {
    expect(isTestFile('/test_data/users.json')).toBe(true);
    expect(isTestFile('/fixtures/data.json')).toBe(true);
    expect(isTestFile('/seeds/users.sql')).toBe(true);
  });

  it('should identify example/sample files', () => {
    expect(isTestFile('data.example.json')).toBe(true);
    expect(isTestFile('config.sample')).toBe(true);
    expect(isTestFile('.env.template')).toBe(true);
  });

  it('should identify fake/dummy files', () => {
    expect(isTestFile('fake_data.json')).toBe(true);
    expect(isTestFile('data_fake.json')).toBe(true);
    expect(isTestFile('dummy_users.json')).toBe(true);
  });

  it('should not identify regular files', () => {
    expect(isTestFile('users.json')).toBe(false);
    expect(isTestFile('config.ts')).toBe(false);
  });
});

describe('isSensitiveContext', () => {
  it('should detect sensitive keywords', () => {
    expect(isSensitiveContext('personal data', 'personal data')).toBe(true);
    expect(isSensitiveContext('customer records', 'customer records')).toBe(true);
    expect(isSensitiveContext('GDPR compliance', 'GDPR compliance')).toBe(true);
  });

  it('should detect PII-related keywords', () => {
    expect(isSensitiveContext('SSN: 123-45-6789', 'SSN: 123-45-6789')).toBe(true);
    expect(isSensitiveContext('credit card number', 'credit card number')).toBe(true);
  });

  it('should not flag general content', () => {
    expect(isSensitiveContext('hello world', 'hello world')).toBe(false);
    expect(isSensitiveContext('const x = 42', 'const x = 42')).toBe(false);
  });
});

describe('isFakeData', () => {
  it('should detect fake/test indicators', () => {
    expect(isFakeData('fake data here', 'fake data here')).toBe(true);
    expect(isFakeData('test user John Doe', 'test user John Doe')).toBe(true);
    expect(isFakeData('John Doe', 'John Doe')).toBe(true);
  });

  it('should detect placeholder patterns', () => {
    expect(isFakeData('SSN: 000-00-0000', 'SSN: 000-00-0000')).toBe(true);
    expect(isFakeData('SSN: 123-45-6789', 'SSN: 123-45-6789')).toBe(true);
  });

  it('should not flag real-looking data without indicators', () => {
    expect(isFakeData('account number 987654321', 'account number 987654321')).toBe(false);
  });
});

describe('detectPii', () => {
  describe('US patterns', () => {
    it('should detect SSN in sensitive context', () => {
      // SSN doesn't require context, so it should detect
      const pii = detectPii('Customer SSN: 234-56-7890');
      expect(pii.some(p => p.patternName === 'SSN')).toBe(true);
    });

    it('should not detect invalid SSN area numbers', () => {
      const pii1 = detectPii('ID: 000-45-6789'); // Area 000
      const pii2 = detectPii('ID: 666-45-6789'); // Area 666
      expect(pii1.some(p => p.patternName === 'SSN')).toBe(false);
      expect(pii2.some(p => p.patternName === 'SSN')).toBe(false);
    });

    it('should detect ITIN', () => {
      const pii = detectPii('ITIN: 912-78-1234');
      expect(pii.some(p => p.patternName === 'ITIN')).toBe(true);
    });
  });

  describe('EU patterns', () => {
    it('should detect valid IBAN', () => {
      const pii = detectPii('IBAN: DE89370400440532013000');
      expect(pii.some(p => p.patternName === 'IBAN')).toBe(true);
    });

    it('should detect Spanish DNI', () => {
      const pii = detectPii('DNI: 12345678Z');
      expect(pii.some(p => p.patternName === 'Spanish_DNI')).toBe(true);
    });
  });

  describe('Common patterns', () => {
    it('should detect valid credit card', () => {
      const pii = detectPii('Card: 4532015112830366');
      expect(pii.some(p => p.patternName === 'Credit_Card')).toBe(true);
    });

    it('should not detect invalid credit card', () => {
      const pii = detectPii('Number: 1234567890123456');
      expect(pii.some(p => p.patternName === 'Credit_Card')).toBe(false);
    });
  });

  describe('fake data filtering', () => {
    it('should filter fake data', () => {
      const pii = detectPii('Test SSN: 234-56-7890 (fake data for testing)');
      expect(pii.length).toBe(0);
    });

    it('should filter John Doe patterns', () => {
      const pii = detectPii('John Doe SSN: 234-56-7890');
      expect(pii.length).toBe(0);
    });
  });
});

describe('validatePiiGuard', () => {
  it('should allow empty content', () => {
    expect(validatePiiGuard('', 'file.txt')).toBe(EXIT_CODES.ALLOW);
  });

  it('should allow test files', () => {
    const content = 'SSN: 234-56-7890';
    expect(validatePiiGuard(content, 'test_data/users.json')).toBe(EXIT_CODES.ALLOW);
  });

  it('should allow content without PII', () => {
    const content = 'const message = "Hello World";';
    expect(validatePiiGuard(content, 'app.ts')).toBe(EXIT_CODES.ALLOW);
  });

  it('should allow info-only PII', () => {
    // Email is info-level and requires context
    const content = 'contact@example.com';
    expect(validatePiiGuard(content, 'contacts.txt')).toBe(EXIT_CODES.ALLOW);
  });

  it('should block critical PII', () => {
    const content = 'Customer SSN: 234-56-7890';
    expect(validatePiiGuard(content, 'data.json')).toBe(EXIT_CODES.HARD_BLOCK);
  });

  it('should block credit cards', () => {
    const content = 'Card: 4532015112830366';
    expect(validatePiiGuard(content, 'payment.txt')).toBe(EXIT_CODES.HARD_BLOCK);
  });
});
