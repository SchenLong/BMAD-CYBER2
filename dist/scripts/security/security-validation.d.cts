#!/usr/bin/env node
export class BMAdSecurityValidator {
    results: {
        timestamp: string;
        vulnerabilities: never[];
        warnings: never[];
        passed: never[];
        summary: {};
    };
    sensitivePatterns: {
        name: string;
        pattern: RegExp;
        severity: string;
    }[];
    vulnerablePatterns: {
        name: string;
        pattern: RegExp;
        severity: string;
    }[];
    sensitiveFiles: string[];
    excludePatterns: RegExp[];
    validateRepository(rootPath?: string): Promise<{
        timestamp: string;
        vulnerabilities: never[];
        warnings: never[];
        passed: never[];
        summary: {};
    }>;
    scanForSensitiveFiles(rootPath: any): Promise<void>;
    scanForCredentials(rootPath: any): Promise<void>;
    scanForVulnerabilities(rootPath: any): Promise<void>;
    validatePermissions(rootPath: any): Promise<void>;
    checkGitIgnore(rootPath: any): Promise<void>;
    isDocumentationExample(line: any, file: any): boolean;
    getFiles(dir: any, extensions?: any[]): any;
    generateSummary(): void;
    calculateSecurityScore(): number;
    printResults(): void;
    getSeverityIcon(severity: any): "🔴" | "🟠" | "🟡" | "🔵" | "⚪";
    saveResults(rootPath: any): Promise<void>;
}
//# sourceMappingURL=security-validation.d.cts.map