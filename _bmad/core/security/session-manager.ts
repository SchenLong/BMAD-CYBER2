/**
 * BMAD Session Manager
 *
 * Manages authenticated sessions for the BMAD framework.
 * Provides session creation, validation, and user context.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { TokenGenerator, TokenClaims } from './generate-token';

// ============================================================================
// Types
// ============================================================================

export interface Session {
  id: string;
  userId: string;
  userName: string;
  email?: string;
  roles: string[];
  modules: string[];
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

export interface AuthenticationResult {
  success: boolean;
  session?: Session;
  error?: string;
  errorCode?: 'NO_KEY' | 'NO_TOKEN' | 'INVALID_TOKEN' | 'EXPIRED_TOKEN';
  requiresAction?: 'generate_token';
}

export interface UserContext {
  authenticated: boolean;
  userId?: string;
  userName?: string;
  email?: string;
  roles?: string[];
  modules?: string[];
  sessionId?: string;
}

export interface AuthStatus {
  keyExists: boolean;
  tokenExists: boolean;
  tokenValid: boolean;
  expiresAt?: Date;
  hoursUntilExpiry?: number;
  userName?: string;
}

// ============================================================================
// Session Manager
// ============================================================================

export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private tokenGenerator: TokenGenerator | null = null;
  private config: {
    tokenPath: string;
    keyPath: string;
    timeoutMinutes: number;
    maxLifetimeHours: number;
    refreshThresholdHours: number;
  };

  constructor(projectRoot: string) {
    this.config = {
      tokenPath: path.join(projectRoot, '.bmad-token'),
      keyPath: path.join(projectRoot, '.bmad-key'),
      timeoutMinutes: 480,  // 8 hours
      maxLifetimeHours: 24,
      refreshThresholdHours: 24
    };

    // Initialize token generator if key exists
    this.initializeTokenGenerator();
  }

  private initializeTokenGenerator(): void {
    if (fs.existsSync(this.config.keyPath)) {
      try {
        const key = fs.readFileSync(this.config.keyPath);
        this.tokenGenerator = new TokenGenerator(key);
      } catch {
        this.tokenGenerator = null;
      }
    }
  }

  /**
   * Authenticate user from token file
   */
  authenticate(): AuthenticationResult {
    // Check if key exists
    if (!fs.existsSync(this.config.keyPath)) {
      return {
        success: false,
        error: 'Authentication key not found. Run token generator first.',
        errorCode: 'NO_KEY',
        requiresAction: 'generate_token'
      };
    }

    // Ensure token generator is initialized
    if (!this.tokenGenerator) {
      this.initializeTokenGenerator();
    }

    if (!this.tokenGenerator) {
      return {
        success: false,
        error: 'Failed to initialize token generator.',
        errorCode: 'NO_KEY',
        requiresAction: 'generate_token'
      };
    }

    // Check if token exists
    if (!fs.existsSync(this.config.tokenPath)) {
      return {
        success: false,
        error: 'Authentication token not found. Run token generator first.',
        errorCode: 'NO_TOKEN',
        requiresAction: 'generate_token'
      };
    }

    // Read and validate token
    let token: string;
    try {
      token = fs.readFileSync(this.config.tokenPath, 'utf-8').trim();
    } catch {
      return {
        success: false,
        error: 'Failed to read token file.',
        errorCode: 'INVALID_TOKEN',
        requiresAction: 'generate_token'
      };
    }

    const claims = this.tokenGenerator.decrypt(token);

    if (!claims) {
      return {
        success: false,
        error: 'Token is invalid or expired. Generate a new token.',
        errorCode: 'EXPIRED_TOKEN',
        requiresAction: 'generate_token'
      };
    }

    // Check if token is expiring soon
    const expiresAt = new Date(claims.exp);
    const hoursUntilExpiry = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilExpiry < this.config.refreshThresholdHours && hoursUntilExpiry > 0) {
      console.warn(`\n[WARNING] Your authentication token expires in ${Math.round(hoursUntilExpiry)} hours.`);
      console.warn('         Consider generating a new token soon.\n');
    }

    // Create session
    const session = this.createSession(claims);

    return {
      success: true,
      session
    };
  }

  /**
   * Create a new session from validated claims
   */
  private createSession(claims: TokenClaims): Session {
    const now = new Date();
    const session: Session = {
      id: crypto.randomUUID(),
      userId: claims.sub,
      userName: claims.name,
      email: claims.email,
      roles: claims.roles,
      modules: claims.modules,
      createdAt: now,
      lastActivity: now,
      expiresAt: new Date(now.getTime() + this.config.timeoutMinutes * 60 * 1000)
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Get existing session by ID
   */
  getSession(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check session expiration
    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return null;
    }

    // Check max lifetime
    const lifetimeHours = (Date.now() - session.createdAt.getTime()) / (1000 * 60 * 60);
    if (lifetimeHours > this.config.maxLifetimeHours) {
      this.sessions.delete(sessionId);
      return null;
    }

    // Update last activity and extend expiration
    session.lastActivity = new Date();
    session.expiresAt = new Date(Date.now() + this.config.timeoutMinutes * 60 * 1000);

    return session;
  }

  /**
   * Get user context for current session
   */
  getUserContext(sessionId: string): UserContext {
    const session = this.getSession(sessionId);

    if (!session) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      userId: session.userId,
      userName: session.userName,
      email: session.email,
      roles: session.roles,
      modules: session.modules,
      sessionId: session.id
    };
  }

  /**
   * Check if user has required role
   */
  hasRole(sessionId: string, requiredRole: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;

    // Admin has all roles
    if (session.roles.includes('admin')) return true;

    return session.roles.includes(requiredRole);
  }

  /**
   * Check if user has any of the required roles
   */
  hasAnyRole(sessionId: string, requiredRoles: string[]): boolean {
    return requiredRoles.some(role => this.hasRole(sessionId, role));
  }

  /**
   * Check if user has access to module
   */
  hasModuleAccess(sessionId: string, moduleName: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;

    // Wildcard access
    if (session.modules.includes('*')) return true;

    return session.modules.includes(moduleName);
  }

  /**
   * End session
   */
  endSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * End all sessions (e.g., on token regeneration)
   */
  endAllSessions(): void {
    this.sessions.clear();
  }

  /**
   * Get authentication status summary
   */
  getAuthStatus(): AuthStatus {
    const keyExists = fs.existsSync(this.config.keyPath);
    const tokenExists = fs.existsSync(this.config.tokenPath);

    let tokenValid = false;
    let expiresAt: Date | undefined;
    let hoursUntilExpiry: number | undefined;
    let userName: string | undefined;

    if (keyExists && tokenExists && this.tokenGenerator) {
      try {
        const token = fs.readFileSync(this.config.tokenPath, 'utf-8').trim();
        const claims = this.tokenGenerator.decrypt(token);
        if (claims) {
          tokenValid = true;
          expiresAt = new Date(claims.exp);
          hoursUntilExpiry = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
          userName = claims.name;
        }
      } catch {
        // Token invalid or unreadable
      }
    }

    return { keyExists, tokenExists, tokenValid, expiresAt, hoursUntilExpiry, userName };
  }

  /**
   * Get formatted auth status message for display
   */
  getAuthStatusMessage(): string {
    const status = this.getAuthStatus();

    if (!status.keyExists || !status.tokenExists) {
      return `
╔══════════════════════════════════════════════════════════════════╗
║                  Authentication Required                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  No authentication token found.                                   ║
║                                                                   ║
║  To create a token, run:                                          ║
║  npx ts-node _bmad/core/security/generate-token.ts                ║
║                                                                   ║
║  This is a one-time setup that creates your identity token.       ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝`;
    }

    if (!status.tokenValid) {
      return `
╔══════════════════════════════════════════════════════════════════╗
║                      Token Expired                                ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Your authentication token has expired.                           ║
║                                                                   ║
║  To generate a new token, run:                                    ║
║  npx ts-node _bmad/core/security/generate-token.ts                ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝`;
    }

    return ''; // Token is valid, no message needed
  }

  /**
   * Get active session count
   */
  getActiveSessionCount(): number {
    // Clean expired sessions first
    const now = new Date();
    for (const [id, session] of this.sessions) {
      if (session.expiresAt < now) {
        this.sessions.delete(id);
      }
    }
    return this.sessions.size;
  }
}

