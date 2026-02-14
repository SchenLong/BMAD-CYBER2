/**
 * Permission Service
 * Core service for permission management, validation, and enforcement
 *
 * Security Fixes Applied:
 * - PERM-001: Permission enforcement for resource access
 * - PERM-002: Permission validation before operations
 * - PERM-003: Authorization checks with role-based context
 */

import { Permission, PermissionConstraint, PermissionType } from "./permission-types";
import { PERMISSION_MANIFESTS } from "./permission-manifests";

/**
 * Result of a permission enforcement check
 */
export interface PermissionCheckResult {
  allowed: boolean;
  permission?: Permission;
  denialReason?: string;
  constraintsFailed?: PermissionConstraint[];
}

/**
 * Context for permission checks - includes user identity and session info
 */
export interface PermissionContext {
  userId: string;
  roles: string[];
  permissions: string[];  // Explicit permission IDs granted to user
  sessionId?: string;
  ipAddress?: string;
  timestamp?: Date;
}

/**
 * Audit log entry for permission checks
 */
export interface PermissionAuditEntry {
  timestamp: Date;
  userId: string;
  permissionId: string;
  resource: string;
  action: PermissionType;
  allowed: boolean;
  denialReason?: string;
  sessionId?: string;
  ipAddress?: string;
}

export class PermissionService {
  private permissionCache: Map<string, Permission> = new Map();
  private rolePermissions: Map<string, Set<string>> = new Map();  // role -> permission IDs
  private auditLog: PermissionAuditEntry[] = [];
  private maxAuditLogSize = 1000;

  constructor() {
    this.initializePermissions();
    this.initializeRolePermissions();
  }

  private initializePermissions(): void {
    Object.values(PERMISSION_MANIFESTS).forEach(manifest => {
      manifest.forEach(permission => {
        this.permissionCache.set(permission.id, permission);
      });
    });
  }

  /**
   * Initialize default role-to-permission mappings
   */
  private initializeRolePermissions(): void {
    // Admin role has all permissions
    this.rolePermissions.set('admin', new Set(this.permissionCache.keys()));

    // Developer role permissions
    this.rolePermissions.set('developer', new Set([
      'data.read', 'data.write',
      'system.read',
      'api.read', 'api.write', 'api.execute',
      'reports.read', 'reports.execute',
      'integrations.read', 'integrations.write'
    ]));

    // Operator role permissions
    this.rolePermissions.set('operator', new Set([
      'data.read',
      'system.read',
      'security.read',
      'api.read',
      'reports.read',
      'audit.read'
    ]));

    // User role permissions (basic)
    this.rolePermissions.set('user', new Set([
      'data.read', 'data.write',
      'api.read',
      'reports.read'
    ]));

    // Guest role (minimal permissions)
    this.rolePermissions.set('guest', new Set([
      'data.read'
    ]));
  }

  /**
   * Get permission by ID
   */
  getPermission(permissionId: string): Permission | undefined {
    return this.permissionCache.get(permissionId);
  }

  /**
   * Get all permissions for a resource
   */
  getPermissionsByResource(resource: string): Permission[] {
    return Array.from(this.permissionCache.values())
      .filter(permission => permission.resource === resource);
  }

  /**
   * Get permissions by type
   */
  getPermissionsByType(type: PermissionType): Permission[] {
    return Array.from(this.permissionCache.values())
      .filter(permission => permission.type === type);
  }

  /**
   * Check if permission exists in the system
   */
  hasPermission(permissionId: string): boolean {
    return this.permissionCache.has(permissionId);
  }

  /**
   * Get all permission IDs
   */
  getAllPermissionIds(): string[] {
    return Array.from(this.permissionCache.keys());
  }

  /**
   * Get all permissions
   */
  getAllPermissions(): Permission[] {
    return Array.from(this.permissionCache.values());
  }

  // ============================================================================
  // PERMISSION ENFORCEMENT (PERM-001, PERM-002, PERM-003)
  // ============================================================================

