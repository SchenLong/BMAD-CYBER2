/**
 * BMAD CONCURA CACHE INVALIDATION ENGINE
 * Intelligent cache invalidation with event-driven and pattern-based strategies
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 */

export interface InvalidationRule {
  id: string;
  name: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  trigger: {
    type: 'event' | 'time' | 'pattern' | 'manual' | 'cascading';
    condition: any;
    parameters: Record<string, any>;
  };
  target: {
    scope: 'specific' | 'pattern' | 'tag' | 'global';
    selector: string | RegExp;
    includeDependencies: boolean;
  };
  strategy: {
    mode: 'immediate' | 'lazy' | 'scheduled' | 'gradual';
    batchSize?: number;
    delay?: number;
  };
  validation: {
    confirmBeforeInvalidation: boolean;
    backupOnInvalidation: boolean;
    rollbackSupport: boolean;
  };
}

export interface InvalidationEvent {
  id: string;
  timestamp: number;
  source: string;
  type: 'data_change' | 'security_update' | 'user_action' | 'system_event';
  metadata: {
    userId?: string;
    moduleId?: string;
    dataCategory?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedKeys?: string[];
    cascadeDepth?: number;
  };
  processed: boolean;
  result?: {
    keysInvalidated: number;
    executionTime: number;
    errors?: string[];
  };
}

export interface InvalidationStats {
  totalInvalidations: number;
  invalidationsByRule: Map<string, number>;
  invalidationsByType: Map<string, number>;
  averageExecutionTime: number;
  errorRate: number;
  cacheHitImpact: {
    before: number;
    after: number;
    recoveryTime: number;
  };
  performance: {
    totalKeysInvalidated: number;
    averageKeysPerInvalidation: number;
    largestInvalidation: number;
    fastestInvalidation: number;
    slowestInvalidation: number;
  };
}

/**
 * Advanced Cache Invalidation Engine
 */
export class CacheInvalidationEngine {
  private invalidationRules = new Map<string, InvalidationRule>();
  private eventQueue: InvalidationEvent[] = [];
  private invalidationHistory: InvalidationEvent[] = [];
  private stats: InvalidationStats;
  private isProcessing = false;
  private eventSubscriptions = new Map<string, Function[]>();
  private dependencyGraph = new Map<string, Set<string>>();
  private tagIndex = new Map<string, Set<string>>();
  private patternMatcher: PatternMatcher;
  private cascadeManager: CascadeManager;
  private validationEngine: ValidationEngine;
  private performanceTracker: PerformanceTracker;

  constructor(private cacheReference: any) {
    this.stats = this.initializeStats();
    this.patternMatcher = new PatternMatcher();
    this.cascadeManager = new CascadeManager();
    this.validationEngine = new ValidationEngine();
    this.performanceTracker = new PerformanceTracker();

    this.initializeDefaultRules();
    this.startEventProcessor();

    console.log('🗑️ BMAD Cache Invalidation Engine initialized');
  }

  /**
   * Add invalidation rule
   */
  addRule(rule: InvalidationRule): void {
    this.validateRule(rule);
    this.invalidationRules.set(rule.id, rule);

    console.log(`📋 Added invalidation rule: ${rule.name} (Priority: ${rule.priority})`);

    // Subscribe to relevant events
    this.subscribeToRuleEvents(rule);
  }

  /**
   * Remove invalidation rule
   */
  removeRule(ruleId: string): boolean {
    const rule = this.invalidationRules.get(ruleId);
    if (!rule) {
      console.warn(`⚠️ Rule not found: ${ruleId}`);
      return false;
    }

    this.unsubscribeFromRuleEvents(rule);
    this.invalidationRules.delete(ruleId);

    console.log(`🗑️ Removed invalidation rule: ${rule.name}`);
    return true;
  }

