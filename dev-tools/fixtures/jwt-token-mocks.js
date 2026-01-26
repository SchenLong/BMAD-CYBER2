/**
 * JWT Token Mocks for Cross-Module Authentication
 * EPIC 1.2: Integration Test Repair
 * Mock implementation of JWT for testing cross-module communication
 */

import crypto from 'crypto';

/**
 * Mock JWT Token Manager for Testing
 * Simulates JWT token creation, validation, and expiration
 */
export class JWTTokenMocks {
  constructor() {
    this.secretKey = 'bmad-test-secret-key-2024';
    this.tokenStore = new Map();
    this.defaultExpirationTime = 5 * 60 * 1000; // 5 minutes
    this.issuer = 'BMAD-CYBER2-Test';

    // Module permissions matrix
    this.modulePermissions = {
      'intel-team': {
        canAccess: ['legal-team', 'strategy-team', 'cybersec-team'],
        workflows: ['threat-assessment', 'intelligence-consultation'],
        accessLevel: 'cross-team'
      },
      'legal-team': {
        canAccess: ['intel-team', 'strategy-team', 'cybersec-team'],
        workflows: ['legal-matter-intake', 'compliance-review'],
        accessLevel: 'cross-team'
      },
      'strategy-team': {
        canAccess: ['intel-team', 'legal-team', 'cybersec-team'],
        workflows: ['strategic-planning', 'policy-development'],
        accessLevel: 'cross-team'
      },
      'cybersec-team': {
        canAccess: ['intel-team', 'legal-team', 'strategy-team'],
        workflows: ['incident-response', 'security-assessment'],
        accessLevel: 'cross-team'
      },
      'bmm': {
        canAccess: ['intel-team', 'legal-team', 'strategy-team', 'cybersec-team'],
        workflows: ['project-management', 'workflow-orchestration'],
        accessLevel: 'orchestrator'
      },
      'bmgd': {
        canAccess: ['intel-team', 'legal-team', 'strategy-team', 'cybersec-team'],
        workflows: ['game-design', 'narrative-development'],
        accessLevel: 'content-creator'
      }
    };
  }

  /**
   * Generate a mock JWT token for module-to-module authentication
   */
  generateToken(sourceModule, targetModule, permissions = {}) {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Date.now();
    const payload = {
      iss: this.issuer,
      sub: sourceModule,
      aud: targetModule,
      iat: Math.floor(now / 1000),
      exp: Math.floor((now + this.defaultExpirationTime) / 1000),
      jti: this.generateJTI(),

      // Custom BMAD claims
      source_module: sourceModule,
      target_module: targetModule,
      access_level: this.getAccessLevel(sourceModule, targetModule),
      permissions: {
        workflows: this.getWorkflowPermissions(sourceModule, targetModule),
        agents: this.getAgentPermissions(sourceModule, targetModule),
        ...permissions
      },
      session_id: this.generateSessionId(),
      version: '2.0.0'
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = this.generateSignature(encodedHeader, encodedPayload);

    const token = `${encodedHeader}.${encodedPayload}.${signature}`;

    // Store token for validation
    this.tokenStore.set(payload.jti, {
      token,
      payload,
      created: now,
      valid: true
    });

    return token;
  }

  /**
   * Validate a JWT token
   */
  validateToken(token) {
    try {
      if (!token) {
        return { valid: false, error: 'Token is required' };
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' };
      }

      const [encodedHeader, encodedPayload, receivedSignature] = parts;

      // Verify signature
      const expectedSignature = this.generateSignature(encodedHeader, encodedPayload);
      if (receivedSignature !== expectedSignature) {
        return { valid: false, error: 'Invalid signature' };
      }

      // Decode payload
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload));

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && now >= payload.exp) {
        return { valid: false, error: 'Token expired' };
      }

      // Check if token is in store and valid
      const storedToken = this.tokenStore.get(payload.jti);
      if (!storedToken || !storedToken.valid) {
        return { valid: false, error: 'Token revoked or not found' };
      }

      // Validate permissions
      const hasPermission = this.validatePermissions(payload.source_module, payload.target_module);
      if (!hasPermission) {
        return { valid: false, error: 'Insufficient permissions' };
      }

