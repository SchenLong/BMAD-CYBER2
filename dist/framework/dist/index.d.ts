export function initializeFramework(config?: {}): {
    enableValidation: boolean;
    enableAuditLogging: boolean;
    enableRBAC: boolean;
    logLevel: string;
    outputPath: string;
};
export * from "./validators/index.js";
export * from "./hooks/index.js";
export * from "./scripts/index.js";
export * from "./auth/index.js";
export * from "./audit/index.js";
export * from "./exports/index.js";
export const FRAMEWORK_VERSION: "1.0.0";
export const FRAMEWORK_NAME: "BMAD-CYBER2";
//# sourceMappingURL=index.d.ts.map