  /**
   * PERM-001: Enforce permission for resource access
   * Checks if the given context allows access to a specific permission
   *
   * @param context - User context including roles and explicit permissions
   * @param permissionId - The permission ID to check (e.g., "data.read")
   * @returns PermissionCheckResult with allowed status and details
   */
  enforcePermission(context: PermissionContext, permissionId: string): PermissionCheckResult {
    const permission = this.getPermission(permissionId);

    // Check if permission exists
    if (!permission) {
      const result: PermissionCheckResult = {
        allowed: false,
        denialReason: `Unknown permission: ${permissionId}`
      };
      this.logAudit(context, permissionId, 'unknown', PermissionType.READ, false, result.denialReason);
      return result;
    }

    // Check explicit user permissions first
    if (context.permissions.includes(permissionId)) {
      const result: PermissionCheckResult = { allowed: true, permission };
      this.logAudit(context, permissionId, permission.resource, permission.type, true);
      return result;
    }

    // Check role-based permissions
    for (const role of context.roles) {
      const rolePerms = this.rolePermissions.get(role);
      if (rolePerms && rolePerms.has(permissionId)) {
        // Check constraints if any
        const constraintResult = this.checkConstraints(permission, context);
        if (constraintResult.allowed) {
          this.logAudit(context, permissionId, permission.resource, permission.type, true);
          return { allowed: true, permission };
        } else {
          this.logAudit(context, permissionId, permission.resource, permission.type, false, constraintResult.denialReason);
          return constraintResult;
        }
      }
    }

    // Permission denied
    const result: PermissionCheckResult = {
      allowed: false,
      permission,
      denialReason: `User ${context.userId} lacks permission ${permissionId}. Required roles: ${this.getRolesForPermission(permissionId).join(', ')}`
    };
    this.logAudit(context, permissionId, permission.resource, permission.type, false, result.denialReason);
    return result;
  }

  /**
   * PERM-002: Validate permission before operation
   * Throws an error if permission is denied (for use in guards/middleware)
   *
   * @param context - User context
   * @param permissionId - Permission to validate
   * @throws Error if permission is denied
   */
  validatePermission(context: PermissionContext, permissionId: string): void {
    const result = this.enforcePermission(context, permissionId);
    if (!result.allowed) {
      throw new Error(`Permission denied: ${result.denialReason}`);
    }
  }

  /**
   * PERM-003: Check authorization for resource and action
   * Higher-level check that derives permission from resource and action type
   *
   * @param context - User context
   * @param resource - Resource name (e.g., "users", "data_streams")
   * @param action - Action type (read, write, admin, execute)
   * @returns PermissionCheckResult
   */
  checkAuthorization(
    context: PermissionContext,
    resource: string,
    action: PermissionType
  ): PermissionCheckResult {
    // Derive permission ID from resource and action
    const permissionId = `${resource}.${action}`;

    // Try exact match first
    if (this.hasPermission(permissionId)) {
      return this.enforcePermission(context, permissionId);
    }

    // Try resource-based lookup
    const resourcePermissions = this.getPermissionsByResource(resource);
    const matchingPermission = resourcePermissions.find(p => p.type === action);

    if (matchingPermission) {
      return this.enforcePermission(context, matchingPermission.id);
    }

    // No matching permission found
    const result: PermissionCheckResult = {
      allowed: false,
      denialReason: `No permission defined for ${action} on ${resource}`
    };
    this.logAudit(context, permissionId, resource, action, false, result.denialReason);
    return result;
  }

  /**
   * Check if context has any of the required permissions
   */
  hasAnyPermission(context: PermissionContext, permissionIds: string[]): boolean {
    return permissionIds.some(id => this.enforcePermission(context, id).allowed);
  }

  /**
   * Check if context has all required permissions
   */
  hasAllPermissions(context: PermissionContext, permissionIds: string[]): boolean {
    return permissionIds.every(id => this.enforcePermission(context, id).allowed);
  }

  /**
   * Get all effective permissions for a context (based on roles)
   */
  getEffectivePermissions(context: PermissionContext): string[] {
    const effective = new Set<string>(context.permissions);

    for (const role of context.roles) {
      const rolePerms = this.rolePermissions.get(role);
      if (rolePerms) {
        rolePerms.forEach(perm => effective.add(perm));
      }
    }

    return Array.from(effective);
  }

  /**
   * Get roles that grant a specific permission
   */
  getRolesForPermission(permissionId: string): string[] {
    const roles: string[] = [];
    this.rolePermissions.forEach((perms, role) => {
      if (perms.has(permissionId)) {
        roles.push(role);
      }
    });
    return roles;
  }

  // ============================================================================
  // CONSTRAINT CHECKING
  // ============================================================================

  /**
   * Check permission constraints against context
   */
  private checkConstraints(permission: Permission, context: PermissionContext): PermissionCheckResult {
    if (!permission.constraints || permission.constraints.length === 0) {
      return { allowed: true, permission };
    }

    const failedConstraints: PermissionConstraint[] = [];

    for (const constraint of permission.constraints) {
      if (!this.evaluateConstraint(constraint, context)) {
        failedConstraints.push(constraint);
      }
    }

    if (failedConstraints.length > 0) {
      return {
        allowed: false,
        permission,
        denialReason: `Constraint check failed: ${failedConstraints.map(c => c.type).join(', ')}`,
        constraintsFailed: failedConstraints
      };
    }

    return { allowed: true, permission };
  }

