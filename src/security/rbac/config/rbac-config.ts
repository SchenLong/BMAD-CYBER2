/**
 * RBAC Core Configuration
 * Version: 1.0.0
 * Status: Production Ready
 */

export interface RBACConfig {
  version: string;
  enabled: boolean;
  strictMode: boolean;
  cacheEnabled: boolean;
  auditEnabled: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
}

export const rbacConfig: RBACConfig = {
  version: "1.0.0",
  enabled: true,
  strictMode: true,
  cacheEnabled: true, 
  auditEnabled: true,
  sessionTimeout: 3600000, // 1 hour
  maxLoginAttempts: 5
};

export default rbacConfig;
