/**
 * BMAD Scripts - Utility & Automation Framework
 * ==============================================
 *
 * Exported script utilities providing compression, manifest management,
 * and build automation for BMAD applications.
 */
export { default as agentCompressor } from '../../.claude/scripts/agent-compressor.js';
export { default as manifestCompressor } from '../../.claude/scripts/manifest-compressor.js';
/**
 * Script Types and Interfaces
 */
export interface ScriptConfig {
    outputPath?: string;
    compressionLevel?: 'low' | 'medium' | 'high';
    enableLogging?: boolean;
    customScripts?: Array<CustomScript>;
}
export interface CustomScript {
    name: string;
    description: string;
    execute: (args: string[], config: ScriptConfig) => Promise<ScriptResult>;
    requiredArgs?: string[];
    optionalArgs?: string[];
}
export interface ScriptResult {
    success: boolean;
    output: string;
    errors: string[];
    metadata?: Record<string, any>;
}
export interface CompressionOptions {
    inputPath: string;
    outputPath: string;
    preserveComments?: boolean;
    minify?: boolean;
    excludePatterns?: string[];
}
/**
 * Script Registry for managing utility scripts
 */
export declare class ScriptRegistry {
    private scripts;
    register(script: CustomScript): void;
    execute(scriptName: string, args: string[], config?: ScriptConfig): Promise<ScriptResult>;
    list(): string[];
    getScript(name: string): CustomScript | undefined;
}
/**
 * BMAD Script Manager
 * Provides standard BMAD script utilities with a unified interface
 */
export declare class BMADScriptManager {
    private registry;
    private config;
    constructor(config?: ScriptConfig);
    private initializeStandardScripts;
    executeScript(name: string, args?: string[]): Promise<ScriptResult>;
    listScripts(): Array<{
        name: string;
        description: string;
    }>;
    getRegistry(): ScriptRegistry;
}
/**
 * Convenience function to create script manager with default configuration
 */
export declare function createScriptManager(config?: ScriptConfig): BMADScriptManager;
/**
 * Direct utility exports for common operations
 */
export declare function compressAgents(inputPath: string, outputPath?: string): Promise<ScriptResult>;
export declare function compressManifest(manifestPath: string, outputPath?: string): Promise<ScriptResult>;
export declare function buildModules(target?: string, environment?: string): Promise<ScriptResult>;
//# sourceMappingURL=index.d.ts.map