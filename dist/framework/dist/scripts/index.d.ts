/**
 * Convenience function to create script manager with default configuration
 */
export function createScriptManager(config: any): BMADScriptManager;
/**
 * Direct utility exports for common operations
 */
export function compressAgents(inputPath: any, outputPath: any): Promise<any>;
export function compressManifest(manifestPath: any, outputPath: any): Promise<any>;
export function buildModules(target: any, environment: any): Promise<any>;
/**
 * Script Registry for managing utility scripts
 */
export class ScriptRegistry {
    scripts: Map<any, any>;
    register(script: any): void;
    execute(scriptName: any, args: any, config?: {}): Promise<any>;
    list(): any[];
    getScript(name: any): any;
}
/**
 * BMAD Script Manager
 * Provides standard BMAD script utilities with a unified interface
 */
export class BMADScriptManager {
    constructor(config?: {});
    registry: ScriptRegistry;
    config: {
        outputPath: string;
        compressionLevel: string;
        enableLogging: boolean;
        customScripts: never[];
    };
    initializeStandardScripts(): void;
    executeScript(name: any, args?: any[]): Promise<any>;
    listScripts(): {
        name: any;
        description: any;
    }[];
    getRegistry(): ScriptRegistry;
}
//# sourceMappingURL=index.d.ts.map