/**
 * BMAD Authorization Module
 *
 * Implements Role-Based Access Control (RBAC) for the BMAD framework.
 * Checks permissions for agents, workflows, and modules based on user roles.
 *
 * Part of Phase 2 Security Implementation.
 */
export interface Permission {
    agents: string[];
    workflows: string[];
    modules: string[];
    actions: string[];
}
export interface RoleRequirements {
    credential_verification?: boolean;
}
export interface RoleRestrictions {
    session_timeout_minutes?: number;
    max_requests_per_hour?: number;
}
export interface RoleSpecial {
    privileged?: boolean;
}
export interface Role {
    description: string;
    inherits: string[];
    permissions: Permission;
    requires?: RoleRequirements;
    restrictions?: RoleRestrictions;
    special?: RoleSpecial;
}
export interface ModuleRestriction {
    description: string;
    require_roles: string[];
    require_credential_verification?: boolean;
    privileged?: boolean;
    audit_level?: string;
    warning_message?: string;
}
export interface WorkflowRestriction {
    description: string;
    require_roles: string[];
    require_approval?: boolean;
    require_credential_verification?: boolean;
    audit_level?: string;
    warning_message?: string;
}
export interface AgentRestriction {
    description: string;
    require_roles: string[];
    require_credential_verification?: boolean;
    warning_message?: string;
}
export interface RBACConfig {
    enabled: boolean;
    default_role: string;
    deny_by_default: boolean;
    roles: Record<string, Role>;
    module_restrictions: Record<string, ModuleRestriction>;
    workflow_restrictions: Record<string, WorkflowRestriction>;
    agent_restrictions?: Record<string, AgentRestriction>;
}
export interface AuthorizationResult {
    allowed: boolean;
    reason?: string;
    warning?: string;
    requires_approval?: boolean;
    audit_level?: string;
}
export interface UserContext {
    userId: string;
    userName: string;
    roles: string[];
    modules: string[];
    credentialVerified?: boolean;
}
export declare class AuthorizationManager {
    private config;
    private resolvedRoles;
    private resolutionInProgress;
    constructor(configPath: string);
    /**
     * Check if RBAC is enabled
     */
    isEnabled(): boolean;
    /**
     * Pre-resolve all role inheritances
     */
    private resolveAllRoles;
    /**
     * Resolve a role including all inherited permissions
     */
    private resolveRole;
    /**
     * Merge two permission sets (union)
     */
    private mergePermissions;
    /**
     * Check if a value matches any pattern in the list
     */
    private matchesPattern;
    /**
     * Get effective permissions for a user based on their roles
     */
    getEffectivePermissions(userRoles: string[]): Permission;
    /**
     * Check if user can access a module
     */
    canAccessModule(user: UserContext, moduleName: string): AuthorizationResult;
    /**
     * Check if user can access an agent
     */
    canAccessAgent(user: UserContext, agentPath: string): AuthorizationResult;
    /**
     * Check if user can execute a workflow
     */
    canExecuteWorkflow(user: UserContext, workflowName: string): AuthorizationResult;
    /**
     * Check if user has a specific action permission
     */
    canPerformAction(user: UserContext, action: string): boolean;
    /**
     * Check if user has a specific role
     */
    hasRole(user: UserContext, requiredRole: string): boolean;
    /**
     * Get list of all roles
     */
    getAllRoles(): string[];
    /**
     * Get role details
     */
    getRoleDetails(roleName: string): Role | undefined;
    /**
     * Get default role
     */
    getDefaultRole(): string;
    /**
     * Format denial message for user display
     */
    formatDenialMessage(result: AuthorizationResult, resourceType: string, resourceName: string): string;
    /**
     * Format approval required message
     */
    formatApprovalMessage(resourceType: string, resourceName: string, warning?: string): string;
    /**
     * Word wrap text to specified width
     */
    private wrapText;
}
export declare function getAuthorizationManager(configPath?: string): AuthorizationManager;
export declare function resetAuthorizationManager(): void;
//# sourceMappingURL=authorization.d.ts.map