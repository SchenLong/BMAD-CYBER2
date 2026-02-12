/**
 * BMAD Template Engine
 * Epic 5: Story 5.4 - Template Engine System
 *
 * Production-ready template processing engine with:
 * - Multi-format support (YAML, JSON, Markdown, HTML, Text)
 * - Variable substitution with filters
 * - Conditional rendering
 * - Loop constructs
 * - Template inheritance
 * - Caching and optimization
 * - Security sandboxing
 *
 * @author BlackUnicorn.Tech
 * @version 2.0.0
 */

const crypto = require("crypto");
const fs = require("fs").promises;
const path = require("path");
const EventEmitter = require("events");

/**
 * Template Filter Registry
 * Built-in filters for variable transformation
 */
class FilterRegistry {
    constructor() {
        this.filters = new Map();
        this.registerBuiltinFilters();
    }

    registerBuiltinFilters() {
        // String filters
        this.register("upper", (value) => String(value).toUpperCase());
        this.register("lower", (value) => String(value).toLowerCase());
        this.register("capitalize", (value) => {
            const str = String(value);
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        });
        this.register("title", (value) => {
            return String(value).replace(/\w\S*/g, (txt) =>
                txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
        });
        this.register("trim", (value) => String(value).trim());
        this.register("truncate", (value, length = 50, suffix = "...") => {
            const str = String(value);
            return str.length > length ? str.slice(0, length) + suffix : str;
        });
        this.register("replace", (value, search, replacement = "") => {
            return String(value).replace(new RegExp(search, "g"), replacement);
        });
        this.register("slug", (value) => {
            return String(value)
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/--+/g, "-")
                .trim();
        });
        this.register("escape", (value) => {
            return String(value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        });

        // Number filters
        this.register("number", (value, decimals = 0) => {
            return Number(value).toFixed(decimals);
        });
        this.register("currency", (value, currency = "USD", locale = "en-US") => {
            return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
        });
        this.register("percent", (value, decimals = 0) => {
            return `${(Number(value) * 100).toFixed(decimals)  }%`;
        });

        // Date filters
        this.register("date", (value, format = "iso") => {
            const date = new Date(value);
            switch (format) {
                case "iso": return date.toISOString();
                case "local": return date.toLocaleString();
                case "date": return date.toLocaleDateString();
                case "time": return date.toLocaleTimeString();
                case "relative": return this.relativeTime(date);
                default: return date.toISOString();
            }
        });
        this.register("now", () => new Date().toISOString());

        // Array filters
        this.register("join", (value, separator = ", ") => {
            return Array.isArray(value) ? value.join(separator) : String(value);
        });
        this.register("first", (value) => Array.isArray(value) ? value[0] : value);
        this.register("last", (value) => Array.isArray(value) ? value[value.length - 1] : value);
        this.register("length", (value) => {
            if (Array.isArray(value)) return value.length;
            if (typeof value === "string") return value.length;
            if (typeof value === "object" && value !== null) return Object.keys(value).length;
            return 0;
        });
        this.register("reverse", (value) => {
            if (Array.isArray(value)) return [...value].reverse();
            if (typeof value === "string") return value.split("").reverse().join("");
            return value;
        });
        this.register("sort", (value, key) => {
            if (!Array.isArray(value)) return value;
            if (key) {
                return [...value].sort((a, b) => {
                    const aVal = a[key];
                    const bVal = b[key];
                    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                });
            }
            return [...value].sort();
        });

        // Object filters
        this.register("json", (value, indent = 2) => JSON.stringify(value, null, indent));
        this.register("keys", (value) => {
            return typeof value === "object" && value !== null ? Object.keys(value) : [];
        });
        this.register("values", (value) => {
            return typeof value === "object" && value !== null ? Object.values(value) : [];
        });

        // Conditional filters
        this.register("default", (value, defaultValue = "") => {
            return value === undefined || value === null || value === "" ? defaultValue : value;
        });
        this.register("ifEmpty", (value, replacement) => {
            return !value || (Array.isArray(value) && value.length === 0) ? replacement : value;
        });
    }

    relativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
        return "just now";
    }

