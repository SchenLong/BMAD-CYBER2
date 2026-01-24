/**
 * Convenience function to create hook manager with default configuration
 */
export function createHookManager(config: any): BMADHookManager;
/**
 * Hook Registry for managing custom hooks
 */
export class HookRegistry {
    hooks: Map<any, any>;
    register(event: any, handler: any): void;
    execute(event: any, context: any): Promise<void>;
    unregister(event: any, handlerName: any): boolean;
}
/**
 * Pre-configured Hook Manager
 * Provides standard BMAD hook configurations
 */
export class BMADHookManager {
    constructor(config?: {});
    registry: HookRegistry;
    config: {
        enableSessionSecurity: boolean;
        enableEventLogging: boolean;
        enablePerformanceMonitoring: boolean;
        customHooks: never[];
    };
    initializeStandardHooks(): void;
    executeSessionInit(sessionContext?: {}): Promise<{
        success: boolean;
        sessionId: any;
        securityLevel: string;
        warnings: never[];
        errors: string[];
    }>;
    getRegistry(): HookRegistry;
}
//# sourceMappingURL=index.d.ts.map