/**
 * BMAD Segregation of Duties (SoD) Enforcement
 *
 * Implements conflict detection and enforcement for role combinations
 * that violate separation of duties principles.
 *
 * Compliance: SOC 2 CC6.1, ISO 27001 A.9.2.3
 *
 * Fixes: SOD-001, SOD-002
 */

// =============================================================================
// Types
// =============================================================================

export interface SoDConflict {
  role1: string;
  role2: string;
  reason: string;
  severity: 'critical' | 'high' | 'medium';
  requiresDualApproval: boolean;
}

export interface SoDValidationResult {
  valid: boolean;
  conflicts: SoDConflict[];
  warnings: string[];
}

export interface SoDOverride {
  roles: string[];
  approvedBy: string[];
  reason: string;
  expiresAt: Date;
  createdAt: Date;
}

// =============================================================================
// SoD Conflict Matrix
// =============================================================================

/**
 * Defines conflicting role pairs that should not be assigned together.
 * Based on regulatory requirements and security best practices.
 */
const SOD_CONFLICT_MATRIX: SoDConflict[] = [
  // Admin vs Auditor - prevents self-audit
  {
    role1: 'admin',
    role2: 'auditor',
    reason: 'Administrator cannot audit their own actions',
    severity: 'critical',
    requiresDualApproval: true,
  },
  // Developer vs Deployer - prevents unauthorized deployments
  {
    role1: 'developer',
    role2: 'deployer',
    reason: 'Developers should not deploy their own code to production',
    severity: 'high',
    requiresDualApproval: true,
  },
  // Security Config vs Security Audit
  {
    role1: 'security_admin',
    role2: 'security_auditor',
    reason: 'Security configuration cannot be audited by the same person',
    severity: 'critical',
    requiresDualApproval: true,
  },
  // Token Generator vs Token Auditor
  {
    role1: 'token_admin',
    role2: 'token_auditor',
    reason: 'Token administrator cannot audit token usage',
    severity: 'high',
    requiresDualApproval: true,
  },
  // Data Owner vs Data Processor (GDPR)
  {
    role1: 'data_owner',
    role2: 'data_processor',
    reason: 'Data ownership and processing should be separated (GDPR)',
    severity: 'medium',
    requiresDualApproval: false,
  },
  // Intel Collector vs Intel Analyst (optional - can be same person)
  // Not included by default but can be added for stricter environments
];

// =============================================================================
// SoD Enforcement Service
// =============================================================================

export class SegregationOfDutiesService {
  private overrides: Map<string, SoDOverride> = new Map();
  private conflictMatrix: SoDConflict[];

  constructor(customConflicts?: SoDConflict[]) {
    this.conflictMatrix = customConflicts || SOD_CONFLICT_MATRIX;
  }

  /**
   * Validate a set of roles for SoD conflicts
   */
  validateRoles(roles: string[]): SoDValidationResult {
    const conflicts: SoDConflict[] = [];
    const warnings: string[] = [];
    const roleSet = new Set(roles.map(r => r.toLowerCase()));

    // Check each pair in the conflict matrix
    for (const conflict of this.conflictMatrix) {
      const hasRole1 = roleSet.has(conflict.role1.toLowerCase());
      const hasRole2 = roleSet.has(conflict.role2.toLowerCase());

      if (hasRole1 && hasRole2) {
        // Check for approved override
        const overrideKey = this.getOverrideKey(roles);
        const override = this.overrides.get(overrideKey);

        if (override && override.expiresAt > new Date()) {
          warnings.push(
            `SoD conflict between ${conflict.role1} and ${conflict.role2} ` +
            `is overridden until ${override.expiresAt.toISOString()} ` +
            `(approved by: ${override.approvedBy.join(', ')})`
          );
        } else {
          conflicts.push(conflict);
        }
      }
    }

    // Special check: admin role bypasses all SoD by design (SOD-002)
    // But we still warn about it
    if (roleSet.has('admin') && conflicts.length > 0) {
      warnings.push(
        'WARNING: Admin role detected with SoD conflicts. ' +
        'Admin can override SoD but all actions will be heavily logged.'
      );
    }

    return {
      valid: conflicts.length === 0,
      conflicts,
      warnings,
    };
  }