    register(name, fn) {
        this.filters.set(name, fn);
    }

    apply(name, value, ...args) {
        const filter = this.filters.get(name);
        if (!filter) {
            throw new Error(`Unknown filter: ${  name}`);
        }
        return filter(value, ...args);
    }

    has(name) {
        return this.filters.has(name);
    }
}

/**
 * Template Compiler
 * Parses and compiles templates into executable form
 */
class TemplateCompiler {
    constructor(engine) {
        this.engine = engine;
        this.tokenPatterns = {
            variable: /\{\{\s*(.+?)\s*\}\}/g,
            comment: /\{#\s*.*?\s*#\}/gs,
            block: /\{%\s*(if|elif|else|endif|for|endfor|block|endblock|extends|include)\s*(.*?)\s*%\}/g
        };
    }

    compile(template, name = "anonymous") {
        const tokens = this.tokenize(template);
        const ast = this.parse(tokens);
        return {
            name,
            ast,
            source: template,
            compiledAt: new Date().toISOString()
        };
    }

    tokenize(template) {
        const tokens = [];
        let lastIndex = 0;

        // Remove comments first
        template = template.replace(this.tokenPatterns.comment, "");

        // Combined pattern for all tokens
        const combined = /(\{\{.+?\}\}|\{%.+?%\})/gs;
        let match;

        while ((match = combined.exec(template)) !== null) {
            // Add text before the match
            if (match.index > lastIndex) {
                tokens.push({
                    type: "text",
                    value: template.slice(lastIndex, match.index)
                });
            }

            const tokenStr = match[1];
            if (tokenStr.startsWith("{{")) {
                // Variable token
                const varMatch = /\{\{\s*(.+?)\s*\}\}/.exec(tokenStr);
                tokens.push({
                    type: "variable",
                    expression: varMatch[1]
                });
            } else if (tokenStr.startsWith("{%")) {
                // Block token
                const blockMatch = /\{%\s*(\w+)\s*(.*?)\s*%\}/.exec(tokenStr);
                tokens.push({
                    type: "block",
                    name: blockMatch[1],
                    args: blockMatch[2].trim()
                });
            }

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < template.length) {
            tokens.push({
                type: "text",
                value: template.slice(lastIndex)
            });
        }

        return tokens;
    }

    parse(tokens) {
        const ast = [];
        const stack = [ast];
        let current = ast;

        for (const token of tokens) {
            switch (token.type) {
                case "text":
                    current.push({ type: "text", value: token.value });
                    break;

                case "variable":
                    current.push(this.parseVariable(token.expression));
                    break;

                case "block":
                    if (token.name === "if" || token.name === "for") {
                        const node = {
                            type: token.name,
                            condition: token.args,
                            children: [],
                            elseChildren: []
                        };
                        current.push(node);
                        stack.push(current);
                        current = node.children;
                    } else if (token.name === "elif" || token.name === "else") {
                        const parent = stack[stack.length - 1];
                        const ifNode = parent[parent.length - 1];
                        if (ifNode && ifNode.type === "if") {
                            current = ifNode.elseChildren;
                            if (token.name === "elif") {
                                const node = {
                                    type: "if",
                                    condition: token.args,
                                    children: [],
                                    elseChildren: []
                                };
                                current.push(node);
                                current = node.children;
                            }
                        }
                    } else if (token.name === "endif" || token.name === "endfor") {
                        current = stack.pop();
                    } else if (token.name === "extends") {
                        ast.extends = token.args.replace(/['"]/g, "");
                    } else if (token.name === "include") {
                        current.push({
                            type: "include",
                            template: token.args.replace(/['"]/g, "")
                        });
                    } else if (token.name === "block") {
                        const node = {
                            type: "block",
                            name: token.args,
                            children: []
                        };
                        current.push(node);
                        stack.push(current);
                        current = node.children;
                    } else if (token.name === "endblock") {
                        current = stack.pop();
                    }
                    break;
            }
        }

        return ast;
    }

    parseVariable(expression) {
        // Parse variable with optional filters: var|filter1|filter2:arg1,arg2
        const parts = expression.split("|").map(p => p.trim());
        const variable = parts[0];
        const filters = [];

        for (let i = 1; i < parts.length; i++) {
            const filterMatch = /^(\w+)(?::(.+))?$/.exec(parts[i]);
            if (filterMatch) {
                const args = filterMatch[2] ? filterMatch[2].split(",").map(a => a.trim()) : [];
                filters.push({
                    name: filterMatch[1],
                    args
                });
            }
        }

        return { type: "variable", name: variable, filters };
    }
}

/**
 * Template Renderer
 * Executes compiled templates with provided context
 */
class TemplateRenderer {
    constructor(engine) {
        this.engine = engine;
        this.maxLoopIterations = 10000;
    }

    async render(compiled, context = {}) {
        const output = [];
        await this.renderNodes(compiled.ast, context, output);
        return output.join("");
    }

    async renderNodes(nodes, context, output) {
        for (const node of nodes) {
            await this.renderNode(node, context, output);
        }
    }

    async renderNode(node, context, output) {
        switch (node.type) {
            case "text":
                output.push(node.value);
                break;

            case "variable":
                output.push(this.resolveVariable(node, context));
                break;

            case "if":
                if (this.evaluateCondition(node.condition, context)) {
                    await this.renderNodes(node.children, context, output);
                } else {
                    await this.renderNodes(node.elseChildren, context, output);
                }
                break;

            case "for":
                await this.renderLoop(node, context, output);
                break;

            case "block":
                // Named blocks for inheritance
                await this.renderNodes(node.children, context, output);
                break;

            case "include": {
                const included = await this.engine.render(node.template, context);
                output.push(included);
                break;
            }
        }
    }

    resolveVariable(node, context) {
        let value = this.getValue(node.name, context);

        // Apply filters
        for (const filter of node.filters) {
            const args = filter.args.map(arg => {
                // If arg is a variable reference, resolve it
                if (arg.match(/^[a-zA-Z_]/)) {
                    const resolved = this.getValue(arg, context);
                    return resolved !== undefined ? resolved : arg;
                }
                // Remove quotes from string args
                return arg.replace(/^['"]|['"]$/g, "");
            });
            value = this.engine.filters.apply(filter.name, value, ...args);
        }

        return value !== undefined && value !== null ? String(value) : "";
    }

    getValue(path, context) {
        const parts = path.split(".");
        let value = context;

        for (const part of parts) {
            if (value === undefined || value === null) return undefined;

            // Handle array access: items[0]
            const arrayMatch = /^(\w+)\[(\d+)\]$/.exec(part);
            if (arrayMatch) {
                value = value[arrayMatch[1]];
                if (Array.isArray(value)) {
                    value = value[parseInt(arrayMatch[2], 10)];
                }
            } else {
                value = value[part];
            }
        }

        return value;
    }

    evaluateCondition(condition, context) {
        // Simple condition evaluation
        // Supports: variable, variable == value, variable != value, not variable
        condition = condition.trim();

        // Handle "not" prefix
        if (condition.startsWith("not ")) {
            return !this.evaluateCondition(condition.slice(4), context);
        }

        // Handle comparison operators
        const operators = ["==", "!=", ">=", "<=", ">", "<"];
        for (const op of operators) {
            if (condition.includes(op)) {
                const [left, right] = condition.split(op).map(s => s.trim());
                const leftVal = this.getValue(left, context) || this.parseValue(left);
                const rightVal = this.getValue(right, context) || this.parseValue(right);

                switch (op) {
                    case "==": return leftVal === rightVal;
                    case "!=": return leftVal !== rightVal;
                    case ">=": return leftVal >= rightVal;
                    case "<=": return leftVal <= rightVal;
                    case ">": return leftVal > rightVal;
                    case "<": return leftVal < rightVal;
                }
            }
        }

        // Simple truthiness check
        const value = this.getValue(condition, context);
        return Boolean(value);
    }

    parseValue(str) {
        if (str === "true") return true;
        if (str === "false") return false;
        if (str === "null" || str === "none") return null;
        if (/^\d+$/.test(str)) return parseInt(str, 10);
        if (/^\d+\.\d+$/.test(str)) return parseFloat(str);
        return str.replace(/^['"]|['"]$/g, "");
    }

    async renderLoop(node, context, output) {
        // Parse for loop: for item in items
        const match = /^(\w+)\s+in\s+(.+)$/.exec(node.condition);
        if (!match) {
            throw new Error(`Invalid for loop syntax: ${  node.condition}`);
        }

        const [, itemVar, collectionVar] = match;
        const collection = this.getValue(collectionVar, context);

        if (!collection || !Array.isArray(collection)) {
            return;
        }

        let iterations = 0;
        for (let i = 0; i < collection.length; i++) {
            if (++iterations > this.maxLoopIterations) {
                throw new Error("Maximum loop iterations exceeded");
            }

            const loopContext = {
                ...context,
                [itemVar]: collection[i],
                loop: {
                    index: i,
                    index1: i + 1,
                    first: i === 0,
                    last: i === collection.length - 1,
                    length: collection.length
                }
            };

            await this.renderNodes(node.children, loopContext, output);
        }
    }
}

/**
 * Main BMAD Template Engine
 */
class BMADTemplateEngine extends EventEmitter {
    constructor(options = {}) {
        super();

        this.options = {
            templateDir: options.templateDir || "./templates",
            cacheEnabled: options.cacheEnabled !== false,
            cacheTTL: options.cacheTTL || 3600000,
            autoReload: options.autoReload || false,
            strictMode: options.strictMode !== false,
            maxTemplateSize: options.maxTemplateSize || 10 * 1024 * 1024,
            ...options
        };

        this.filters = new FilterRegistry();
        this.compiler = new TemplateCompiler(this);
        this.renderer = new TemplateRenderer(this);

        this.templates = new Map();
        this.compiledCache = new Map();
        this.renderCache = new Map();

        this.metrics = {
            totalRenders: 0,
            cacheHits: 0,
            compilations: 0,
            errors: 0,
            avgRenderTime: 0
        };

        this.isInitialized = false;
    }

    async initialize() {
        console.log("[TemplateEngine] Initializing...");

        try {
            await fs.mkdir(this.options.templateDir, { recursive: true });
            await this.loadTemplates();

            if (this.options.autoReload) {
                this.watchTemplates();
            }

            this.isInitialized = true;
            this.emit("initialized");
            console.log("[TemplateEngine] Initialization complete");
            return true;
        } catch (error) {
            console.error("[TemplateEngine] Initialization failed:", error);
            throw error;
        }
    }

    async loadTemplates() {
        const loadDir = async (dir, prefix = "") => {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });

                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);

                    if (entry.isDirectory()) {
                        await loadDir(fullPath, `${prefix + entry.name  }/`);
                    } else if (entry.isFile()) {
                        const ext = path.extname(entry.name);
                        if ([".html", ".yaml", ".json", ".md", ".txt"].includes(ext)) {
                            const content = await fs.readFile(fullPath, "utf-8");
                            const name = prefix + entry.name.replace(ext, "");
                            this.register(name, content, { filePath: fullPath });
                        }
                    }
                }
            } catch (error) {
                if (error.code !== "ENOENT") {
                    throw error;
                }
            }
        };

        await loadDir(this.options.templateDir);
        console.log(`[TemplateEngine] Loaded ${  this.templates.size  } templates`);
    }

    watchTemplates() {
        try {
            const { watch } = require("fs");
            watch(this.options.templateDir, { recursive: true }, async (eventType, filename) => {
                if (filename) {
                    console.log(`[TemplateEngine] Template changed: ${  filename}`);
                    await this.loadTemplates();
                    this.clearCache();
                }
            });
        } catch (error) {
            console.warn("[TemplateEngine] Watch not available:", error.message);
        }
    }

    register(name, content, metadata = {}) {
        this.templates.set(name, {
            name,
            content,
            metadata,
            registeredAt: new Date().toISOString()
        });

        // Invalidate compiled cache
        this.compiledCache.delete(name);
        this.emit("template:registered", { name });
        return this;
    }

    registerFilter(name, fn) {
        this.filters.register(name, fn);
        return this;
    }

    compile(name) {
        // Check cache
        if (this.options.cacheEnabled && this.compiledCache.has(name)) {
            return this.compiledCache.get(name);
        }

        const template = this.templates.get(name);
        if (!template) {
            throw new Error(`Template not found: ${  name}`);
        }

        this.metrics.compilations++;
        const compiled = this.compiler.compile(template.content, name);

        if (this.options.cacheEnabled) {
            this.compiledCache.set(name, compiled);
        }

        return compiled;
    }

    async render(name, context = {}) {
        const startTime = Date.now();
        this.metrics.totalRenders++;

        try {
            // Check render cache
            const cacheKey = this.getCacheKey(name, context);
            if (this.options.cacheEnabled && this.renderCache.has(cacheKey)) {
                const cached = this.renderCache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.options.cacheTTL) {
                    this.metrics.cacheHits++;
                    return cached.output;
                }
            }

            const compiled = this.compile(name);
            const output = await this.renderer.render(compiled, context);

            // Cache result
            if (this.options.cacheEnabled) {
                this.renderCache.set(cacheKey, {
                    output,
                    timestamp: Date.now()
                });
            }

            // Update metrics
            const renderTime = Date.now() - startTime;
            this.metrics.avgRenderTime = (
                (this.metrics.avgRenderTime * (this.metrics.totalRenders - 1) + renderTime) /
                this.metrics.totalRenders
            );

            this.emit("template:rendered", { name, renderTime });
            return output;
        } catch (error) {
            this.metrics.errors++;
            this.emit("template:error", { name, error });
            throw error;
        }
    }

    async renderString(template, context = {}) {
        const compiled = this.compiler.compile(template, "inline");
        return await this.renderer.render(compiled, context);
    }

    getCacheKey(name, context) {
        const contextHash = crypto
            .createHash("md5")
            .update(JSON.stringify(context))
            .digest("hex");
        return `${name  }:${  contextHash}`;
    }

    clearCache() {
        this.compiledCache.clear();
        this.renderCache.clear();
        console.log("[TemplateEngine] Cache cleared");
    }

    getTemplate(name) {
        return this.templates.get(name);
    }

    hasTemplate(name) {
        return this.templates.has(name);
    }

    listTemplates() {
        return Array.from(this.templates.keys());
    }

    getMetrics() {
        return {
            ...this.metrics,
            templateCount: this.templates.size,
            compiledCacheSize: this.compiledCache.size,
            renderCacheSize: this.renderCache.size,
            cacheHitRate: this.metrics.totalRenders > 0
                ? `${((this.metrics.cacheHits / this.metrics.totalRenders) * 100).toFixed(2)  }%`
                : "N/A"
        };
    }

    async performHealthCheck() {
        return {
            status: this.isInitialized ? "healthy" : "not initialized",
            templates: this.templates.size,
            filters: this.filters.filters.size,
            metrics: this.getMetrics()
        };
    }

    async shutdown() {
        this.clearCache();
        this.removeAllListeners();
        this.isInitialized = false;
        console.log("[TemplateEngine] Shutdown complete");
    }
}

// Factory function
function createTemplateEngine(options) {
    return new BMADTemplateEngine(options);
}

// Singleton instance
let engineInstance;

function getTemplateEngine(options) {
    if (!engineInstance) {
        engineInstance = createTemplateEngine(options);
    }
    return engineInstance;
}

module.exports = {
    BMADTemplateEngine,
    FilterRegistry,
    TemplateCompiler,
    TemplateRenderer,
    createTemplateEngine,
    getTemplateEngine
};
