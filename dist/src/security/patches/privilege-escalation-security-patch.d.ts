#!/usr/bin/env node
export class PrivilegeEscalationProtection {
    privilegeHierarchy: {
        GUEST: number;
        USER: number;
        ANALYST: number;
        SECURITY_ADMIN: number;
        ABDUL_MASTER: number;
        ABDUL_MASTER_CONTROL: number;
    };
    trustedRoles: Set<string>;
    securityKey: string;
    auditLog: any[];
    generateSecurityKey(): string;
    /**
     * Enhanced privilege validation with cryptographic verification
     */
    validatePrivilegeEscalation(currentRole: any, requestedRole: any, authToken?: null): {
        success: boolean;
        reason: string;
        sessionToken?: never;
    } | {
        success: boolean;
        reason: string;
        sessionToken: string;
    };
    validateAuthToken(token: any): boolean;
    validateSecurityAdminEscalation(currentRole: any, authToken: any): boolean;
    checkTrustedRoleApproval(authToken: any): boolean;
    generateSessionToken(role: any): string;
    triggerSecurityAlert(alertType: any, details: any): void;
    getAuditLog(): any[];
    generateSecurityReport(): {
        timestamp: string;
        totalAttempts: number;
        successfulEscalations: number;
        blockedAttempts: number;
        criticalAlerts: number;
        auditTrail: any[];
    };
}
/**
 * Deployment function for privilege escalation protection
 */
export function deployPrivilegeEscalationPatch(): PrivilegeEscalationProtection;
//# sourceMappingURL=privilege-escalation-security-patch.d.ts.map