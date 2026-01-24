#!/usr/bin/env node
export = MultiModuleValidator;
declare class MultiModuleValidator {
    packageRoot: string;
    config: any;
    validationResults: {
        passed: number;
        failed: number;
        warnings: number;
        details: never[];
    };
    loadConfig(): any;
    validate(): Promise<void>;
    validateSourceStructure(): Promise<void>;
    validateAgentConversions(): Promise<void>;
    validateWorkflowConversions(): Promise<void>;
    validateMetadata(): Promise<void>;
    validateInstallationReadiness(): Promise<void>;
    addResult(type: any, message: any): void;
    generateReport(): void;
}
//# sourceMappingURL=validate.d.ts.map