      return {
        valid: true,
        payload,
        claims: {
          sourceModule: payload.source_module,
          targetModule: payload.target_module,
          accessLevel: payload.access_level,
          permissions: payload.permissions,
          sessionId: payload.session_id
        }
      };

    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Revoke a token
   */
  revokeToken(token) {
    try {
      const parts = token.split('.');
      const payload = JSON.parse(this.base64UrlDecode(parts[1]));
      const storedToken = this.tokenStore.get(payload.jti);

      if (storedToken) {
        storedToken.valid = false;
        storedToken.revokedAt = Date.now();
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate tokens for all valid communication paths
   */
  generateTokensForAllPaths() {
    const tokens = new Map();
    const modules = Object.keys(this.modulePermissions);

    for (const sourceModule of modules) {
      const canAccess = this.modulePermissions[sourceModule].canAccess;

      for (const targetModule of canAccess) {
        const pathKey = `${sourceModule}->${targetModule}`;
        const token = this.generateToken(sourceModule, targetModule);
        tokens.set(pathKey, token);
      }
    }

    return tokens;
  }

  /**
   * Validate cross-module permissions
   */
  validatePermissions(sourceModule, targetModule) {
    const sourcePermissions = this.modulePermissions[sourceModule];
    if (!sourcePermissions) {
      return false;
    }

    return sourcePermissions.canAccess.includes(targetModule);
  }

  /**
   * Get access level between modules
   */
  getAccessLevel(sourceModule, targetModule) {
    if (!this.validatePermissions(sourceModule, targetModule)) {
      return 'none';
    }

    const sourcePerms = this.modulePermissions[sourceModule];
    return sourcePerms.accessLevel;
  }

  /**
   * Get workflow permissions for module pair
   */
  getWorkflowPermissions(sourceModule, targetModule) {
    if (!this.validatePermissions(sourceModule, targetModule)) {
      return [];
    }

    const targetPerms = this.modulePermissions[targetModule];
    return targetPerms.workflows || [];
  }

  /**
   * Get agent permissions for module pair
   */
  getAgentPermissions(sourceModule, targetModule) {
    if (!this.validatePermissions(sourceModule, targetModule)) {
      return [];
    }

    // All agents accessible for cross-team communication
    return ['consult', 'delegate', 'collaborate'];
  }

  /**
   * Generate JWT ID
   */
  generateJTI() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return `bmad_session_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Generate HMAC signature
   */
  generateSignature(encodedHeader, encodedPayload) {
    const data = `${encodedHeader}.${encodedPayload}`;
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(data)
      .digest('base64url');
  }

  /**
   * Base64 URL encode
   */
  base64UrlEncode(str) {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Base64 URL decode
   */
  base64UrlDecode(str) {
    str += new Array(5 - str.length % 4).join('=');
    return Buffer.from(str.replace(/\-/g, '+').replace(/_/g, '/'), 'base64').toString();
  }

  /**
   * Clean up expired tokens
   */
  cleanupExpiredTokens() {
    const now = Date.now();
    let cleaned = 0;

    for (const [jti, tokenData] of this.tokenStore.entries()) {
      if (tokenData.payload.exp * 1000 < now) {
        this.tokenStore.delete(jti);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get token statistics
   */
  getTokenStats() {
    const now = Date.now();
    const tokens = Array.from(this.tokenStore.values());
    const valid = tokens.filter(t => t.valid).length;
    const expired = tokens.filter(t => t.payload.exp * 1000 < now).length;
    const revoked = tokens.filter(t => !t.valid && t.revokedAt).length;

    return {
      total: tokens.length,
      valid,
      expired,
      revoked,
      active: valid - expired
    };
  }

  /**
   * Test all 6 communication paths with authentication
   */
  async testAllAuthenticationPaths() {
    const results = [];
    const communicationPaths = [
      { source: 'intel-team', target: 'legal-team' },
      { source: 'intel-team', target: 'strategy-team' },
      { source: 'intel-team', target: 'cybersec-team' },
      { source: 'legal-team', target: 'strategy-team' },
      { source: 'legal-team', target: 'cybersec-team' },
      { source: 'strategy-team', target: 'cybersec-team' }
    ];

    for (const path of communicationPaths) {
      const pathKey = `${path.source}->${path.target}`;

      try {
        // Generate token
        const token = this.generateToken(path.source, path.target);

        // Validate token
        const validation = this.validateToken(token);

        // Test permissions
        const hasPermission = this.validatePermissions(path.source, path.target);

        results.push({
          path: pathKey,
          source: path.source,
          target: path.target,
          tokenGenerated: !!token,
          tokenValid: validation.valid,
          hasPermission,
          accessLevel: this.getAccessLevel(path.source, path.target),
          success: validation.valid && hasPermission,
          error: validation.error || null,
          token: token.substring(0, 50) + '...' // Truncated for logging
        });

      } catch (error) {
        results.push({
          path: pathKey,
          source: path.source,
          target: path.target,
          tokenGenerated: false,
          tokenValid: false,
          hasPermission: false,
          accessLevel: 'none',
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }
}

/**
 * Authorization Middleware Mock
 */
export class AuthorizationMiddleware {
  constructor(jwtManager) {
    this.jwtManager = jwtManager;
  }

  /**
   * Middleware to check module authentication
   */
  requireAuth() {
    return (req, res, next) => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Bearer token must be provided'
        });
      }

      const token = authHeader.substring(7);
      const validation = this.jwtManager.validateToken(token);

      if (!validation.valid) {
        return res.status(403).json({
          error: 'Authentication failed',
          message: validation.error
        });
      }

      req.auth = validation.claims;
      next();
    };
  }

  /**
   * Middleware to check specific permissions
   */
  requirePermissions(requiredPermissions) {
    return (req, res, next) => {
      if (!req.auth) {
        return res.status(401).json({
          error: 'Authentication required'
        });
      }

      const userPermissions = req.auth.permissions;
      const hasPermission = requiredPermissions.every(perm =>
        userPermissions.workflows?.includes(perm) ||
        userPermissions.agents?.includes(perm)
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          required: requiredPermissions,
          available: userPermissions
        });
      }

      next();
    };
  }
}

export default { JWTTokenMocks, AuthorizationMiddleware };