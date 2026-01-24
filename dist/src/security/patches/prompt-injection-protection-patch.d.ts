#!/usr/bin/env node
export class PromptInjectionProtection {
    injectionPatterns: RegExp[];
    contextIntegrityMarkers: string[];
    emergencyKeywords: string[];
    protectionLog: any[];
    sessionKey: string;
    generateSessionKey(): string;
    /**
     * Advanced prompt injection detection and prevention
     */
    detectPromptInjection(input: any): {
        timestamp: string;
        input: string;
        threats: never[];
        riskScore: number;
        action: string;
        contextIntegrity: boolean;
        emergencyAttempt: boolean;
        recommendations: never[];
    };
    detectInjectionPatterns(input: any, analysis: any): void;
    validateContextIntegrity(input: any, analysis: any): void;
    validateEmergencyProtocols(input: any, analysis: any): void;
    validateEmergencyCryptographicSignature(input: any): boolean;
    analyzePromptStructure(input: any, analysis: any): void;
    performSemanticAnalysis(input: any, analysis: any): void;
    calculateRiskAndDecide(analysis: any): void;
    categorizePattern(index: any): "instruction-override" | "role-manipulation" | "authority-spoofing" | "system-injection" | "ai-specific-injection";
    getPatternSeverity(index: any): number;
    logSecurityEvent(analysis: any): void;
    generateProtectionReport(): {
        timestamp: string;
        totalInputs: number;
        blockedInputs: number;
        quarantinedInputs: number;
        sanitizedInputs: number;
        allowedInputs: number;
        protectionRate: string;
    };
    getProtectionLog(): any[];
}
/**
 * Deployment function for prompt injection protection
 */
export function deployPromptInjectionProtection(): PromptInjectionProtection;
//# sourceMappingURL=prompt-injection-protection-patch.d.ts.map