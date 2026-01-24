/**
 * BMAD Hooks - Session & Security Event Handlers
 * ===============================================
 *
 * Exported hook system providing session initialization,
 * security monitoring, and event handling capabilities.
 */
export { sessionSecurityInit } from '../../.claude/hooks/session-security-init.js';
/**
 * Hook Types and Interfaces
 */
export interface HookConfig {
    enableSessionSecurity?: boolean;
    enableEventLogging?: boolean;
    enablePerformanceMonitoring?: boolean;
    customHooks?: Array<HookHandler>;
}
export interface HookHandler {
    name: string;
    priority: number;
    execute: (context: HookContext) => Promise<void> | void;
}
export interface HookContext {
    sessionId: string;
    userId?: string;
    timestamp: Date;
    metadata: Record<string, any>;
}
export interface SessionHookResult {
    success: boolean;
    sessionId: string;
    securityLevel: 'low' | 'medium' | 'high';
    warnings: string[];
    errors: string[];
}
/**
 * Hook Registry for managing custom hooks
 */
export declare class HookRegistry {
    private hooks;
    register(event: string, handler: HookHandler): void;
    execute(event: string, context: HookContext): Promise<void>;
    unregister(event: string, handlerName: string): boolean;
}
/**
 * Pre-configured Hook Manager
 * Provides standard BMAD hook configurations
 */
export declare class BMADHookManager {
    private registry;
    private config;
    constructor(config?: HookConfig);
    private initializeStandardHooks;
    executeSessionInit(sessionContext?: Partial<HookContext>): Promise<SessionHookResult>;
    getRegistry(): HookRegistry;
}
/**
 * Convenience function to create hook manager with default configuration
 */
export declare function createHookManager(config?: HookConfig): BMADHookManager;
//# sourceMappingURL=index.d.ts.map