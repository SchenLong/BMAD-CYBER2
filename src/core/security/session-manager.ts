/**
 * BMAD Session Manager
 *
 * Manages authenticated sessions for the BMAD framework.
 * Provides session creation, validation, and user context.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { TokenClaims, TokenGenerator } from './generate-token.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Client fingerprint for session binding (VAL-05-004-001)
 * Binds sessions to client characteristics to prevent session hijacking
 */
export interface ClientFingerprint {
  ipAddress?: string;
  userAgent?: string;
  fingerprintHash: string;  // SHA-256 hash of combined characteristics
}

export interface Session {
  id: string;
  userId: string;
  userName: string;
  email?: string | undefined;
  roles: string[];
  modules: string[];
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  clientFingerprint?: ClientFingerprint;  // Session binding (VAL-05-004-001)
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
  userId?: string | undefined;
  userName?: string | undefined;
  email?: string | undefined;
  roles?: string[] | undefined;
  modules?: string[] | undefined;
  sessionId?: string | undefined;
}

export interface AuthStatus {
  keyExists: boolean;
  tokenExists: boolean;
  tokenValid: boolean;
  expiresAt?: Date | undefined;
  hoursUntilExpiry?: number | undefined;
  userName?: string | undefined;
}

// ============================================================================
// Session Manager
// ============================================================================

