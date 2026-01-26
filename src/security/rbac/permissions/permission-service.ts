/**
 * Permission Service
 * Core service for permission management and validation
 */

import { Permission, PermissionType } from "./permission-types";
import { PERMISSION_MANIFESTS } from "./permission-manifests";

export class PermissionService {
  private permissionCache: Map<string, Permission> = new Map();

  constructor() {
    this.initializePermissions();
  }

  private initializePermissions(): void {
    Object.values(PERMISSION_MANIFESTS).forEach(manifest => {
      manifest.forEach(permission => {
        this.permissionCache.set(permission.id, permission);
      });
    });
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
   * Check if permission exists
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
}

export const permissionService = new PermissionService();
export default permissionService;
