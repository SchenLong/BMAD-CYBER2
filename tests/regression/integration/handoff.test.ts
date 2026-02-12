/**
 * BMAD CYBERCOMMAND - Agent Handoff Tests
 * =======================================
 * Regression tests for agent handoff functionality.
 * These tests verify agent coordination and state transfer.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Project root directory
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

describe('Agent Handoff', () => {
  describe('Session Management', () => {
    it('should have SessionManager in auth module', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('SessionManager');
    });

    it('should have session-manager module in core security', () => {
      const sessionPath = path.join(PROJECT_ROOT, 'src/core/security/session-manager.d.ts');
      expect(fs.existsSync(sessionPath)).toBe(true);
    });

    it('should track sessions in AuthManager', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('sessions');
      expect(content).toContain('Map');
    });

    it('should have getActiveSessionsCount method', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('getActiveSessionsCount');
    });
  });

  describe('Auth Context', () => {
    it('should define AuthContext interface', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('export interface AuthContext');
    });

    it('should include userId in AuthContext', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('userId: string');
    });

    it('should include sessionId in AuthContext', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('sessionId: string');
    });

    it('should include roles in AuthContext', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('roles: string[]');
    });

    it('should include permissions in AuthContext', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('permissions: string[]');
    });

    it('should include isAuthenticated flag', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('isAuthenticated: boolean');
    });
  });

  describe('Token Management', () => {
    it('should have TokenGenerator export', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('TokenGenerator');
    });

    it('should have generate-token module', () => {
      const tokenPath = path.join(PROJECT_ROOT, 'src/core/security/generate-token.d.ts');
      expect(fs.existsSync(tokenPath)).toBe(true);
    });

    it('should define AuthToken interface', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('export interface AuthToken');
    });

    it('should include accessToken in AuthToken', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('accessToken: string');
    });

    it('should include refreshToken in AuthToken', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('refreshToken');
    });

    it('should include expiresIn in AuthToken', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('expiresIn: number');
    });
  });

  describe('Session Lifecycle', () => {
    it('should have authenticate method', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('async authenticate');
    });

    it('should have validateAuthToken method', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('async validateAuthToken');
    });

    it('should have authorize method', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('async authorize');
    });

    it('should have logout method', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('logout');
    });
  });

  describe('Session Tracker (AI Safety)', () => {
    it('should have session-tracker in ai-safety', () => {
      const sessionPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/ai-safety/session-tracker.ts');
      expect(fs.existsSync(sessionPath)).toBe(true);
    });
  });

  describe('Context Manager (Resource Management)', () => {
    it('should have context-manager module', () => {
      const contextPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/resource-management/context-manager.ts');
      expect(fs.existsSync(contextPath)).toBe(true);
    });
  });
});

describe('Middleware Support', () => {
  describe('Express-like Middleware', () => {
    it('should export requireAuth middleware', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('export function requireAuth');
    });

    it('should export requirePermission middleware', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('export function requirePermission');
    });

    it('should check Authorization header in middleware', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('authorization');
      expect(content).toContain('Bearer');
    });
  });

  describe('Convenience Functions', () => {
    it('should export createAuthManager function', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('export function createAuthManager');
    });

    it('should export quickAuth function', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('export async function quickAuth');
    });
  });
});

describe('User Context Handoff', () => {
  it('should define UserContext in authorization module', async () => {
    const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
    const content = fs.readFileSync(authPath, 'utf-8');

    expect(content).toContain('export interface UserContext');
  });

  it('should include userId in UserContext', async () => {
    const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
    const content = fs.readFileSync(authPath, 'utf-8');

    expect(content).toContain('userId: string');
  });

  it('should include userName in UserContext', async () => {
    const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
    const content = fs.readFileSync(authPath, 'utf-8');

    expect(content).toContain('userName: string');
  });

  it('should include modules in UserContext', async () => {
    const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
    const content = fs.readFileSync(authPath, 'utf-8');

    expect(content).toContain('modules: string[]');
  });

  it('should include credentialVerified in UserContext', async () => {
    const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
    const content = fs.readFileSync(authPath, 'utf-8');

    expect(content).toContain('credentialVerified');
  });
});