export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private userSessions: Map<string, Set<string>> = new Map();  // userId -> sessionIds (VAL-05-004-002)
  private tokenGenerator: TokenGenerator | null = null;
  private config: {
    tokenPath: string;
    keyPath: string;
    timeoutMinutes: number;
    maxLifetimeHours: number;
    refreshThresholdHours: number;
    maxConcurrentSessions: number;  // VAL-05-004-002: Concurrent session limit
  };

  constructor(projectRoot: string) {
    this.config = {
      tokenPath: path.join(projectRoot, '.bmad-token'),
      keyPath: path.join(projectRoot, '.bmad-key'),
      timeoutMinutes: 480,  // 8 hours
      maxLifetimeHours: 24,
      refreshThresholdHours: 24,
      maxConcurrentSessions: 3  // VAL-05-004-002: Max 3 concurrent sessions per user
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
   * Generate client fingerprint for session binding (VAL-05-004-001)
   * Creates a hash of client characteristics to bind the session
   */
  generateClientFingerprint(ipAddress?: string, userAgent?: string): ClientFingerprint {
    // Combine available characteristics for fingerprinting
    const fingerprintData = [
      ipAddress || 'local-cli',
      userAgent || 'bmad-cli',
      // For CLI tools, add process-level identifiers as additional binding
      process.pid.toString(),
      process.ppid?.toString() || 'unknown'
    ].join('|');

    const fingerprintHash = crypto
      .createHash('sha256')
      .update(fingerprintData)
      .digest('hex');

    return {
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
      fingerprintHash
    };
  }

  /**
   * Enforce concurrent session limit for a user (VAL-05-004-002)
   * Removes oldest sessions if limit is exceeded
   */
  private enforceSessionLimit(userId: string): void {
    const userSessionIds = this.userSessions.get(userId) || new Set<string>();
    const toDelete: string[] = [];

    // Clean up expired sessions first
    userSessionIds.forEach(sessionId => {
      const session = this.sessions.get(sessionId);
      if (!session || session.expiresAt < new Date()) {
        toDelete.push(sessionId);
        if (session) this.sessions.delete(sessionId);
      }
    });
    toDelete.forEach(id => userSessionIds.delete(id));

    // If still over limit, remove oldest sessions
    while (userSessionIds.size >= this.config.maxConcurrentSessions) {
      let oldestSessionId: string | null = null;
      let oldestTime = Date.now();

      userSessionIds.forEach(sessionId => {
        const session = this.sessions.get(sessionId);
        if (session && session.createdAt.getTime() < oldestTime) {
          oldestTime = session.createdAt.getTime();
          oldestSessionId = sessionId;
        }
      });

      if (oldestSessionId) {
        console.log(`[SECURITY] Concurrent session limit reached for user ${userId}. Removing oldest session: ${oldestSessionId}`);
        userSessionIds.delete(oldestSessionId);
        this.sessions.delete(oldestSessionId);
      } else {
        break;  // Safety: prevent infinite loop
      }
    }

    this.userSessions.set(userId, userSessionIds);
  }

  /**
   * Create a new session from validated claims
   * Now includes session binding and concurrent session enforcement
   */
  private createSession(claims: TokenClaims, clientFingerprint?: ClientFingerprint): Session {
    // Enforce concurrent session limit before creating new session (VAL-05-004-002)
    this.enforceSessionLimit(claims.sub);

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
      expiresAt: new Date(now.getTime() + this.config.timeoutMinutes * 60 * 1000),
      clientFingerprint: clientFingerprint || this.generateClientFingerprint()  // VAL-05-004-001
    };

    this.sessions.set(session.id, session);

    // Track user sessions for concurrent limit enforcement (VAL-05-004-002)
    const userSessionIds = this.userSessions.get(claims.sub) || new Set();
    userSessionIds.add(session.id);
    this.userSessions.set(claims.sub, userSessionIds);

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
   * Validate session fingerprint against current client (VAL-05-004-001)
   * Returns true if fingerprint matches, false if potential session hijacking detected
   */
  validateSessionFingerprint(
    sessionId: string,
    currentIpAddress?: string,
    currentUserAgent?: string
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || !session.clientFingerprint) {
      return false;
    }

    // Generate fingerprint for current request
    const currentFingerprint = this.generateClientFingerprint(currentIpAddress, currentUserAgent);

    // Compare fingerprint hashes
    if (session.clientFingerprint.fingerprintHash !== currentFingerprint.fingerprintHash) {
      console.warn(`[SECURITY] Session fingerprint mismatch detected for session ${sessionId}`);
      console.warn(`[SECURITY] Expected: ${session.clientFingerprint.fingerprintHash.substring(0, 16)}...`);
      console.warn(`[SECURITY] Received: ${currentFingerprint.fingerprintHash.substring(0, 16)}...`);
      return false;
    }

    return true;
  }

  /**
   * Get user's concurrent session count (VAL-05-004-002)
   */
  getUserSessionCount(userId: string): number {
    const userSessionIds = this.userSessions.get(userId);
    if (!userSessionIds) return 0;

    // Clean and count valid sessions
    let validCount = 0;
    userSessionIds.forEach(sessionId => {
      const session = this.sessions.get(sessionId);
      if (session && session.expiresAt >= new Date()) {
        validCount++;
      }
    });
    return validCount;
  }

  /**
   * End session
   */
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Clean up userSessions tracking (VAL-05-004-002)
      const userSessionIds = this.userSessions.get(session.userId);
      if (userSessionIds) {
        userSessionIds.delete(sessionId);
        if (userSessionIds.size === 0) {
          this.userSessions.delete(session.userId);
        }
      }
    }
    this.sessions.delete(sessionId);
  }

  /**
   * End all sessions (e.g., on token regeneration)
   */
  endAllSessions(): void {
    this.sessions.clear();
    this.userSessions.clear();  // Clean up user session tracking (VAL-05-004-002)
  }

  /**
   * Regenerate session on privilege change (VAL-05-004-003 fix)
   * Creates a new session with updated claims while preserving user identity.
   * The old session is invalidated to prevent session fixation attacks.
   *
   * @param oldSessionId - The current session ID to regenerate
   * @param newClaims - Updated token claims with new privileges
   * @returns New session or null if old session not found
   */
  regenerateSessionOnPrivilegeChange(oldSessionId: string, newClaims: TokenClaims): Session | null {
    const oldSession = this.sessions.get(oldSessionId);
    if (!oldSession) {
      return null;
    }

    // Invalidate old session immediately
    this.sessions.delete(oldSessionId);

    // Create new session with updated claims
    const newSession = this.createSession(newClaims);

    // Log privilege change for audit trail
    console.log(`[SECURITY] Session regenerated on privilege change: ${oldSessionId} -> ${newSession.id}`);
    console.log(`[SECURITY] User: ${newClaims.name}, New roles: ${newClaims.roles.join(', ')}`);

    return newSession;
  }

  /**
   * Check if session roles have changed (utility for detecting privilege changes)
   */
  hasPrivilegeChanged(sessionId: string, newRoles: string[]): boolean {
    const session = this.getSession(sessionId);
    if (!session) return true; // No session = privilege change

    const currentRoles = new Set(session.roles);
    const updatedRoles = new Set(newRoles);

    // Check if roles differ
    if (currentRoles.size !== updatedRoles.size) return true;

    let rolesChanged = false;
    currentRoles.forEach(role => {
      if (!updatedRoles.has(role)) rolesChanged = true;
    });

    return rolesChanged;
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
║  npx ts-node src/core/security/generate-token.ts                ║
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
║  npx ts-node src/core/security/generate-token.ts                ║
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
    const expiredIds: string[] = [];
    this.sessions.forEach((session, id) => {
      if (session.expiresAt < now) {
        expiredIds.push(id);
      }
    });
    expiredIds.forEach(id => this.sessions.delete(id));
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