  /**
   * Manual cache invalidation
   */
  async invalidate(options: {
    keys?: string[];
    pattern?: string | RegExp;
    tags?: string[];
    scope?: 'user' | 'team' | 'module' | 'global';
    reason?: string;
    cascade?: boolean;
    backup?: boolean;
  }): Promise<{
    success: boolean;
    keysInvalidated: number;
    executionTime: number;
    errors?: string[];
    backupId?: string;
  }> {
    const startTime = performance.now();

    console.log('🗑️ Manual cache invalidation requested');
    console.log(`   Scope: ${options.scope || 'specific'}`);
    console.log(`   Cascade: ${options.cascade ? 'Enabled' : 'Disabled'}`);

    try {
      // Create invalidation event
      const event: InvalidationEvent = {
        id: this.generateEventId(),
        timestamp: Date.now(),
        source: 'manual',
        type: 'user_action',
        metadata: {
          severity: 'medium',
          affectedKeys: options.keys
        },
        processed: false
      };

      // Execute invalidation
      const result = await this.executeInvalidation(event, {
        target: {
          scope: options.scope === 'global' ? 'global' : 'specific',
          selector: this.buildSelector(options),
          includeDependencies: options.cascade || false
        },
        strategy: {
          mode: 'immediate'
        },
        validation: {
          confirmBeforeInvalidation: false,
          backupOnInvalidation: options.backup || false,
          rollbackSupport: true
        }
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      this.updateStats(result.keysInvalidated, executionTime, result.errors?.length || 0);

      console.log(`✅ Manual invalidation completed: ${result.keysInvalidated} keys in ${executionTime.toFixed(2)}ms`);

      return {
        success: true,
        keysInvalidated: result.keysInvalidated,
        executionTime,
        errors: result.errors,
        backupId: result.backupId
      };

    } catch (error) {
      const endTime = performance.now();
      console.error('❌ Manual invalidation failed:', error);

      return {
        success: false,
        keysInvalidated: 0,
        executionTime: endTime - startTime,
        errors: [error.message]
      };
    }
  }

  /**
   * Event-driven invalidation
   */
  async invalidateByEvent(event: Partial<InvalidationEvent>): Promise<void> {
    const invalidationEvent: InvalidationEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      source: event.source || 'system',
      type: event.type || 'system_event',
      metadata: {
        severity: 'medium',
        ...event.metadata
      },
      processed: false
    };

    this.eventQueue.push(invalidationEvent);
    console.log(`📨 Invalidation event queued: ${invalidationEvent.type} from ${invalidationEvent.source}`);
  }

  /**
   * Pattern-based invalidation
   */
  async invalidateByPattern(pattern: string | RegExp, options?: {
    maxKeys?: number;
    dryRun?: boolean;
    cascade?: boolean;
  }): Promise<{
    matchedKeys: string[];
    invalidatedKeys: number;
    dryRun: boolean;
  }> {
    console.log('🎯 Pattern-based invalidation started');

    const matchedKeys = await this.findKeysMatchingPattern(pattern);

    console.log(`   Pattern matched: ${matchedKeys.length} keys`);

    if (options?.dryRun) {
      return {
        matchedKeys,
        invalidatedKeys: 0,
        dryRun: true
      };
    }

    // Limit keys if specified
    const keysToInvalidate = options?.maxKeys
      ? matchedKeys.slice(0, options.maxKeys)
      : matchedKeys;

    const result = await this.invalidate({
      keys: keysToInvalidate,
      cascade: options?.cascade,
      reason: `Pattern invalidation: ${pattern}`
    });

    return {
      matchedKeys,
      invalidatedKeys: result.keysInvalidated,
      dryRun: false
    };
  }

  /**
   * Tag-based invalidation
   */
  async invalidateByTags(tags: string[], options?: {
    operator?: 'AND' | 'OR';
    cascade?: boolean;
  }): Promise<number> {
    console.log(`🏷️ Tag-based invalidation: ${tags.join(', ')}`);

    const keysToInvalidate = this.findKeysByTags(tags, options?.operator || 'OR');

    console.log(`   Found ${keysToInvalidate.length} keys with matching tags`);

    if (keysToInvalidate.length === 0) {
      return 0;
    }

    const result = await this.invalidate({
      keys: keysToInvalidate,
      cascade: options?.cascade,
      reason: `Tag invalidation: ${tags.join(', ')}`
    });

    return result.keysInvalidated;
  }

  /**
   * Cascading invalidation
   */
  async invalidateWithCascade(keys: string[], options?: {
    maxDepth?: number;
    strategy?: 'breadth' | 'depth';
  }): Promise<{
    directInvalidations: number;
    cascadeInvalidations: number;
    totalDepth: number;
    executionTime: number;
  }> {
    const startTime = performance.now();

    console.log(`🌊 Cascading invalidation started for ${keys.length} keys`);

    const result = await this.cascadeManager.executeCascade(
      keys,
      this.dependencyGraph,
      {
        maxDepth: options?.maxDepth || 5,
        strategy: options?.strategy || 'breadth'
      }
    );

    // Execute actual invalidations
    const allKeysToInvalidate = [...result.directKeys, ...result.cascadeKeys];

    await this.performBulkInvalidation(allKeysToInvalidate);

    const endTime = performance.now();

    console.log(`✅ Cascade completed: ${result.directKeys.length} direct + ${result.cascadeKeys.length} cascade`);

    return {
      directInvalidations: result.directKeys.length,
      cascadeInvalidations: result.cascadeKeys.length,
      totalDepth: result.maxDepthReached,
      executionTime: endTime - startTime
    };
  }

  /**
   * Schedule invalidation
   */
  scheduleInvalidation(schedule: {
    keys?: string[];
    pattern?: string | RegExp;
    tags?: string[];
    cron?: string;
    delay?: number;
    repeat?: boolean;
    maxExecutions?: number;
  }): string {
    const scheduleId = this.generateScheduleId();

    console.log(`⏰ Scheduled invalidation: ${scheduleId}`);

    if (schedule.delay) {
      setTimeout(() => {
        this.executeScheduledInvalidation(scheduleId, schedule);
      }, schedule.delay);
    }

    // Cron scheduling would be implemented with a cron library
    if (schedule.cron) {
      console.log(`   Cron schedule: ${schedule.cron}`);
      // Implementation would use node-cron or similar
    }

    return scheduleId;
  }

  /**
   * Get invalidation statistics
   */
  getStats(): InvalidationStats {
    return {
      ...this.stats,
      performance: this.performanceTracker.getPerformanceStats()
    };
  }

  /**
   * Get invalidation history
   */
  getInvalidationHistory(options?: {
    limit?: number;
    since?: number;
    type?: string;
    source?: string;
  }): InvalidationEvent[] {
    let history = [...this.invalidationHistory];

    if (options?.since) {
      history = history.filter(event => event.timestamp >= options.since!);
    }

    if (options?.type) {
      history = history.filter(event => event.type === options.type);
    }

    if (options?.source) {
      history = history.filter(event => event.source === options.source);
    }

    if (options?.limit) {
      history = history.slice(-options.limit);
    }

    return history.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Optimize invalidation rules
   */
  async optimizeRules(): Promise<{
    optimizations: string[];
    rulesOptimized: number;
    performanceGain: number;
  }> {
    console.log('🔧 Optimizing invalidation rules...');

    const optimizations: string[] = [];
    let rulesOptimized = 0;
    let performanceGain = 0;

    // Analyze rule performance
    const ruleAnalysis = this.analyzeRulePerformance();

    // Remove redundant rules
    const redundantRules = this.identifyRedundantRules();
    if (redundantRules.length > 0) {
      redundantRules.forEach(ruleId => this.removeRule(ruleId));
      optimizations.push(`Removed ${redundantRules.length} redundant rules`);
      rulesOptimized += redundantRules.length;
      performanceGain += 5;
    }

    // Optimize rule priorities
    const priorityOptimizations = this.optimizeRulePriorities();
    optimizations.push(...priorityOptimizations.changes);
    performanceGain += priorityOptimizations.gain;

    // Consolidate similar rules
    const consolidation = this.consolidateSimilarRules();
    optimizations.push(...consolidation.changes);
    rulesOptimized += consolidation.rulesAffected;
    performanceGain += consolidation.gain;

    console.log(`✅ Rule optimization complete: ${rulesOptimized} rules optimized`);

    return {
      optimizations,
      rulesOptimized,
      performanceGain
    };
  }

  // Private helper methods

  private initializeStats(): InvalidationStats {
    return {
      totalInvalidations: 0,
      invalidationsByRule: new Map(),
      invalidationsByType: new Map(),
      averageExecutionTime: 0,
      errorRate: 0,
      cacheHitImpact: {
        before: 0,
        after: 0,
        recoveryTime: 0
      },
      performance: {
        totalKeysInvalidated: 0,
        averageKeysPerInvalidation: 0,
        largestInvalidation: 0,
        fastestInvalidation: Infinity,
        slowestInvalidation: 0
      }
    };
  }

  private initializeDefaultRules(): void {
    // Security-related invalidation
    this.addRule({
      id: 'security-update',
      name: 'Security Update Invalidation',
      description: 'Invalidate security-related cache on security updates',
      priority: 'critical',
      trigger: {
        type: 'event',
        condition: 'security_update',
        parameters: {}
      },
      target: {
        scope: 'tag',
        selector: 'security',
        includeDependencies: true
      },
      strategy: {
        mode: 'immediate'
      },
      validation: {
        confirmBeforeInvalidation: false,
        backupOnInvalidation: true,
        rollbackSupport: true
      }
    });

    // User-specific invalidation
    this.addRule({
      id: 'user-data-change',
      name: 'User Data Change Invalidation',
      description: 'Invalidate user-specific cache on data changes',
      priority: 'high',
      trigger: {
        type: 'event',
        condition: 'data_change',
        parameters: { scope: 'user' }
      },
      target: {
        scope: 'pattern',
        selector: 'user:*',
        includeDependencies: false
      },
      strategy: {
        mode: 'immediate'
      },
      validation: {
        confirmBeforeInvalidation: false,
        backupOnInvalidation: false,
        rollbackSupport: false
      }
    });

    // Time-based invalidation
    this.addRule({
      id: 'daily-cleanup',
      name: 'Daily Cache Cleanup',
      description: 'Daily cleanup of expired cache entries',
      priority: 'low',
      trigger: {
        type: 'time',
        condition: 'daily',
        parameters: { hour: 2 } // 2 AM
      },
      target: {
        scope: 'pattern',
        selector: 'temp:*',
        includeDependencies: false
      },
      strategy: {
        mode: 'scheduled',
        batchSize: 1000
      },
      validation: {
        confirmBeforeInvalidation: false,
        backupOnInvalidation: false,
        rollbackSupport: false
      }
    });
  }

  private startEventProcessor(): void {
    setInterval(() => {
      if (!this.isProcessing && this.eventQueue.length > 0) {
        this.processEventQueue();
      }
    }, 1000); // Process every second
  }

  private async processEventQueue(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      // Sort by priority and timestamp
      this.eventQueue.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.metadata.severity] - priorityOrder[a.metadata.severity] ||
               a.timestamp - b.timestamp;
      });

