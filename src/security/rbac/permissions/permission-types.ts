/**
 * Permission System Types
 * Defines the 4 core permission types for RBAC
 */

export enum PermissionType {
  READ = "read",
  WRITE = "write", 
  ADMIN = "admin",
  EXECUTE = "execute"
}

export interface Permission {
  id: string;
  type: PermissionType;
  resource: string;
  description: string;
  constraints?: PermissionConstraint[];
}

export interface PermissionConstraint {
  type: "time" | "location" | "condition";
  value: any;
  operator: "eq" | "ne" | "gt" | "lt" | "in" | "not_in";
}
