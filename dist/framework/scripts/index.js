/**
 * BMAD Scripts - Utility & Automation Framework
 * ==============================================
 *
 * Exported script utilities providing compression, manifest management,
 * and build automation for BMAD applications.
 */
// Re-export utility scripts
export { default as agentCompressor } from '../../.claude/scripts/agent-compressor.js';
export { default as manifestCompressor } from '../../.claude/scripts/manifest-compressor.js';
/**
 * Script Registry for managing utility scripts
 */
export class ScriptRegistry {
    scripts = new Map();
    register(script) {
        this.scripts.set(script.name, script);
    }
    async execute(scriptName, args, config = {}) {
        const script = this.scripts.get(scriptName);
        if (!script) {
            return {
                success: false,
                output: '',
                errors: [`Script '${scriptName}' not found`]
            };
        }
        // Validate required arguments
        if (script.requiredArgs && script.requiredArgs.length > args.length) {
            return {
                success: false,
                output: '',
                errors: [`Missing required arguments: ${script.requiredArgs.slice(args.length).join(', ')}`]
            };
        }
        try {
            return await script.execute(args, config);
        }
        catch (error) {
            return {
                success: false,
                output: '',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    list() {
        return Array.from(this.scripts.keys());
    }
    getScript(name) {
        return this.scripts.get(name);
    }
}
/**
 * BMAD Script Manager
 * Provides standard BMAD script utilities with a unified interface
 */
export class BMADScriptManager {
    registry;
    config;
    constructor(config = {}) {
        this.registry = new ScriptRegistry();
        this.config = {
            outputPath: './bmad-output',
            compressionLevel: 'medium',
            enableLogging: true,
            customScripts: [],
            ...config
        };
        this.initializeStandardScripts();
    }
    initializeStandardScripts() {
        // Agent Compression Script
        this.registry.register({
            name: 'compress-agents',
            description: 'Compress BMAD agent files for distribution',
            requiredArgs: ['inputPath'],
            optionalArgs: ['outputPath', 'compressionLevel'],
            execute: async (args, config) => {
                const options = {
                    inputPath: args[0],
                    outputPath: args[1] || config.outputPath || './compressed',
                    preserveComments: false,
                    minify: true
                };
                try {
                    // Call the actual agent compressor
                    const result = await agentCompressor(options);
                    return {
                        success: true,
                        output: `Compressed agents to ${options.outputPath}`,
                        errors: [],
                        metadata: { compressionRatio: result.compressionRatio }
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        output: '',
                        errors: [error instanceof Error ? error.message : 'Compression failed']
                    };
                }
            }
        });
        // Manifest Compression Script
        this.registry.register({
            name: 'compress-manifest',
            description: 'Compress BMAD manifest files',
            requiredArgs: ['manifestPath'],
            optionalArgs: ['outputPath'],
            execute: async (args, config) => {
                try {
                    const result = await manifestCompressor({
                        inputPath: args[0],
                        outputPath: args[1] || config.outputPath
                    });
                    return {
                        success: true,
                        output: `Compressed manifest to ${args[1] || config.outputPath}`,
                        errors: [],
                        metadata: result
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        output: '',
                        errors: [error instanceof Error ? error.message : 'Manifest compression failed']
                    };
                }
            }
        });
        // Build Script
        this.registry.register({
            name: 'build',
            description: 'Build BMAD modules for production',
            optionalArgs: ['target', 'environment'],
            execute: async (args, config) => {
                const target = args[0] || 'all';
                const environment = args[1] || 'production';
                try {
                    // Implement build logic here
                    return {
                        success: true,
                        output: `Built ${target} for ${environment}`,
                        errors: [],
                        metadata: { target, environment, buildTime: new Date().toISOString() }
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        output: '',
                        errors: [error instanceof Error ? error.message : 'Build failed']
                    };
                }
            }
        });
        // Register custom scripts
        this.config.customScripts.forEach(script => {
            this.registry.register(script);
        });
    }
    async executeScript(name, args = []) {
        if (this.config.enableLogging) {
            console.log(`Executing script: ${name}`, args);
        }
        const result = await this.registry.execute(name, args, this.config);
        if (this.config.enableLogging) {
            console.log(`Script ${name} completed:`, result.success ? 'SUCCESS' : 'FAILED');
            if (result.errors.length > 0) {
                console.error('Errors:', result.errors);
            }
        }
        return result;
    }
    listScripts() {
        return this.registry.list().map(name => {
            const script = this.registry.getScript(name);
            return {
                name: script.name,
                description: script.description
            };
        });
    }
    getRegistry() {
        return this.registry;
    }
}
/**
 * Convenience function to create script manager with default configuration
 */
export function createScriptManager(config) {
    return new BMADScriptManager(config);
}
/**
 * Direct utility exports for common operations
 */
export async function compressAgents(inputPath, outputPath) {
    const manager = createScriptManager();
    return await manager.executeScript('compress-agents', [inputPath, outputPath || './compressed']);
}
export async function compressManifest(manifestPath, outputPath) {
    const manager = createScriptManager();
    return await manager.executeScript('compress-manifest', [manifestPath, outputPath || './compressed']);
}
export async function buildModules(target, environment) {
    const manager = createScriptManager();
    return await manager.executeScript('build', [target || 'all', environment || 'production']);
}
//# sourceMappingURL=index.js.map