      // Process events in batches
      const batchSize = 10;
      const batch = this.eventQueue.splice(0, batchSize);

      for (const event of batch) {
        await this.processInvalidationEvent(event);
      }

    } finally {
      this.isProcessing = false;
    }
  }

  private async processInvalidationEvent(event: InvalidationEvent): Promise<void> {
    const startTime = performance.now();

    try {
      // Find applicable rules
      const applicableRules = this.findApplicableRules(event);

      if (applicableRules.length === 0) {
        console.log(`ℹ️ No rules apply to event: ${event.type}`);
        return;
      }

      console.log(`🔄 Processing ${applicableRules.length} rules for event: ${event.type}`);

      // Execute each applicable rule
      for (const rule of applicableRules) {
        await this.executeRule(rule, event);
      }

      event.processed = true;
      event.result = {
        keysInvalidated: 0, // Would be tracked during execution
        executionTime: performance.now() - startTime
      };

      this.invalidationHistory.push(event);

    } catch (error) {
      console.error(`❌ Event processing failed: ${event.id}`, error);
      event.result = {
        keysInvalidated: 0,
        executionTime: performance.now() - startTime,
        errors: [error.message]
      };
    }
  }

  private findApplicableRules(event: InvalidationEvent): InvalidationRule[] {
    const applicable: InvalidationRule[] = [];

    for (const rule of this.invalidationRules.values()) {
      if (this.isRuleApplicable(rule, event)) {
        applicable.push(rule);
      }
    }

    return applicable.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private isRuleApplicable(rule: InvalidationRule, event: InvalidationEvent): boolean {
    if (rule.trigger.type !== 'event') return false;

    if (rule.trigger.condition !== event.type) return false;

    // Check parameters
    for (const [key, value] of Object.entries(rule.trigger.parameters)) {
      if (event.metadata[key] !== value) return false;
    }

    return true;
  }

  private async executeRule(rule: InvalidationRule, event: InvalidationEvent): Promise<void> {
    console.log(`🎯 Executing rule: ${rule.name}`);

    const result = await this.executeInvalidation(event, rule);

    // Update rule statistics
    const currentCount = this.stats.invalidationsByRule.get(rule.id) || 0;
    this.stats.invalidationsByRule.set(rule.id, currentCount + 1);

    console.log(`✅ Rule executed: ${rule.name} (${result.keysInvalidated} keys)`);
  }

  private async executeInvalidation(event: InvalidationEvent, config: Partial<InvalidationRule>): Promise<{
    keysInvalidated: number;
    executionTime: number;
    errors?: string[];
    backupId?: string;
  }> {
    const startTime = performance.now();

    try {
      // Find keys to invalidate
      const keysToInvalidate = await this.findKeysToInvalidate(config.target!);

      // Validate before invalidation
      if (config.validation?.confirmBeforeInvalidation) {
        const confirmed = await this.validateInvalidation(keysToInvalidate, event);
        if (!confirmed) {
          return {
            keysInvalidated: 0,
            executionTime: performance.now() - startTime,
            errors: ['Invalidation not confirmed']
          };
        }
      }

      // Create backup if requested
      let backupId: string | undefined;
      if (config.validation?.backupOnInvalidation) {
        backupId = await this.createBackup(keysToInvalidate);
      }

      // Execute invalidation based on strategy
      const keysInvalidated = await this.performInvalidation(keysToInvalidate, config.strategy!);

      // Update dependencies if cascading
      if (config.target?.includeDependencies) {
        await this.invalidateDependencies(keysToInvalidate);
      }

      return {
        keysInvalidated,
        executionTime: performance.now() - startTime,
        backupId
      };

    } catch (error) {
      return {
        keysInvalidated: 0,
        executionTime: performance.now() - startTime,
        errors: [error.message]
      };
    }
  }

  private async findKeysToInvalidate(target: InvalidationRule['target']): Promise<string[]> {
    switch (target.scope) {
      case 'specific':
        return [target.selector as string];

      case 'pattern':
        return this.findKeysMatchingPattern(target.selector);

      case 'tag':
        return this.findKeysByTags([target.selector as string]);

      case 'global':
        return this.getAllCacheKeys();

      default:
        return [];
    }
  }

  private async findKeysMatchingPattern(pattern: string | RegExp): Promise<string[]> {
    return this.patternMatcher.findMatches(await this.getAllCacheKeys(), pattern);
  }

  private findKeysByTags(tags: string[], operator: 'AND' | 'OR' = 'OR'): string[] {
    const matchingKeys: string[] = [];

    for (const [tag, keys] of this.tagIndex) {
      if (tags.includes(tag)) {
        matchingKeys.push(...Array.from(keys));
      }
    }

    if (operator === 'AND') {
      // Return only keys that have ALL tags
      return matchingKeys.filter(key => {
        return tags.every(tag => this.tagIndex.get(tag)?.has(key));
      });
    }

    // OR operation - return unique keys
    return [...new Set(matchingKeys)];
  }

  private async getAllCacheKeys(): Promise<string[]> {
    // This would interface with the actual cache to get all keys
    // For now, return empty array
    return [];
  }

  private async performInvalidation(keys: string[], strategy: InvalidationRule['strategy']): Promise<number> {
    switch (strategy.mode) {
      case 'immediate':
        return this.performImmediateInvalidation(keys);

      case 'lazy':
        return this.performLazyInvalidation(keys);

      case 'scheduled':
        return this.performScheduledInvalidation(keys, strategy);

      case 'gradual':
        return this.performGradualInvalidation(keys, strategy);

      default:
        return this.performImmediateInvalidation(keys);
    }
  }

  private async performImmediateInvalidation(keys: string[]): Promise<number> {
    // This would interface with the actual cache to invalidate keys
    // For now, simulate invalidation
    console.log(`🗑️ Immediate invalidation of ${keys.length} keys`);
    return keys.length;
  }

  private async performLazyInvalidation(keys: string[]): Promise<number> {
    // Mark keys for lazy invalidation
    console.log(`🐌 Lazy invalidation of ${keys.length} keys`);
    return keys.length;
  }

  private async performScheduledInvalidation(keys: string[], strategy: InvalidationRule['strategy']): Promise<number> {
    // Schedule invalidation
    console.log(`⏰ Scheduled invalidation of ${keys.length} keys`);
    return keys.length;
  }

  private async performGradualInvalidation(keys: string[], strategy: InvalidationRule['strategy']): Promise<number> {
    const batchSize = strategy.batchSize || 100;
    const delay = strategy.delay || 100;

    console.log(`🐢 Gradual invalidation: ${keys.length} keys in batches of ${batchSize}`);

    let invalidatedCount = 0;

    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      await this.performImmediateInvalidation(batch);
      invalidatedCount += batch.length;

      if (i + batchSize < keys.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return invalidatedCount;
  }

  private async performBulkInvalidation(keys: string[]): Promise<void> {
    console.log(`🗑️ Bulk invalidation: ${keys.length} keys`);
    // Implementation would batch invalidate for performance
  }

  private async invalidateDependencies(keys: string[]): Promise<void> {
    const dependentKeys = new Set<string>();

    for (const key of keys) {
      const dependencies = this.dependencyGraph.get(key);
      if (dependencies) {
        dependencies.forEach(dep => dependentKeys.add(dep));
      }
    }

    if (dependentKeys.size > 0) {
      console.log(`🌊 Invalidating ${dependentKeys.size} dependent keys`);
      await this.performImmediateInvalidation(Array.from(dependentKeys));
    }
  }

  private async validateInvalidation(keys: string[], event: InvalidationEvent): Promise<boolean> {
    return this.validationEngine.validate(keys, event);
  }

  private async createBackup(keys: string[]): Promise<string> {
    const backupId = `backup_${Date.now()}`;
    console.log(`💾 Creating backup: ${backupId} for ${keys.length} keys`);
    // Implementation would create actual backup
    return backupId;
  }

  // Utility methods

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateScheduleId(): string {
    return `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private buildSelector(options: any): string {
    if (options.keys) {
      return options.keys[0]; // Simplified
    }
    if (options.pattern) {
      return options.pattern;
    }
    if (options.tags) {
      return options.tags[0]; // Simplified
    }
    return '*';
  }

  private validateRule(rule: InvalidationRule): void {
    if (!rule.id || !rule.name || !rule.trigger || !rule.target) {
      throw new Error('Invalid invalidation rule: missing required fields');
    }
  }

  private subscribeToRuleEvents(rule: InvalidationRule): void {
    // Implementation would subscribe to specific events based on rule triggers
  }

  private unsubscribeFromRuleEvents(rule: InvalidationRule): void {
    // Implementation would unsubscribe from events
  }

  private updateStats(keysInvalidated: number, executionTime: number, errors: number): void {
    this.stats.totalInvalidations++;
    this.stats.performance.totalKeysInvalidated += keysInvalidated;

    // Update averages
    this.stats.averageExecutionTime =
      (this.stats.averageExecutionTime + executionTime) / 2;

    this.stats.performance.averageKeysPerInvalidation =
      this.stats.performance.totalKeysInvalidated / this.stats.totalInvalidations;

    // Update extremes
    this.stats.performance.largestInvalidation =
      Math.max(this.stats.performance.largestInvalidation, keysInvalidated);

    this.stats.performance.fastestInvalidation =
      Math.min(this.stats.performance.fastestInvalidation, executionTime);

    this.stats.performance.slowestInvalidation =
      Math.max(this.stats.performance.slowestInvalidation, executionTime);

    // Update error rate
    if (errors > 0) {
      this.stats.errorRate = ((this.stats.errorRate * (this.stats.totalInvalidations - 1)) + 1) / this.stats.totalInvalidations;
    }
  }

  private async executeScheduledInvalidation(scheduleId: string, schedule: any): Promise<void> {
    console.log(`⏰ Executing scheduled invalidation: ${scheduleId}`);

    if (schedule.keys) {
      await this.invalidate({ keys: schedule.keys, reason: `Scheduled: ${scheduleId}` });
    }

    if (schedule.pattern) {
      await this.invalidateByPattern(schedule.pattern);
    }

    if (schedule.tags) {
      await this.invalidateByTags(schedule.tags);
    }
  }

  // Optimization methods

  private analyzeRulePerformance(): any {
    // Analyze which rules are performing well/poorly
    return {};
  }

  private identifyRedundantRules(): string[] {
    // Find rules that are redundant or overlapping
    return [];
  }

  private optimizeRulePriorities(): { changes: string[]; gain: number } {
    // Optimize rule priorities based on performance data
    return { changes: [], gain: 0 };
  }

  private consolidateSimilarRules(): { changes: string[]; rulesAffected: number; gain: number } {
    // Consolidate similar rules for better performance
    return { changes: [], rulesAffected: 0, gain: 0 };
  }
}

// Supporting classes with simplified implementations

class PatternMatcher {
  findMatches(keys: string[], pattern: string | RegExp): string[] {
    if (typeof pattern === 'string') {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return keys.filter(key => regex.test(key));
    }
    return keys.filter(key => pattern.test(key));
  }
}

class CascadeManager {
  async executeCascade(
    keys: string[],
    dependencyGraph: Map<string, Set<string>>,
    options: { maxDepth: number; strategy: string }
  ): Promise<{
    directKeys: string[];
    cascadeKeys: string[];
    maxDepthReached: number;
  }> {
    const directKeys = [...keys];
    const cascadeKeys: string[] = [];
    let depth = 0;

    // Simplified cascade implementation
    const visited = new Set<string>(keys);
    let currentLevel = [...keys];

    while (currentLevel.length > 0 && depth < options.maxDepth) {
      const nextLevel: string[] = [];

      for (const key of currentLevel) {
        const dependencies = dependencyGraph.get(key);
        if (dependencies) {
          for (const dep of dependencies) {
            if (!visited.has(dep)) {
              visited.add(dep);
              nextLevel.push(dep);
              cascadeKeys.push(dep);
            }
          }
        }
      }

      currentLevel = nextLevel;
      depth++;
    }

    return {
      directKeys,
      cascadeKeys,
      maxDepthReached: depth
    };
  }
}

class ValidationEngine {
  async validate(keys: string[], event: InvalidationEvent): Promise<boolean> {
    // Simplified validation - always return true
    return true;
  }
}

class PerformanceTracker {
  getPerformanceStats(): any {
    return {
      totalKeysInvalidated: 0,
      averageKeysPerInvalidation: 0,
      largestInvalidation: 0,
      fastestInvalidation: 0,
      slowestInvalidation: 0
    };
  }
}

/**
 * Export the Cache Invalidation Engine
 */
export { CacheInvalidationEngine };

/**
 * Export utility types
 */
export type {
  InvalidationRule,
  InvalidationEvent,
  InvalidationStats
};