// ============================================================================
// Singleton for Framework Use
// ============================================================================

let _sessionManager: SessionManager | null = null;

export function getSessionManager(projectRoot?: string): SessionManager {
  if (!_sessionManager && projectRoot) {
    _sessionManager = new SessionManager(projectRoot);
  }
  if (!_sessionManager) {
    throw new Error('SessionManager not initialized. Provide projectRoot.');
  }
  return _sessionManager;
}

export function resetSessionManager(): void {
  if (_sessionManager) {
    _sessionManager.endAllSessions();
  }
  _sessionManager = null;
}

// ============================================================================
// CLI Entry Point (for status check)
// ============================================================================

if (require.main === module) {
  const projectRoot = process.cwd();
  const manager = new SessionManager(projectRoot);
  const status = manager.getAuthStatus();

  console.log('\nBMAD Authentication Status');
  console.log('=' .repeat(40));
  console.log(`Key exists:      ${status.keyExists ? 'Yes' : 'No'}`);
  console.log(`Token exists:    ${status.tokenExists ? 'Yes' : 'No'}`);
  console.log(`Token valid:     ${status.tokenValid ? 'Yes' : 'No'}`);

  if (status.tokenValid) {
    console.log(`User:            ${status.userName}`);
    console.log(`Expires:         ${status.expiresAt?.toISOString()}`);
    console.log(`Hours remaining: ${status.hoursUntilExpiry?.toFixed(1)}`);
  }

  const message = manager.getAuthStatusMessage();
  if (message) {
    console.log(message);
  }
}