  /**
   * Evaluate a single constraint
   */
  private evaluateConstraint(constraint: PermissionConstraint, context: PermissionContext): boolean {
    switch (constraint.type) {
      case 'time':
        return this.evaluateTimeConstraint(constraint, context.timestamp || new Date());
      case 'location':
        return this.evaluateLocationConstraint(constraint, context.ipAddress);
      case 'condition':
        return this.evaluateConditionConstraint(constraint, context);
      default:
        return true;  // Unknown constraint types pass by default
    }
  }

  private evaluateTimeConstraint(constraint: PermissionConstraint, timestamp: Date): boolean {
    const hour = timestamp.getHours();
    switch (constraint.operator) {
      case 'gt': return hour > constraint.value;
      case 'lt': return hour < constraint.value;
      case 'eq': return hour === constraint.value;
      case 'in': return Array.isArray(constraint.value) && constraint.value.includes(hour);
      default: return true;
    }
  }

  private evaluateLocationConstraint(constraint: PermissionConstraint, ipAddress?: string): boolean {
    if (!ipAddress) return true;  // No IP = local access = allowed
    switch (constraint.operator) {
      case 'eq': return ipAddress === constraint.value;
      case 'ne': return ipAddress !== constraint.value;
      case 'in': return Array.isArray(constraint.value) && constraint.value.includes(ipAddress);
      case 'not_in': return !Array.isArray(constraint.value) || !constraint.value.includes(ipAddress);
      default: return true;
    }
  }

  private evaluateConditionConstraint(_constraint: PermissionConstraint, _context: PermissionContext): boolean {
    // Custom condition evaluation - can be extended based on needs
    // For now, pass through
    return true;
  }

  // ============================================================================
  // AUDIT LOGGING
  // ============================================================================

  /**
   * Log permission check to audit trail
   */
  private logAudit(
    context: PermissionContext,
    permissionId: string,
    resource: string,
    action: PermissionType,
    allowed: boolean,
    denialReason?: string
  ): void {
    const entry: PermissionAuditEntry = {
      timestamp: new Date(),
      userId: context.userId,
      permissionId,
      resource,
      action,
      allowed,
      ...(denialReason !== undefined && { denialReason }),
      ...(context.sessionId !== undefined && { sessionId: context.sessionId }),
      ...(context.ipAddress !== undefined && { ipAddress: context.ipAddress })
    };

    this.auditLog.push(entry);

    // Keep audit log size bounded
    if (this.auditLog.length > this.maxAuditLogSize) {
      this.auditLog = this.auditLog.slice(-this.maxAuditLogSize);
    }

    // Log denied attempts to console for visibility
    if (!allowed) {
      console.warn(`[SECURITY] Permission denied: ${permissionId} for user ${context.userId}. Reason: ${denialReason}`);
    }
  }

  /**
   * Get recent audit log entries
   */
  getAuditLog(limit: number = 100): PermissionAuditEntry[] {
    return this.auditLog.slice(-limit);
  }

  /**
   * Get denied permission attempts (for security monitoring)
   */
  getDeniedAttempts(limit: number = 50): PermissionAuditEntry[] {
    return this.auditLog
      .filter(entry => !entry.allowed)
      .slice(-limit);
  }

  /**
   * Clear audit log (for testing or maintenance)
   */
  clearAuditLog(): void {
    this.auditLog = [];
  }

  // ============================================================================
  // ROLE MANAGEMENT
  // ============================================================================

  /**
   * Add permissions to a role
   */
  addRolePermissions(role: string, permissionIds: string[]): void {
    const rolePerms = this.rolePermissions.get(role) || new Set();
    permissionIds.forEach(id => {
      if (this.hasPermission(id)) {
        rolePerms.add(id);
      }
    });
    this.rolePermissions.set(role, rolePerms);
  }

  /**
   * Remove permissions from a role
   */
  removeRolePermissions(role: string, permissionIds: string[]): void {
    const rolePerms = this.rolePermissions.get(role);
    if (rolePerms) {
      permissionIds.forEach(id => rolePerms.delete(id));
    }
  }

  /**
   * Get all permissions for a role
   */
  getRolePermissions(role: string): string[] {
    const perms = this.rolePermissions.get(role);
    return perms ? Array.from(perms) : [];
  }
}

export const permissionService = new PermissionService();
export default permissionService;
