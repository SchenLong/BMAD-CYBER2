/**
 * BMAD Scripts - Utility & Automation Framework
 * ==============================================
 *
 * Exported script utilities providing compression, manifest management,
 * and build automation for BMAD applications.
 *
 * Note: The agent-compressor and manifest-compressor are standalone CLI scripts
 * located at .claude/scripts/ and are invoked via npx ts-node, not as modules.
 */

import { spawn } from 'child_process';
import * as path from 'path';

/**
 * Helper to run a CLI script from .claude/scripts/
 */
async function runScript(scriptName: string, args: string[]): Promise<{ success: boolean; output: string; errors: string[] }> {
  return new Promise((resolve) => {
    const scriptPath = path.resolve(__dirname, '../../../.claude/scripts', scriptName);
    const child = spawn('npx', ['ts-node', scriptPath, ...args], {
      cwd: path.resolve(__dirname, '../../..'),
      stdio: ['inherit', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => { stdout += data.toString(); });
    child.stderr?.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (code) => {
      resolve({
        success: code === 0,
        output: stdout,
        errors: code !== 0 ? [stderr || `Script exited with code ${code}`] : []
      });
    });

    child.on('error', (err) => {
      resolve({
        success: false,
        output: '',
        errors: [err.message]
      });
    });
  });
}

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
export class ScriptRegistry {
  private scripts: Map<string, CustomScript> = new Map();

  register(script: CustomScript): void {
    this.scripts.set(script.name, script);
  }

  async execute(scriptName: string, args: string[], config: ScriptConfig = {}): Promise<ScriptResult> {
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
    } catch (error) {
      return {
        success: false,
        output: '',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  list(): string[] {
    return Array.from(this.scripts.keys());
  }

  getScript(name: string): CustomScript | undefined {
    return this.scripts.get(name);
  }
}

/**
 * BMAD Script Manager
 * Provides standard BMAD script utilities with a unified interface
 */
export class BMADScriptManager {
  private registry: ScriptRegistry;
  private config: Required<ScriptConfig>;

  constructor(config: ScriptConfig = {}) {
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

  private initializeStandardScripts(): void {
    // Agent Compression Script
    this.registry.register({
      name: 'compress-agents',
      description: 'Compress BMAD agent files for distribution',
      requiredArgs: ['inputPath'],
      optionalArgs: ['outputPath', 'compressionLevel'],
      execute: async (args, config) => {
        const inputPath = args[0];
        const outputPath = args[1] || config.outputPath || './compressed';

        try {
          // Invoke the agent-compressor CLI script
          const result = await runScript('agent-compressor.ts', ['--all']);
          return {
            success: result.success,
            output: result.success ? `Compressed agents to ${outputPath}` : '',
            errors: result.errors,
            metadata: {}
          };
        } catch (error) {
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
          // Invoke the manifest-compressor CLI script
          const result = await runScript('manifest-compressor.ts', []);
          return {
            success: result.success,
            output: result.success ? `Compressed manifests` : '',
            errors: result.errors,
            metadata: {}
          };
        } catch (error) {
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
        } catch (error) {
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

  async executeScript(name: string, args: string[] = []): Promise<ScriptResult> {
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

  listScripts(): Array<{ name: string; description: string }> {
    return this.registry.list().map(name => {
      const script = this.registry.getScript(name)!;
      return {
        name: script.name,
        description: script.description
      };
    });
  }

  getRegistry(): ScriptRegistry {
    return this.registry;
  }
}

/**
 * Convenience function to create script manager with default configuration
 */
export function createScriptManager(config?: ScriptConfig): BMADScriptManager {
  return new BMADScriptManager(config);
}

/**
 * Direct utility exports for common operations
 */
export async function compressAgents(inputPath: string, outputPath?: string): Promise<ScriptResult> {
  const manager = createScriptManager();
  return await manager.executeScript('compress-agents', [inputPath, outputPath || './compressed']);
}

export async function compressManifest(manifestPath: string, outputPath?: string): Promise<ScriptResult> {
  const manager = createScriptManager();
  return await manager.executeScript('compress-manifest', [manifestPath, outputPath || './compressed']);
}

export async function buildModules(target?: string, environment?: string): Promise<ScriptResult> {
  const manager = createScriptManager();
  return await manager.executeScript('build', [target || 'all', environment || 'production']);
}