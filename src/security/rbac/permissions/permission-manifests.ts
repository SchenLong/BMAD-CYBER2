/**
 * Permission Manifests 
 * Defines the 9 core permission manifests
 */

import { Permission, PermissionType } from "./permission-types";

export const PERMISSION_MANIFESTS: Record<string, Permission[]> = {

  // 1. User Management
  USER_MANAGEMENT: [
    {
      id: "user.read",
      type: PermissionType.READ,
      resource: "users",
      description: "View user profiles and basic information"
    },
    {
      id: "user.write", 
      type: PermissionType.WRITE,
      resource: "users",
      description: "Create, update, delete user accounts"
    },
    {
      id: "user.admin",
      type: PermissionType.ADMIN,
      resource: "users", 
      description: "Full administrative control over users"
    }
  ],

  // 2. Data Access
  DATA_ACCESS: [
    {
      id: "data.read",
      type: PermissionType.READ,
      resource: "data_streams",
      description: "View personal health data and metrics"
    },
    {
      id: "data.write",
      type: PermissionType.WRITE, 
      resource: "data_streams",
      description: "Create and modify health data"
    },
    {
      id: "data.admin",
      type: PermissionType.ADMIN,
      resource: "data_streams",
      description: "Full control over all data streams"
    }
  ],

  // 3. System Configuration  
  SYSTEM_CONFIG: [
    {
      id: "system.read",
      type: PermissionType.READ,
      resource: "system",
      description: "View system configuration and settings"
    },
    {
      id: "system.write",
      type: PermissionType.WRITE,
      resource: "system", 
      description: "Modify system configuration"
    },
    {
      id: "system.execute",
      type: PermissionType.EXECUTE,
      resource: "system",
      description: "Execute system operations and maintenance"
    }
  ],

  // 4. Security Controls
  SECURITY_CONTROLS: [
    {
      id: "security.read", 
      type: PermissionType.READ,
      resource: "security",
      description: "View security logs and audit trails"
    },
    {
      id: "security.admin",
      type: PermissionType.ADMIN,
      resource: "security",
      description: "Full security administration access"
    }
  ],

  // 5. API Access
  API_ACCESS: [
    {
      id: "api.read",
      type: PermissionType.READ,
      resource: "api",
      description: "Read-only API access"
    },
    {
      id: "api.write", 
      type: PermissionType.WRITE,
      resource: "api",
      description: "Write API access for data modification"
    },
    {
      id: "api.execute",
      type: PermissionType.EXECUTE,
      resource: "api", 
      description: "Execute API operations and integrations"
    }
  ],

  // 6. Reports and Analytics
  REPORTS_ANALYTICS: [
    {
      id: "reports.read",
      type: PermissionType.READ,
      resource: "reports",
      description: "View reports and analytics dashboards"
    },
    {
      id: "reports.execute",
      type: PermissionType.EXECUTE,
      resource: "reports",
      description: "Generate and export reports"
    }
  ],

  // 7. Integrations
  INTEGRATIONS: [
    {
      id: "integrations.read",
      type: PermissionType.READ, 
      resource: "integrations",
      description: "View connected services and integrations"
    },
    {
      id: "integrations.write",
      type: PermissionType.WRITE,
      resource: "integrations",
      description: "Connect and configure integrations"
    },
    {
      id: "integrations.admin", 
      type: PermissionType.ADMIN,
      resource: "integrations",
      description: "Full administrative control over integrations"
    }
  ],

  // 8. Audit and Compliance
  AUDIT_COMPLIANCE: [
    {
      id: "audit.read",
      type: PermissionType.READ,
      resource: "audit",
      description: "View audit logs and compliance reports"
    },
    {
      id: "audit.execute",
      type: PermissionType.EXECUTE, 
      resource: "audit",
      description: "Execute audit procedures and compliance checks"
    }
  ],

  // 9. Emergency Access
  EMERGENCY_ACCESS: [
    {
      id: "emergency.execute",
      type: PermissionType.EXECUTE,
      resource: "emergency",
      description: "Emergency system access and operations"
    },
    {
      id: "emergency.admin",
      type: PermissionType.ADMIN,
      resource: "emergency", 
      description: "Emergency administrative override access"
    }
  ]

};

export default PERMISSION_MANIFESTS;
