/**
 * BMAD Hooks - Session & Security Event Handlers
 * ===============================================
 *
 * Exported hook system providing session initialization,
 * security monitoring, and event handling capabilities.
 */

// Re-export session security hooks
export { sessionSecurityInit } from '../../../.claude/hooks/session-security-init.js';

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
export class HookRegistry {
  private hooks: Map<string, HookHandler[]> = new Map();

  register(event: string, handler: HookHandler): void {
    const handlers = this.hooks.get(event) || [];
    handlers.push(handler);
    // Sort by priority (higher priority first)
    handlers.sort((a, b) => b.priority - a.priority);
    this.hooks.set(event, handlers);
  }

  async execute(event: string, context: HookContext): Promise<void> {
    const handlers = this.hooks.get(event) || [];
    for (const handler of handlers) {
      try {
        await handler.execute(context);
      } catch (error) {
        console.error(`Hook ${handler.name} failed:`, error);
      }
    }
  }

  unregister(event: string, handlerName: string): boolean {
    const handlers = this.hooks.get(event) || [];
    const index = handlers.findIndex(h => h.name === handlerName);
    if (index !== -1) {
      handlers.splice(index, 1);
      return true;
    }
    return false;
  }
}

/**
 * Pre-configured Hook Manager
 * Provides standard BMAD hook configurations
 */
export class BMADHookManager {
  private registry: HookRegistry;
  private config: Required<HookConfig>;

  constructor(config: HookConfig = {}) {
    this.registry = new HookRegistry();
    this.config = {
      enableSessionSecurity: true,
      enableEventLogging: true,
      enablePerformanceMonitoring: true,
      customHooks: [],
      ...config
    };
    this.initializeStandardHooks();
  }

  private initializeStandardHooks(): void {
    if (this.config.enableSessionSecurity) {
      this.registry.register('session:init', {
        name: 'security-init',
        priority: 100,
        execute: async (context) => {
          // Session security initialization
          await sessionSecurityInit();
        }
      });
    }

    if (this.config.enableEventLogging) {
      this.registry.register('*', {
        name: 'event-logger',
        priority: 50,
        execute: (context) => {
          console.log(`Hook event: ${context.metadata.event}`, context);
        }
      });
    }

    // Register custom hooks
    this.config.customHooks.forEach(hook => {
      this.registry.register('custom', hook);
    });
  }

  async executeSessionInit(sessionContext: Partial<HookContext> = {}): Promise<SessionHookResult> {
    const context: HookContext = {
      sessionId: sessionContext.sessionId || crypto.randomUUID(),
      timestamp: new Date(),
      metadata: { event: 'session:init', ...sessionContext.metadata }
    };

    try {
      await this.registry.execute('session:init', context);
      return {
        success: true,
        sessionId: context.sessionId,
        securityLevel: 'medium',
        warnings: [],
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        sessionId: context.sessionId,
        securityLevel: 'low',
        warnings: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  getRegistry(): HookRegistry {
    return this.registry;
  }
}

/**
 * Convenience function to create hook manager with default configuration
 */
export function createHookManager(config?: HookConfig): BMADHookManager {
  return new BMADHookManager(config);
}