/**
 * BMAD TEMPLATE VALIDATOR - EPIC 5.4
 * Template validation and processing engine
 *
 * @module automation/templates/validator
 * @version 1.0.0
 * @epic Epic 5 - Story 5.4: Template Engine Export
 */

const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

/**
 * Template Validator - Multi-format template validation and processing
 */
class TemplateValidator extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      templateDir: config.templateDir || './templates',
      outputDir: config.outputDir || './output',
      supportedFormats: config.supportedFormats || ['yaml', 'json', 'md', 'txt', 'html'],
      strictMode: config.strictMode !== false,
      cacheTemplates: config.cacheTemplates !== false,
      maxTemplateSize: config.maxTemplateSize || 10 * 1024 * 1024,
      ...config
    };

    this.templates = new Map();
    this.cache = new Map();
    this.validators = new Map();

    this.metrics = {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
      templatesProcessed: 0,
      cacheHits: 0
    };

    this.logger = {
      info: (msg) => console.log(`[TEMPLATE] ${msg}`),
      warn: (msg) => console.warn(`[TEMPLATE] ${msg}`),
      error: (msg) => console.error(`[TEMPLATE] ${msg}`)
    };

    this._registerBuiltinValidators();
  }

  /**
   * Initialize template validator
   */
  async initialize() {
    await fs.mkdir(this.config.templateDir, { recursive: true });
    await fs.mkdir(this.config.outputDir, { recursive: true });
    await this._loadTemplates();
    this.logger.info('Template validator initialized');
    this.emit('initialized');
    return this;
  }

  /**
   * Register a template
   */
  registerTemplate(id, template) {
    if (!id || !template.content) {
      throw new Error('Template id and content are required');
    }

    const normalizedTemplate = {
      id,
      name: template.name || id,
      content: template.content,
      format: template.format || this._detectFormat(template.content),
      schema: template.schema || null,
      variables: template.variables || this._extractVariables(template.content),
      metadata: template.metadata || {},
      createdAt: new Date().toISOString()
    };

    this.templates.set(id, normalizedTemplate);
    this.logger.info(`Registered template: ${id}`);
    this.emit('template:registered', { id });
    return this;
  }

  /**
   * Validate a template
   */
  async validate(templateId, data = {}) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    this.metrics.totalValidations++;
    const errors = [];
    const warnings = [];

    // Check required variables
    for (const variable of template.variables) {
      if (variable.required && data[variable.name] === undefined) {
        errors.push(`Missing required variable: ${variable.name}`);
      }
    }

    // Validate data types
    for (const variable of template.variables) {
      const value = data[variable.name];
      if (value !== undefined && variable.type) {
        if (!this._validateType(value, variable.type)) {
          errors.push(`Invalid type for ${variable.name}: expected ${variable.type}`);
        }
      }
    }

    // Run format-specific validators
    const formatValidator = this.validators.get(template.format);
    if (formatValidator) {
      const formatResult = await formatValidator(template.content, data);
      errors.push(...(formatResult.errors || []));
      warnings.push(...(formatResult.warnings || []));
    }

    // Run custom schema validation
    if (template.schema) {
      const schemaResult = this._validateSchema(data, template.schema);
      errors.push(...schemaResult.errors);
    }

    const valid = errors.length === 0;
    if (valid) {
      this.metrics.successfulValidations++;
    } else {
      this.metrics.failedValidations++;
    }

    this.emit('validation:completed', { templateId, valid, errors, warnings });
    return { valid, errors, warnings };
  }

  /**
   * Render a template with data
   */
  async render(templateId, data = {}) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Check cache
    const cacheKey = this._getCacheKey(templateId, data);
    if (this.config.cacheTemplates && this.cache.has(cacheKey)) {
      this.metrics.cacheHits++;
      return this.cache.get(cacheKey);
    }

    // Validate first if strict mode
    if (this.config.strictMode) {
      const validation = await this.validate(templateId, data);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    }

    // Render template
    let rendered = template.content;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      rendered = rendered.replace(regex, String(value));
    }

    // Apply defaults for missing variables
    for (const variable of template.variables) {
      if (variable.default !== undefined) {
        const regex = new RegExp(`\\{\\{\\s*${variable.name}\\s*\\}\\}`, 'g');
        rendered = rendered.replace(regex, String(variable.default));
      }
    }

    // Remove any remaining unresolved variables
    rendered = rendered.replace(/\{\{\s*\w+\s*\}\}/g, '');

    // Cache result
    if (this.config.cacheTemplates) {
      this.cache.set(cacheKey, rendered);
    }

    this.metrics.templatesProcessed++;
    this.emit('template:rendered', { templateId });
    return rendered;
  }

  /**
   * Process and save template output
   */
  async process(templateId, data, outputFileName) {
    const rendered = await this.render(templateId, data);
    const template = this.templates.get(templateId);
    const extension = this._getExtension(template.format);
    const outputPath = path.join(this.config.outputDir, outputFileName || `${templateId}.${extension}`);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, rendered);

    this.logger.info(`Processed template ${templateId} to ${outputPath}`);
    this.emit('template:processed', { templateId, outputPath });
    return { outputPath, content: rendered };
  }

  /**
   * Register a custom validator
   */
  registerValidator(format, validator) {
    this.validators.set(format, validator);
    this.logger.info(`Registered validator for format: ${format}`);
    return this;
  }

  /**
   * Load templates from directory
   */
  async _loadTemplates() {
    try {
      const files = await fs.readdir(this.config.templateDir, { recursive: true });
      for (const file of files) {
        const filePath = path.join(this.config.templateDir, file);
        const stat = await fs.stat(filePath);

        if (stat.isFile() && stat.size <= this.config.maxTemplateSize) {
          const ext = path.extname(file).slice(1);
          if (this.config.supportedFormats.includes(ext)) {
            const content = await fs.readFile(filePath, 'utf-8');
            const id = file.replace(/\.[^/.]+$/, '').replace(/[/\\]/g, '-');
            this.registerTemplate(id, {
              name: file,
              content,
              format: ext,
              metadata: { filePath }
            });
          }
        }
      }
    } catch (error) {
      this.logger.warn(`Could not load templates: ${error.message}`);
    }
  }

  _registerBuiltinValidators() {
    // YAML validator
    this.validators.set('yaml', (content) => {
      const errors = [];
      const warnings = [];

      // Check for common YAML issues
      if (content.includes('\t')) {
        warnings.push('YAML should use spaces, not tabs');
      }

      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/^\s+.*:\s*$/)) {
          warnings.push(`Line ${i + 1}: Empty value after colon`);
        }
      }

      return { errors, warnings };
    });

    // JSON validator
    this.validators.set('json', (content) => {
      const errors = [];
      try {
        JSON.parse(content.replace(/\{\{.*?\}\}/g, '"placeholder"'));
      } catch (e) {
        errors.push(`Invalid JSON: ${e.message}`);
      }
      return { errors, warnings: [] };
    });

    // HTML validator
    this.validators.set('html', (content) => {
      const errors = [];
      const warnings = [];

      // Check for unclosed tags
      const openTags = content.match(/<([a-z][a-z0-9]*)[^>]*>/gi) || [];
      const closeTags = content.match(/<\/([a-z][a-z0-9]*)>/gi) || [];

      const selfClosing = ['br', 'hr', 'img', 'input', 'meta', 'link'];
      const openCount = {};
      const closeCount = {};

      for (const tag of openTags) {
        const name = tag.match(/<([a-z][a-z0-9]*)/i)?.[1]?.toLowerCase();
        if (name && !selfClosing.includes(name)) {
          openCount[name] = (openCount[name] || 0) + 1;
        }
      }

      for (const tag of closeTags) {
        const name = tag.match(/<\/([a-z][a-z0-9]*)/i)?.[1]?.toLowerCase();
        if (name) {
          closeCount[name] = (closeCount[name] || 0) + 1;
        }
      }

      for (const [tag, count] of Object.entries(openCount)) {
        if (count !== (closeCount[tag] || 0)) {
          warnings.push(`Potential unclosed <${tag}> tag`);
        }
      }

      return { errors, warnings };
    });

    // Markdown validator
    this.validators.set('md', (content) => {
      const warnings = [];

      // Check for broken links
      const links = content.match(/\[([^\]]+)\]\(([^)]*)\)/g) || [];
      for (const link of links) {
        if (link.includes('()')) {
          warnings.push('Empty link URL detected');
        }
      }

      return { errors: [], warnings };
    });
  }

  _extractVariables(content) {
    const variables = [];
    const matches = content.matchAll(/\{\{\s*(\w+)(?::(\w+))?(?:=([^}]+))?\s*\}\}/g);

    for (const match of matches) {
      const name = match[1];
      if (!variables.find(v => v.name === name)) {
        variables.push({
          name,
          type: match[2] || 'string',
          default: match[3],
          required: !match[3]
        });
      }
    }

    return variables;
  }

  _detectFormat(content) {
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) return 'json';
    if (content.includes('<!DOCTYPE') || content.includes('<html')) return 'html';
    if (content.match(/^#+ /m) || content.includes('```')) return 'md';
    if (content.match(/^[a-z_]+:/mi)) return 'yaml';
    return 'txt';
  }

  _validateType(value, type) {
    switch (type) {
      case 'string': return typeof value === 'string';
      case 'number': return typeof value === 'number' && !isNaN(value);
      case 'boolean': return typeof value === 'boolean';
      case 'array': return Array.isArray(value);
      case 'object': return typeof value === 'object' && value !== null;
      default: return true;
    }
  }

  _validateSchema(data, schema) {
    const errors = [];

    for (const [key, rules] of Object.entries(schema)) {
      const value = data[key];

      if (rules.required && value === undefined) {
        errors.push(`Missing required field: ${key}`);
        continue;
      }

      if (value !== undefined) {
        if (rules.type && !this._validateType(value, rules.type)) {
          errors.push(`Invalid type for ${key}: expected ${rules.type}`);
        }
        if (rules.pattern && typeof value === 'string' && !new RegExp(rules.pattern).test(value)) {
          errors.push(`Field ${key} does not match pattern ${rules.pattern}`);
        }
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`Field ${key} must be one of: ${rules.enum.join(', ')}`);
        }
      }
    }

    return { errors };
  }

  _getCacheKey(templateId, data) {
    const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
    return `${templateId}:${hash}`;
  }

  _getExtension(format) {
    const extensions = { yaml: 'yaml', json: 'json', md: 'md', txt: 'txt', html: 'html' };
    return extensions[format] || 'txt';
  }

  clearCache() {
    this.cache.clear();
    this.logger.info('Template cache cleared');
  }

  getMetrics() {
    return {
      ...this.metrics,
      templates: this.templates.size,
      cacheSize: this.cache.size,
      validationSuccessRate: this.metrics.totalValidations > 0
        ? ((this.metrics.successfulValidations / this.metrics.totalValidations) * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }

  async performHealthCheck() {
    return {
      status: 'healthy',
      templates: this.templates.size,
      validators: this.validators.size,
      metrics: this.getMetrics()
    };
  }

  async shutdown() {
    this.cache.clear();
    this.logger.info('Template validator shutdown');
    this.removeAllListeners();
  }
}

module.exports = { TemplateValidator };
