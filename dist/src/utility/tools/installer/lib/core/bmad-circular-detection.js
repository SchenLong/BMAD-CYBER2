"use strict";
/**
 * BMAD Circular Dependency Detection
 * Advanced circular dependency detection and resolution for BMAD modules
 * Designed by Winston (Architect) for Epic 3: Story 3.2
 *
 * This module provides sophisticated circular dependency detection using:
 * - Depth-First Search (DFS) for cycle detection
 * - Tarjan's algorithm for strongly connected components
 * - Graph analysis for dependency cycles
 * - Resolution strategies for breaking cycles
 */
const fs = require('fs');
const path = require('path');
const yaml = require("js-yaml");
class BMADCircularDetector {
    constructor() {
        this.dependencyGraph = new Map();
        this.visited = new Set();
        this.recursionStack = new Set();
        this.cycles = [];
        this.stronglyConnectedComponents = [];
        this.resolutionStrategies = [];
        // Configuration
        this.maxDepth = 50;
        this.enableTarjanAlgorithm = true;
        this.enableResolutionSuggestions = true;
    }
    /**
     * Initialize the circular detector
     */
    initialize() {
        this.cycles = [];
        this.stronglyConnectedComponents = [];
        this.visited = new Set();
        this.recursionStack = new Set();
        console.log('[Circular Detector] Initialized');
    }
    /**
     * Detect circular dependencies in a dependency graph
     * @param {Map} dependencyGraph - Map of module dependencies
     * @returns {Object} - Detection result with cycles and resolution suggestions
     */
    detectCircularDependencies(dependencyGraph) {
        const startTime = Date.now();
        this.dependencyGraph = dependencyGraph;
        this.cycles = [];
        this.visited = new Set();
        this.recursionStack = new Set();
        console.log(`[Circular Detector] Analyzing dependency graph with ${dependencyGraph.size} modules`);
        try {
            // Primary detection using DFS
            for (const moduleId of dependencyGraph.keys()) {
                if (!this.visited.has(moduleId)) {
                    this.detectCyclesDFS(moduleId, []);
                }
            }
            // Advanced analysis using Tarjan's algorithm
            if (this.enableTarjanAlgorithm) {
                this.findStronglyConnectedComponents();
            }
            // Generate resolution strategies
            const resolutionStrategies = this.enableResolutionSuggestions
                ? this.generateResolutionStrategies()
                : [];
            const result = {
                hasCircularDependencies: this.cycles.length > 0,
                cycles: this.cycles,
                cycleCount: this.cycles.length,
                stronglyConnectedComponents: this.stronglyConnectedComponents,
                resolutionStrategies: resolutionStrategies,
                detectionTime: Date.now() - startTime,
                graphStatistics: this.generateGraphStatistics()
            };
            if (result.hasCircularDependencies) {
                console.warn(`[Circular Detector] Found ${result.cycleCount} circular dependencies`);
                this.logCycles();
            }
            else {
                console.log('[Circular Detector] No circular dependencies detected');
            }
            return result;
        }
        catch (error) {
            console.error('[Circular Detector] Detection failed:', error.message);
            return {
                hasCircularDependencies: false,
                cycles: [],
                error: error.message,
                detectionTime: Date.now() - startTime
            };
        }
    }
    /**
     * Detect cycles using Depth-First Search
     * @param {string} moduleId - Current module ID
     * @param {Array} path - Current path in the graph
     * @param {number} depth - Current recursion depth
     */
    detectCyclesDFS(moduleId, path, depth = 0) {
        // Prevent infinite recursion
        if (depth > this.maxDepth) {
            console.warn(`[Circular Detector] Maximum depth reached for ${moduleId}`);
            return;
        }
        if (this.recursionStack.has(moduleId)) {
            // Cycle detected - extract the cycle
            const cycleStartIndex = path.indexOf(moduleId);
            const cycle = path.slice(cycleStartIndex).concat([moduleId]);
            this.cycles.push({
                type: 'circular_dependency',
                modules: cycle,
                length: cycle.length - 1,
                severity: this.calculateCycleSeverity(cycle),
                detectedAt: new Date().toISOString(),
                path: [...path, moduleId]
            });
            return;
        }
        if (this.visited.has(moduleId)) {
            return;
        }
        // Mark as visited and add to recursion stack
        this.visited.add(moduleId);
        this.recursionStack.add(moduleId);
        path.push(moduleId);
        // Visit all dependencies
        const node = this.dependencyGraph.get(moduleId);
        if (node && node.dependencies) {
            for (const dependencyId of node.dependencies) {
                this.detectCyclesDFS(dependencyId, [...path], depth + 1);
            }
        }
        // Remove from recursion stack
        this.recursionStack.delete(moduleId);
    }
    /**
     * Find strongly connected components using Tarjan's algorithm
     */
    findStronglyConnectedComponents() {
        const index = new Map();
        const lowlink = new Map();
        const onStack = new Set();
        const stack = [];
        let currentIndex = 0;
        const strongConnect = (moduleId) => {
            // Set the depth index for this node
            index.set(moduleId, currentIndex);
            lowlink.set(moduleId, currentIndex);
            currentIndex++;
            stack.push(moduleId);
            onStack.add(moduleId);
            // Consider successors of moduleId
            const node = this.dependencyGraph.get(moduleId);
            if (node && node.dependencies) {
                for (const dependencyId of node.dependencies) {
                    if (this.dependencyGraph.has(dependencyId)) {
                        if (!index.has(dependencyId)) {
                            // Successor has not yet been visited; recurse on it
                            strongConnect(dependencyId);
                            lowlink.set(moduleId, Math.min(lowlink.get(moduleId), lowlink.get(dependencyId)));
                        }
                        else if (onStack.has(dependencyId)) {
                            // Successor is in stack and hence in the current SCC
                            lowlink.set(moduleId, Math.min(lowlink.get(moduleId), index.get(dependencyId)));
                        }
                    }
                }
            }
            // If moduleId is a root node, pop the stack and print an SCC
            if (lowlink.get(moduleId) === index.get(moduleId)) {
                const component = [];
                let w;
                do {
                    w = stack.pop();
                    onStack.delete(w);
                    component.push(w);
                } while (w !== moduleId);
                // Only consider components with more than one element (cycles)
                if (component.length > 1) {
                    this.stronglyConnectedComponents.push({
                        modules: component,
                        size: component.length,
                        type: 'strongly_connected_component'
                    });
                }
            }
        };
        // Run the algorithm for all unvisited nodes
        for (const moduleId of this.dependencyGraph.keys()) {
            if (!index.has(moduleId)) {
                strongConnect(moduleId);
            }
        }
    }
    /**
     * Calculate the severity of a cycle
     * @param {Array} cycle - Array of module IDs in the cycle
     * @returns {string} - Severity level
     */
    calculateCycleSeverity(cycle) {
        const cycleLength = cycle.length - 1; // Exclude duplicate end node
        // Check for critical modules in the cycle
        const criticalModules = cycle.filter(moduleId => this.isCriticalModule(moduleId));
        if (criticalModules.length > 0) {
            return 'critical';
        }
        // Severity based on cycle length and module types
        if (cycleLength === 2) {
            return 'high'; // Direct circular dependency
        }
        else if (cycleLength <= 4) {
            return 'medium';
        }
        else {
            return 'low'; // Long cycles are often less problematic
        }
    }
    /**
     * Check if a module is critical (core BMAD modules)
     * @param {string} moduleId - Module identifier
     * @returns {boolean} - True if module is critical
     */
    isCriticalModule(moduleId) {
        const criticalModules = [
            'bmad:core',
            'bmad-master',
            'abdul'
        ];
        return criticalModules.some(critical => moduleId.includes(critical));
    }
    /**
     * Generate resolution strategies for detected cycles
     * @returns {Array} - Array of resolution strategies
     */
    generateResolutionStrategies() {
        const strategies = [];
        for (const cycle of this.cycles) {
            const cycleStrategies = this.generateCycleResolutionStrategies(cycle);
            strategies.push(...cycleStrategies);
        }
        // Sort strategies by effectiveness and feasibility
        return strategies.sort((a, b) => {
            return (b.effectiveness * b.feasibility) - (a.effectiveness * a.feasibility);
        });
    }
    /**
     * Generate resolution strategies for a specific cycle
     * @param {Object} cycle - Cycle information
     * @returns {Array} - Array of strategies for this cycle
     */
    generateCycleResolutionStrategies(cycle) {
        const strategies = [];
        // Strategy 1: Lazy Loading
        strategies.push({
            type: 'lazy_loading',
            title: 'Implement Lazy Loading',
            description: 'Delay module loading until actually needed',
            cycle: cycle.modules,
            effectiveness: 0.8,
            feasibility: 0.9,
            implementation: {
                approach: 'conditional_loading',
                modules: this.findOptionalDependencies(cycle),
                code_changes: 'minimal'
            },
            risks: ['Potential runtime errors if dependency needed earlier than expected'],
            benefits: ['Breaks circular dependency', 'Improves startup time']
        });
        // Strategy 2: Dependency Injection
        strategies.push({
            type: 'dependency_injection',
            title: 'Use Dependency Injection',
            description: 'Inject dependencies at runtime instead of static imports',
            cycle: cycle.modules,
            effectiveness: 0.9,
            feasibility: 0.6,
            implementation: {
                approach: 'inject_dependencies',
                modules: cycle.modules,
                code_changes: 'moderate'
            },
            risks: ['Requires code refactoring', 'More complex setup'],
            benefits: ['Clean separation', 'Better testability']
        });
        // Strategy 3: Interface Segregation
        strategies.push({
            type: 'interface_segregation',
            title: 'Segregate Interfaces',
            description: 'Split large modules into smaller, focused interfaces',
            cycle: cycle.modules,
            effectiveness: 0.7,
            feasibility: 0.5,
            implementation: {
                approach: 'split_modules',
                modules: this.findLargeModulesInCycle(cycle),
                code_changes: 'major'
            },
            risks: ['Significant refactoring required', 'Potential breaking changes'],
            benefits: ['Better separation of concerns', 'Easier maintenance']
        });
        // Strategy 4: Event-Driven Architecture
        if (this.canUseEventDriven(cycle)) {
            strategies.push({
                type: 'event_driven',
                title: 'Event-Driven Communication',
                description: 'Use events/signals instead of direct dependencies',
                cycle: cycle.modules,
                effectiveness: 0.8,
                feasibility: 0.7,
                implementation: {
                    approach: 'event_bus',
                    modules: cycle.modules,
                    code_changes: 'moderate'
                },
                risks: ['Learning curve for event patterns', 'Potential debugging complexity'],
                benefits: ['Loose coupling', 'Scalable architecture']
            });
        }
        // Strategy 5: Optional Dependencies (for peer dependencies)
        const optionalDeps = this.findOptionalDependencies(cycle);
        if (optionalDeps.length > 0) {
            strategies.push({
                type: 'make_optional',
                title: 'Make Dependencies Optional',
                description: 'Convert required dependencies to optional where possible',
                cycle: cycle.modules,
                effectiveness: 0.6,
                feasibility: 0.8,
                implementation: {
                    approach: 'optional_dependencies',
                    modules: optionalDeps,
                    code_changes: 'minimal'
                },
                risks: ['Feature degradation when dependencies missing'],
                benefits: ['Simple implementation', 'Maintains compatibility']
            });
        }
        return strategies;
    }
    /**
     * Find optional dependencies in a cycle
     * @param {Object} cycle - Cycle information
     * @returns {Array} - Array of potentially optional dependencies
     */
    findOptionalDependencies(cycle) {
        const optional = [];
        for (const moduleId of cycle.modules) {
            const node = this.dependencyGraph.get(moduleId);
            if (node && node.config && node.config.crossModule) {
                // Check if any dependencies are marked as optional
                const optionalDeps = node.config.crossModule.optional || [];
                for (const dep of optionalDeps) {
                    if (cycle.modules.includes(dep.module)) {
                        optional.push(dep.module);
                    }
                }
            }
        }
        return [...new Set(optional)]; // Remove duplicates
    }
    /**
     * Find large modules in a cycle that could benefit from splitting
     * @param {Object} cycle - Cycle information
     * @returns {Array} - Array of large modules
     */
    findLargeModulesInCycle(cycle) {
        const largeModules = [];
        for (const moduleId of cycle.modules) {
            const node = this.dependencyGraph.get(moduleId);
            if (node && node.config) {
                // Consider modules with many agents/workflows as "large"
                const agentCount = node.config.agents?.count || 0;
                const workflowCount = node.config.workflows?.count || 0;
                if (agentCount > 10 || workflowCount > 8) {
                    largeModules.push({
                        moduleId,
                        agentCount,
                        workflowCount,
                        splitPotential: 'high'
                    });
                }
            }
        }
        return largeModules;
    }
    /**
     * Check if a cycle can benefit from event-driven architecture
     * @param {Object} cycle - Cycle information
     * @returns {boolean} - True if event-driven approach is suitable
     */
    canUseEventDriven(cycle) {
        // Event-driven is good for workflows that communicate but don't need tight coupling
        const workflowModules = cycle.modules.filter(moduleId => {
            const node = this.dependencyGraph.get(moduleId);
            return node && node.config && (node.config.workflows?.count || 0) > 0;
        });
        // If most modules in cycle have workflows, event-driven could work well
        return workflowModules.length > cycle.modules.length * 0.6;
    }
    /**
     * Validate an installation plan for circular dependencies
     * @param {Object} installationPlan - Installation plan to validate
     * @returns {Object} - Validation result
     */
    validateInstallationPlan(installationPlan) {
        const result = {
            hasCircularDependencies: false,
            cycles: [],
            violations: [],
            phaseConflicts: []
        };
        try {
            // Build dependency graph from installation plan
            const planGraph = this.buildGraphFromInstallationPlan(installationPlan);
            // Detect cycles in the plan
            const cycleDetection = this.detectCircularDependencies(planGraph);
            result.hasCircularDependencies = cycleDetection.hasCircularDependencies;
            result.cycles = cycleDetection.cycles;
            // Check for phase conflicts (modules that depend on each other in same phase)
            for (const phase of installationPlan.phases || []) {
                const phaseConflicts = this.detectPhaseConflicts(phase, planGraph);
                if (phaseConflicts.length > 0) {
                    result.phaseConflicts.push({
                        phase: phase.phase || phase.name,
                        conflicts: phaseConflicts
                    });
                }
            }
            // Check for dependency ordering violations
            const orderingViolations = this.detectOrderingViolations(installationPlan, planGraph);
            result.violations = orderingViolations;
        }
        catch (error) {
            console.error('[Circular Detector] Installation plan validation failed:', error.message);
            result.error = error.message;
        }
        return result;
    }
    /**
     * Build dependency graph from installation plan
     * @param {Object} installationPlan - Installation plan
     * @returns {Map} - Dependency graph
     */
    buildGraphFromInstallationPlan(installationPlan) {
        const graph = new Map();
        // Process each phase
        for (const phase of installationPlan.phases || []) {
            for (const moduleId of phase.modules || []) {
                if (!graph.has(moduleId)) {
                    // Get module info from original dependency graph or create minimal node
                    const originalNode = this.dependencyGraph.get(moduleId);
                    graph.set(moduleId, {
                        id: moduleId,
                        dependencies: originalNode?.dependencies || new Set(),
                        phase: phase.phase || phase.name,
                        config: originalNode?.config || {}
                    });
                }
            }
        }
        return graph;
    }
    /**
     * Detect conflicts within a single installation phase
     * @param {Object} phase - Installation phase
     * @param {Map} planGraph - Installation plan dependency graph
     * @returns {Array} - Array of conflicts
     */
    detectPhaseConflicts(phase, planGraph) {
        const conflicts = [];
        const modules = phase.modules || [];
        // Check if any modules in the same phase depend on each other
        for (let i = 0; i < modules.length; i++) {
            for (let j = i + 1; j < modules.length; j++) {
                const moduleA = modules[i];
                const moduleB = modules[j];
                const nodeA = planGraph.get(moduleA);
                const nodeB = planGraph.get(moduleB);
                if (nodeA && nodeB) {
                    const aDepenendsOnB = nodeA.dependencies.has(moduleB);
                    const bDependsOnA = nodeB.dependencies.has(moduleA);
                    if (aDepenendsOnB || bDependsOnA) {
                        conflicts.push({
                            type: 'same_phase_dependency',
                            moduleA,
                            moduleB,
                            relationship: aDepenendsOnB && bDependsOnA ? 'circular' : 'one_way'
                        });
                    }
                }
            }
        }
        return conflicts;
    }
    /**
     * Detect dependency ordering violations in installation plan
     * @param {Object} installationPlan - Installation plan
     * @param {Map} planGraph - Installation plan dependency graph
     * @returns {Array} - Array of violations
     */
    detectOrderingViolations(installationPlan, planGraph) {
        const violations = [];
        const moduleToPhase = new Map();
        // Build module to phase mapping
        for (const phase of installationPlan.phases || []) {
            const phaseNumber = phase.phase || 0;
            for (const moduleId of phase.modules || []) {
                moduleToPhase.set(moduleId, phaseNumber);
            }
        }
        // Check each module's dependencies
        for (const [moduleId, node] of planGraph) {
            const modulePhase = moduleToPhase.get(moduleId);
            for (const dependencyId of node.dependencies || []) {
                const dependencyPhase = moduleToPhase.get(dependencyId);
                // Dependency should be in an earlier phase
                if (dependencyPhase !== undefined && dependencyPhase >= modulePhase) {
                    violations.push({
                        type: 'dependency_ordering_violation',
                        module: moduleId,
                        dependency: dependencyId,
                        modulePhase,
                        dependencyPhase,
                        severity: dependencyPhase === modulePhase ? 'high' : 'medium'
                    });
                }
            }
        }
        return violations;
    }
    /**
     * Generate graph statistics
     * @returns {Object} - Graph statistics
     */
    generateGraphStatistics() {
        const stats = {
            totalModules: this.dependencyGraph.size,
            totalDependencies: 0,
            averageDependencies: 0,
            maxDependencies: 0,
            isolatedModules: 0,
            stronglyConnectedComponents: this.stronglyConnectedComponents.length
        };
        let dependencyCounts = [];
        for (const [moduleId, node] of this.dependencyGraph) {
            const depCount = node.dependencies ? node.dependencies.size : 0;
            dependencyCounts.push(depCount);
            stats.totalDependencies += depCount;
            stats.maxDependencies = Math.max(stats.maxDependencies, depCount);
            if (depCount === 0) {
                stats.isolatedModules++;
            }
        }
        stats.averageDependencies = stats.totalModules > 0
            ? Math.round((stats.totalDependencies / stats.totalModules) * 100) / 100
            : 0;
        return stats;
    }
    /**
     * Log detected cycles to console
     */
    logCycles() {
        console.warn('[Circular Detector] Detected Circular Dependencies:');
        for (let i = 0; i < this.cycles.length; i++) {
            const cycle = this.cycles[i];
            console.warn(`  ${i + 1}. [${cycle.severity.toUpperCase()}] ${cycle.modules.join(' → ')}`);
            console.warn(`     Length: ${cycle.length}, Type: ${cycle.type}`);
        }
        if (this.stronglyConnectedComponents.length > 0) {
            console.warn('[Circular Detector] Strongly Connected Components:');
            for (let i = 0; i < this.stronglyConnectedComponents.length; i++) {
                const scc = this.stronglyConnectedComponents[i];
                console.warn(`  ${i + 1}. Size: ${scc.size}, Modules: ${scc.modules.join(', ')}`);
            }
        }
    }
    /**
     * Export detected cycles to a file
     * @param {string} outputPath - Output file path
     * @param {string} format - Export format ('json' or 'yaml')
     */
    async exportCycles(outputPath, format = 'json') {
        const exportData = {
            timestamp: new Date().toISOString(),
            summary: {
                cycleCount: this.cycles.length,
                stronglyConnectedComponents: this.stronglyConnectedComponents.length,
                totalModules: this.dependencyGraph.size
            },
            cycles: this.cycles,
            stronglyConnectedComponents: this.stronglyConnectedComponents,
            resolutionStrategies: this.generateResolutionStrategies(),
            graphStatistics: this.generateGraphStatistics()
        };
        try {
            let content;
            if (format === 'yaml') {
                content = yaml.stringify(exportData, { indent: 2 });
            }
            else {
                content = JSON.stringify(exportData, null, 2);
            }
            await fs.writeFile(outputPath, content, 'utf8');
            console.log(`[Circular Detector] Exported cycle analysis to ${outputPath}`);
        }
        catch (error) {
            console.error(`[Circular Detector] Failed to export cycles: ${error.message}`);
            throw error;
        }
    }
    /**
     * Clear internal state
     */
    reset() {
        this.dependencyGraph.clear();
        this.visited.clear();
        this.recursionStack.clear();
        this.cycles = [];
        this.stronglyConnectedComponents = [];
    }
    /**
     * Get detection summary
     * @returns {Object} - Summary of detection results
     */
    getSummary() {
        return {
            cycleCount: this.cycles.length,
            stronglyConnectedComponents: this.stronglyConnectedComponents.length,
            hasCircularDependencies: this.cycles.length > 0,
            severityBreakdown: this.getSeverityBreakdown(),
            resolutionStrategiesAvailable: this.enableResolutionSuggestions
        };
    }
    /**
     * Get severity breakdown of detected cycles
     * @returns {Object} - Count of cycles by severity
     */
    getSeverityBreakdown() {
        const breakdown = { critical: 0, high: 0, medium: 0, low: 0 };
        for (const cycle of this.cycles) {
            if (breakdown.hasOwnProperty(cycle.severity)) {
                breakdown[cycle.severity]++;
            }
        }
        return breakdown;
    }
}
module.exports = BMADCircularDetector;
//# sourceMappingURL=bmad-circular-detection.js.map