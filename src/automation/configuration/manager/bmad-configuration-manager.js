/**
 * BMAD CONFIGURATION MANAGER - EPIC 5.3
 * Centralized configuration management with schema validation and drift detection
 *
 * @module automation/configuration/manager
 * @version 1.0.0
 * @epic Epic 5 - Story 5.3: Configuration Management Export
 */

const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

/**
 * Configuration Manager - Schema-validated configuration with drift detection
 */
class ConfigurationManager extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      configDir: config.configDir || './config',
      schemaDir: config.schemaDir || './schemas',
      envPrefix: config.envPrefix || 'BMAD_',
      enableDriftDetection: config.enableDriftDetection !== false,
      driftCheckInterval: config.driftCheckInterval || 60000,
      encryptSensitive: config.encryptSensitive !== false,
      ...config
    };

    this.configurations = new Map();
    this.schemas = new Map();
    this.snapshots = new Map();
    this.driftCheckTimer = null;

    this.metrics = {
      totalConfigs: 0,
      validationErrors: 0,
      driftDetections: 0,
      lastDriftCheck: null
    };

    this.logger = {
      info: (msg) => console.log(`[CONFIG] ${msg}`),
      warn: (msg) => console.warn(`[CONFIG] ${msg}`),
      error: (msg) => console.error(`[CONFIG] ${msg}`)
    };
  }

  /**
   * Initialize configuration manager
   */
  async initialize() {
    await fs.mkdir(this.config.configDir, { recursive: true });
    await fs.mkdir(this.config.schemaDir, { recursive: true });
    await this._loadSchemas();
    await this._loadConfigurations();

    if (this.config.enableDriftDetection) {
      this._startDriftDetection();
    }

    this.logger.info('Configuration manager initialized');
    this.emit('initialized');
    return this;
  }

  /**
   * Register a configuration schema
   */
  registerSchema(name, schema) {
    if (!name || !schema) {
      throw new Error('Schema name and definition are required');
    }

    const normalizedSchema = {
      name,
      version: schema.version || '1.0.0',
      properties: schema.properties || {},
      required: schema.required || [],
      defaults: schema.defaults || {},
      sensitive: schema.sensitive || [],
      validators: schema.validators || {}
    };

    this.schemas.set(name, normalizedSchema);
    this.logger.info(`Registered schema: ${name}`);
    this.emit('schema:registered', { name });
    return this;
  }

  /**
   * Set configuration value
   */
  async set(namespace, key, value, options = {}) {
    if (!this.configurations.has(namespace)) {
      this.configurations.set(namespace, { values: {}, metadata: {} });
    }

    const config = this.configurations.get(namespace);
    const schema = this.schemas.get(namespace);

    // Validate against schema if exists
    if (schema) {
      const validation = this._validateValue(key, value, schema);
      if (!validation.valid) {
        this.metrics.validationErrors++;
        throw new Error(`Validation failed for ${namespace}.${key}: ${validation.error}`);
      }
    }

    // Encrypt sensitive values
    if (schema?.sensitive?.includes(key) && this.config.encryptSensitive) {
      value = this._encrypt(value);
    }

    const previousValue = config.values[key];
    config.values[key] = value;
    config.metadata[key] = {
      updatedAt: new Date().toISOString(),
      source: options.source || 'api',
      encrypted: schema?.sensitive?.includes(key) || false
    };

    await this._persistConfiguration(namespace);
    this.emit('config:changed', { namespace, key, previousValue, newValue: value });
    return this;
  }

  /**
   * Get configuration value
   */
  get(namespace, key, defaultValue = undefined) {
    const config = this.configurations.get(namespace);
    if (!config) return defaultValue;

    let value = key ? config.values[key] : config.values;
    if (value === undefined) {
      const schema = this.schemas.get(namespace);
      value = schema?.defaults?.[key] ?? defaultValue;
    }

    // Decrypt if necessary
    if (config.metadata[key]?.encrypted) {
      value = this._decrypt(value);
    }

    return value;
  }

  /**
   * Get all configurations for a namespace
   */
  getAll(namespace) {
    const config = this.configurations.get(namespace);
    if (!config) return {};

    const result = { ...config.values };
    const schema = this.schemas.get(namespace);

    // Apply defaults
    if (schema?.defaults) {
      for (const [key, defaultVal] of Object.entries(schema.defaults)) {
        if (result[key] === undefined) {
          result[key] = defaultVal;
        }
      }
    }

    // Decrypt sensitive values
    for (const [key, value] of Object.entries(result)) {
      if (config.metadata[key]?.encrypted) {
        result[key] = this._decrypt(value);
      }
    }

    return result;
  }

  /**
   * Load configuration from environment variables
   */
  loadFromEnvironment(namespace) {
    const schema = this.schemas.get(namespace);
    if (!schema) {
      this.logger.warn(`No schema found for namespace: ${namespace}`);
      return;
    }

    const prefix = `${this.config.envPrefix}${namespace.toUpperCase()}_`;
    let loaded = 0;

    for (const key of Object.keys(schema.properties)) {
      const envKey = `${prefix}${key.toUpperCase()}`;
      const envValue = process.env[envKey];

      if (envValue !== undefined) {
        const parsed = this._parseEnvValue(envValue, schema.properties[key].type);
        this.set(namespace, key, parsed, { source: 'environment' });
        loaded++;
      }
    }

    this.logger.info(`Loaded ${loaded} values from environment for ${namespace}`);
    return loaded;
  }

  /**
   * Validate configuration against schema
   */
  validate(namespace) {
    const config = this.configurations.get(namespace);
    const schema = this.schemas.get(namespace);

    if (!schema) {
      return { valid: true, errors: [], warnings: ['No schema registered'] };
    }

    const errors = [];
    const warnings = [];

    // Check required fields
    for (const required of schema.required) {
      if (config?.values[required] === undefined && schema.defaults[required] === undefined) {
        errors.push(`Missing required field: ${required}`);
      }
    }

    // Validate types
    if (config?.values) {
      for (const [key, value] of Object.entries(config.values)) {
        const propSchema = schema.properties[key];
        if (propSchema) {
          const typeValid = this._validateType(value, propSchema.type);
          if (!typeValid) {
            errors.push(`Invalid type for ${key}: expected ${propSchema.type}`);
          }

          // Run custom validators
          if (schema.validators[key]) {
            const customValid = schema.validators[key](value);
            if (!customValid) {
              errors.push(`Custom validation failed for ${key}`);
            }
          }
        } else {
          warnings.push(`Unknown field: ${key}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Take a snapshot of current configuration
   */
  async snapshot(namespace) {
    const config = this.configurations.get(namespace);
    if (!config) {
      throw new Error(`Namespace not found: ${namespace}`);
    }

    const snapshotId = crypto.randomUUID();
    const snapshot = {
      id: snapshotId,
      namespace,
      values: JSON.parse(JSON.stringify(config.values)),
      metadata: JSON.parse(JSON.stringify(config.metadata)),
      hash: this._hashConfig(config.values),
      createdAt: new Date().toISOString()
    };

    if (!this.snapshots.has(namespace)) {
      this.snapshots.set(namespace, []);
    }
    this.snapshots.get(namespace).push(snapshot);

    this.logger.info(`Created snapshot ${snapshotId} for ${namespace}`);
    this.emit('snapshot:created', { namespace, snapshotId });
    return snapshotId;
  }

  /**
   * Restore configuration from snapshot
   */
  async restore(namespace, snapshotId) {
    const namespaceSnapshots = this.snapshots.get(namespace);
    if (!namespaceSnapshots) {
      throw new Error(`No snapshots found for namespace: ${namespace}`);
    }

    const snapshot = namespaceSnapshots.find(s => s.id === snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot not found: ${snapshotId}`);
    }

    this.configurations.set(namespace, {
      values: JSON.parse(JSON.stringify(snapshot.values)),
      metadata: JSON.parse(JSON.stringify(snapshot.metadata))
    });

    await this._persistConfiguration(namespace);
    this.logger.info(`Restored ${namespace} from snapshot ${snapshotId}`);
    this.emit('config:restored', { namespace, snapshotId });
    return true;
  }

  /**
   * Detect configuration drift
   */
  async detectDrift(namespace) {
    const config = this.configurations.get(namespace);
    const namespaceSnapshots = this.snapshots.get(namespace);

    if (!config || !namespaceSnapshots?.length) {
      return { hasDrift: false, changes: [] };
    }

    const latestSnapshot = namespaceSnapshots[namespaceSnapshots.length - 1];
    const currentHash = this._hashConfig(config.values);

    if (currentHash === latestSnapshot.hash) {
      return { hasDrift: false, changes: [] };
    }

    // Find specific changes
    const changes = [];
    const allKeys = new Set([
      ...Object.keys(config.values),
      ...Object.keys(latestSnapshot.values)
    ]);

    for (const key of allKeys) {
      const current = config.values[key];
      const snapshot = latestSnapshot.values[key];

      if (JSON.stringify(current) !== JSON.stringify(snapshot)) {
        changes.push({
          key,
          previous: snapshot,
          current,
          type: current === undefined ? 'removed' : snapshot === undefined ? 'added' : 'modified'
        });
      }
    }

    this.metrics.driftDetections++;
    this.emit('drift:detected', { namespace, changes });
    return { hasDrift: true, changes };
  }

  /**
   * Private: Load schemas from disk
   */
  async _loadSchemas() {
    try {
      const files = await fs.readdir(this.config.schemaDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(this.config.schemaDir, file), 'utf-8');
          const schema = JSON.parse(content);
          this.registerSchema(schema.name || file.replace('.json', ''), schema);
        }
      }
    } catch (error) {
      this.logger.warn(`Could not load schemas: ${error.message}`);
    }
  }

  /**
   * Private: Load configurations from disk
   */
  async _loadConfigurations() {
    try {
      const files = await fs.readdir(this.config.configDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(this.config.configDir, file), 'utf-8');
          const config = JSON.parse(content);
          const namespace = file.replace('.json', '');
          this.configurations.set(namespace, config);
          this.metrics.totalConfigs++;
        }
      }
    } catch (error) {
      this.logger.warn(`Could not load configurations: ${error.message}`);
    }
  }

  /**
   * Private: Persist configuration to disk
   */
  async _persistConfiguration(namespace) {
    const config = this.configurations.get(namespace);
    const filePath = path.join(this.config.configDir, `${namespace}.json`);
    await fs.writeFile(filePath, JSON.stringify(config, null, 2));
  }

  _validateValue(key, value, schema) {
    const propSchema = schema.properties[key];
    if (!propSchema) {
      return { valid: true };
    }

    if (!this._validateType(value, propSchema.type)) {
      return { valid: false, error: `Expected type ${propSchema.type}` };
    }

    if (propSchema.enum && !propSchema.enum.includes(value)) {
      return { valid: false, error: `Value must be one of: ${propSchema.enum.join(', ')}` };
    }

    if (propSchema.min !== undefined && value < propSchema.min) {
      return { valid: false, error: `Value must be >= ${propSchema.min}` };
    }

    if (propSchema.max !== undefined && value > propSchema.max) {
      return { valid: false, error: `Value must be <= ${propSchema.max}` };
    }

    return { valid: true };
  }

  _validateType(value, type) {
    switch (type) {
      case 'string': return typeof value === 'string';
      case 'number': return typeof value === 'number' && !isNaN(value);
      case 'boolean': return typeof value === 'boolean';
      case 'array': return Array.isArray(value);
      case 'object': return typeof value === 'object' && value !== null && !Array.isArray(value);
      default: return true;
    }
  }

  _parseEnvValue(value, type) {
    switch (type) {
      case 'number': return parseFloat(value);
      case 'boolean': return value.toLowerCase() === 'true';
      case 'array': return value.split(',').map(v => v.trim());
      case 'object': return JSON.parse(value);
      default: return value;
    }
  }

  _hashConfig(values) {
    return crypto.createHash('sha256').update(JSON.stringify(values)).digest('hex').substring(0, 16);
  }

  _encrypt(value) {
    // Simple base64 encoding for demonstration - use proper encryption in production
    return Buffer.from(JSON.stringify(value)).toString('base64');
  }

  _decrypt(value) {
    try {
      return JSON.parse(Buffer.from(value, 'base64').toString('utf-8'));
    } catch {
      return value;
    }
  }

  _startDriftDetection() {
    this.driftCheckTimer = setInterval(async () => {
      this.metrics.lastDriftCheck = new Date().toISOString();
      for (const namespace of this.configurations.keys()) {
        await this.detectDrift(namespace);
      }
    }, this.config.driftCheckInterval);
  }

  getMetrics() {
    return {
      ...this.metrics,
      namespaces: this.configurations.size,
      schemas: this.schemas.size
    };
  }

  async performHealthCheck() {
    return {
      status: 'healthy',
      namespaces: this.configurations.size,
      schemas: this.schemas.size,
      metrics: this.getMetrics()
    };
  }

  async shutdown() {
    if (this.driftCheckTimer) {
      clearInterval(this.driftCheckTimer);
    }
    this.logger.info('Configuration manager shutdown');
    this.removeAllListeners();
  }
}

module.exports = { ConfigurationManager };
