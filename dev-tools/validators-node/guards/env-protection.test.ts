/**
 * Tests for env-protection guard
 */

import { describe, it, expect } from 'vitest';
import {
  isProtectedFile,
  isAllowedPattern,
  validateEnvProtection,
} from '../../.claude/validators-node/src/guards/env-protection.js';
import { EXIT_CODES } from '../../.claude/validators-node/src/types/index.js';

describe('isAllowedPattern', () => {
  it('should allow .example files', () => {
    expect(isAllowedPattern('.env.example')).toBe(true);
    expect(isAllowedPattern('config.example')).toBe(true);
    expect(isAllowedPattern('secrets.example')).toBe(true);
  });

  it('should allow .template files', () => {
    expect(isAllowedPattern('.env.template')).toBe(true);
    expect(isAllowedPattern('config.template')).toBe(true);
  });

  it('should allow .sample files', () => {
    expect(isAllowedPattern('.env.sample')).toBe(true);
    expect(isAllowedPattern('config.sample')).toBe(true);
  });

  it('should allow example.* files', () => {
    expect(isAllowedPattern('example.env')).toBe(true);
    expect(isAllowedPattern('template.env')).toBe(true);
    expect(isAllowedPattern('sample.env')).toBe(true);
  });

  it('should not allow actual sensitive files', () => {
    expect(isAllowedPattern('.env')).toBe(false);
    expect(isAllowedPattern('secrets.json')).toBe(false);
    expect(isAllowedPattern('id_rsa')).toBe(false);
  });
});

describe('isProtectedFile', () => {
  describe('environment files', () => {
    it('should protect .env files', () => {
      expect(isProtectedFile('.env')[0]).toBe(true);
      expect(isProtectedFile('.env.local')[0]).toBe(true);
      expect(isProtectedFile('.env.production')[0]).toBe(true);
      expect(isProtectedFile('app.env')[0]).toBe(true);
      expect(isProtectedFile('.envrc')[0]).toBe(true);
    });

    it('should not protect .env.example files', () => {
      expect(isProtectedFile('.env.example')[0]).toBe(false);
      expect(isProtectedFile('.env.template')[0]).toBe(false);
      expect(isProtectedFile('.env.sample')[0]).toBe(false);
    });
  });

  describe('credential files', () => {
    it('should protect credential files', () => {
      expect(isProtectedFile('credentials.json')[0]).toBe(true);
      expect(isProtectedFile('secrets.yaml')[0]).toBe(true);
      expect(isProtectedFile('aws_credentials')[0]).toBe(true);
    });
  });

  describe('key files', () => {
    it('should protect private keys', () => {
      expect(isProtectedFile('id_rsa')[0]).toBe(true);
      expect(isProtectedFile('id_rsa.pub')[0]).toBe(true);
      expect(isProtectedFile('id_ed25519')[0]).toBe(true);
      expect(isProtectedFile('server.pem')[0]).toBe(true);
      expect(isProtectedFile('private.key')[0]).toBe(true);
      expect(isProtectedFile('cert.p12')[0]).toBe(true);
    });
  });

  describe('SSH configuration', () => {
    it('should protect SSH config files', () => {
      expect(isProtectedFile('ssh_config')[0]).toBe(true);
      expect(isProtectedFile('known_hosts')[0]).toBe(true);
      expect(isProtectedFile('authorized_keys')[0]).toBe(true);
    });
  });

  describe('cloud provider configs', () => {
    it('should protect AWS credential paths', () => {
      expect(isProtectedFile('.aws/credentials')[0]).toBe(true);
      expect(isProtectedFile('.aws/config')[0]).toBe(true);
    });

    it('should protect Kubernetes configs', () => {
      expect(isProtectedFile('kubeconfig')[0]).toBe(true);
      expect(isProtectedFile('.kube/config')[0]).toBe(true);
    });

    it('should protect cloud config directories', () => {
      expect(isProtectedFile('/home/user/.gcloud/credentials')[0]).toBe(true);
      expect(isProtectedFile('/home/user/.azure/config')[0]).toBe(true);
      expect(isProtectedFile('/home/user/.config/gcloud/config')[0]).toBe(true);
    });
  });

  describe('hidden files with sensitive keywords', () => {
    it('should protect hidden files with sensitive keywords', () => {
      expect(isProtectedFile('.secrets')[0]).toBe(true);
      expect(isProtectedFile('.credentials')[0]).toBe(true);
      expect(isProtectedFile('.auth_token')[0]).toBe(true);
      expect(isProtectedFile('.private_config')[0]).toBe(true);
    });

    it('should not protect regular hidden files', () => {
      expect(isProtectedFile('.gitignore')[0]).toBe(false);
      expect(isProtectedFile('.prettierrc')[0]).toBe(false);
    });
  });

  describe('regular files', () => {
    it('should not protect regular code files', () => {
      expect(isProtectedFile('index.ts')[0]).toBe(false);
      expect(isProtectedFile('app.js')[0]).toBe(false);
      expect(isProtectedFile('README.md')[0]).toBe(false);
      expect(isProtectedFile('package.json')[0]).toBe(false);
    });
  });
});

describe('validateEnvProtection', () => {
  it('should allow empty file path', () => {
    expect(validateEnvProtection('')).toBe(EXIT_CODES.ALLOW);
  });

  it('should allow regular files', () => {
    expect(validateEnvProtection('src/index.ts')).toBe(EXIT_CODES.ALLOW);
    expect(validateEnvProtection('package.json')).toBe(EXIT_CODES.ALLOW);
  });

  it('should allow example/template files', () => {
    expect(validateEnvProtection('.env.example')).toBe(EXIT_CODES.ALLOW);
    expect(validateEnvProtection('.env.template')).toBe(EXIT_CODES.ALLOW);
  });

  it('should block protected files', () => {
    expect(validateEnvProtection('.env')).toBe(EXIT_CODES.HARD_BLOCK);
    expect(validateEnvProtection('id_rsa')).toBe(EXIT_CODES.HARD_BLOCK);
    expect(validateEnvProtection('credentials.json')).toBe(EXIT_CODES.HARD_BLOCK);
  });
});