  /**
   * Check if a role assignment would create SoD conflicts
   */
  canAssignRole(currentRoles: string[], newRole: string): SoDValidationResult {
    return this.validateRoles([...currentRoles, newRole]);
  }

  /**
   * Register an approved SoD override (requires dual approval)
   */
  registerOverride(
    roles: string[],
    approvers: string[],
    reason: string,
    durationHours: number = 24
  ): boolean {
    // Require at least 2 approvers for dual approval
    if (approvers.length < 2) {
      console.error('[SOD] Override rejected: requires dual approval (2+ approvers)');
      return false;
    }

    // Maximum override duration is 7 days
    const maxDurationHours = 24 * 7;
    const actualDuration = Math.min(durationHours, maxDurationHours);

    const override: SoDOverride = {
      roles: roles.sort(),
      approvedBy: approvers,
      reason,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + actualDuration * 60 * 60 * 1000),
    };

    const key = this.getOverrideKey(roles);
    this.overrides.set(key, override);

    // Log the override for audit
    console.log(`[SOD] Override registered:`);
    console.log(`  Roles: ${roles.join(', ')}`);
    console.log(`  Approvers: ${approvers.join(', ')}`);
    console.log(`  Reason: ${reason}`);
    console.log(`  Expires: ${override.expiresAt.toISOString()}`);

    return true;
  }

  /**
   * Revoke an existing override
   */
  revokeOverride(roles: string[]): boolean {
    const key = this.getOverrideKey(roles);
    if (this.overrides.has(key)) {
      this.overrides.delete(key);
      console.log(`[SOD] Override revoked for roles: ${roles.join(', ')}`);
      return true;
    }
    return false;
  }

  /**
   * Get all active overrides
   */
  getActiveOverrides(): SoDOverride[] {
    const now = new Date();
    const active: SoDOverride[] = [];

    for (const override of this.overrides.values()) {
      if (override.expiresAt > now) {
        active.push(override);
      }
    }

    return active;
  }

  /**
   * Clean up expired overrides
   */
  cleanupExpiredOverrides(): number {
    const now = new Date();
    let cleaned = 0;

    for (const [key, override] of this.overrides.entries()) {
      if (override.expiresAt <= now) {
        this.overrides.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[SOD] Cleaned up ${cleaned} expired overrides`);
    }

    return cleaned;
  }

  /**
   * Get the full conflict matrix
   */
  getConflictMatrix(): SoDConflict[] {
    return [...this.conflictMatrix];
  }

  /**
   * Add a custom conflict to the matrix
   */
  addConflict(conflict: SoDConflict): void {
    // Check if conflict already exists
    const exists = this.conflictMatrix.some(
      c => (c.role1 === conflict.role1 && c.role2 === conflict.role2) ||
           (c.role1 === conflict.role2 && c.role2 === conflict.role1)
    );

    if (!exists) {
      this.conflictMatrix.push(conflict);
      console.log(`[SOD] Added conflict: ${conflict.role1} <-> ${conflict.role2}`);
    }
  }

  /**
   * Generate a unique key for role combination
   */
  private getOverrideKey(roles: string[]): string {
    return roles.map(r => r.toLowerCase()).sort().join(':');
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let _sodService: SegregationOfDutiesService | null = null;

export function getSoDService(): SegregationOfDutiesService {
  if (!_sodService) {
    _sodService = new SegregationOfDutiesService();
  }
  return _sodService;
}

export function resetSoDService(): void {
  _sodService = null;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Quick validation helper
 */
export function validateSoD(roles: string[]): SoDValidationResult {
  return getSoDService().validateRoles(roles);
}

/**
 * Check if role assignment is allowed
 */
export function canAssignRole(currentRoles: string[], newRole: string): boolean {
  const result = getSoDService().canAssignRole(currentRoles, newRole);
  return result.valid;
}
