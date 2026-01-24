/**
 * Cross-Module Communication Infrastructure
 * EPIC 1.2: Integration Test Repair
 * Amelia's Communication Protocol Testing Framework
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Cross-Module Communication Manager
 * Simulates real BMAD module communication protocols
 */
export class CrossModuleCommunicationManager {
  constructor() {
    this.modules = new Map();
    this.communicationResults = new Map();
    this.authTokens = new Map();
    this.baseDir = path.join(__dirname, '../../');

    // Module configuration cache
    this.moduleConfigs = new Map();

    // Communication paths to test (6 pairs)
    this.communicationPaths = [
      { source: 'intel-team', target: 'legal-team' },
      { source: 'intel-team', target: 'strategy-team' },
      { source: 'intel-team', target: 'cybersec-team' },
      { source: 'legal-team', target: 'strategy-team' },
      { source: 'legal-team', target: 'cybersec-team' },
      { source: 'strategy-team', target: 'cybersec-team' }
    ];
  }

  /**
   * Initialize all module configurations
   */
  async initialize() {
    console.log('🔄 Initializing Cross-Module Communication Manager');

    const moduleNames = ['intel-team', 'legal-team', 'strategy-team', 'cybersec-team', 'bmm', 'bmgd'];

    for (const moduleName of moduleNames) {
      try {
        const moduleConfig = await this.loadModuleConfig(moduleName);
        this.moduleConfigs.set(moduleName, moduleConfig);
        console.log(`  ✅ Loaded ${moduleName} configuration`);
      } catch (error) {
        console.log(`  ⚠️ Could not load ${moduleName}: ${error.message}`);
      }
    }
  }

  /**
   * Load module configuration from YAML
   */
  async loadModuleConfig(moduleName) {
    const examplePath = path.join(this.baseDir, `docs/reference/examples/${moduleName}-module.yaml.example`);

    try {
      const content = await fs.readFile(examplePath, 'utf8');
      return yaml.load(content);
    } catch (error) {
      // Fallback to _bmad directory
      const fallbackPath = path.join(this.baseDir, `_bmad/${moduleName}/module.yaml`);
      try {
        const content = await fs.readFile(fallbackPath, 'utf8');
        return yaml.load(content);
      } catch (fallbackError) {
        throw new Error(`Module ${moduleName} configuration not found in either location`);
      }
    }
  }

  /**
   * Generate JWT-like token for module authentication
   */
  generateAuthToken(sourceModule, targetModule) {
    const tokenData = {
      source: sourceModule,
      target: targetModule,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(7)
    };

    // Simulate JWT encoding (base64)
    const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');
    this.authTokens.set(`${sourceModule}->${targetModule}`, token);
    return token;
  }

  /**
   * Validate authentication token
   */
  validateAuthToken(token, sourceModule, targetModule) {
    try {
      const expectedToken = this.authTokens.get(`${sourceModule}->${targetModule}`);
      if (!expectedToken || expectedToken !== token) {
        return { valid: false, reason: 'Invalid or missing token' };
      }

      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
      const age = Date.now() - tokenData.timestamp;

      if (age > 300000) { // 5 minutes
        return { valid: false, reason: 'Token expired' };
      }

      return { valid: true, data: tokenData };
    } catch (error) {
      return { valid: false, reason: 'Token parsing error' };
    }
  }

  /**
   * Test cross-module communication for a specific path
   */
  async testCommunicationPath(sourceModule, targetModule) {
    const pathKey = `${sourceModule}->${targetModule}`;
    console.log(`\n🔗 Testing communication: ${pathKey}`);

    const result = {
      source: sourceModule,
      target: targetModule,
      success: false,
      duration: 0,
      authSuccess: false,
      workflowsExposed: 0,
      workflowsConsumed: 0,
      errors: [],
      warnings: []
    };

    const startTime = performance.now();

    try {
      // 1. Load module configurations
      const sourceConfig = this.moduleConfigs.get(sourceModule);
      const targetConfig = this.moduleConfigs.get(targetModule);

      if (!sourceConfig) {
        throw new Error(`Source module ${sourceModule} configuration not available`);
      }
      if (!targetConfig) {
        throw new Error(`Target module ${targetModule} configuration not available`);
      }

      // 2. Test authentication
      const authToken = this.generateAuthToken(sourceModule, targetModule);
      const authValidation = this.validateAuthToken(authToken, sourceModule, targetModule);
      result.authSuccess = authValidation.valid;

      if (!authValidation.valid) {
        result.errors.push(`Authentication failed: ${authValidation.reason}`);
      }

      // 3. Check exposed workflows in target module
      const exposedWorkflows = targetConfig?.integration?.exposed_workflows || [];
      result.workflowsExposed = exposedWorkflows.length;

      if (exposedWorkflows.length === 0) {
        result.warnings.push(`${targetModule} has no exposed workflows for cross-module integration`);
      }

      // 4. Check consumed workflows in source module
      const consumedWorkflows = sourceConfig?.integration?.consumed_workflows || [];
      const relevantConsumed = consumedWorkflows.filter(w => w.source_team === targetModule);
      result.workflowsConsumed = relevantConsumed.length;

      // 5. Simulate workflow invocation
      if (exposedWorkflows.length > 0) {
        await this.simulateWorkflowInvocation(sourceModule, targetModule, exposedWorkflows[0]);
      }

      // 6. Check dependencies
      const dependencies = sourceConfig?.dependencies?.peer_dependencies || [];
      const targetDependency = dependencies.find(dep =>
        dep.module.includes(targetModule) || dep.module.includes(`@bmad-cybercommand/${targetModule}`)
      );

      if (targetDependency && !targetDependency.required) {
        result.warnings.push('Optional dependency - integration may be limited');
      }

      // 7. Calculate success
      const authOk = result.authSuccess;
      const hasIntegration = result.workflowsExposed > 0 || result.workflowsConsumed > 0;
      const noErrors = result.errors.length === 0;

      result.success = authOk && hasIntegration && noErrors;

      console.log(`  Auth: ${authOk ? '✅' : '❌'} | Exposed: ${result.workflowsExposed} | Consumed: ${result.workflowsConsumed} | Errors: ${result.errors.length}`);

    } catch (error) {
      result.errors.push(error.message);
      console.log(`  ❌ Error: ${error.message}`);
    }

    result.duration = performance.now() - startTime;
    this.communicationResults.set(pathKey, result);

    return result;
  }

  /**
   * Simulate workflow invocation between modules
   */
  async simulateWorkflowInvocation(sourceModule, targetModule, workflow) {
    // Simulate network delay and processing
    const delay = Math.random() * 50 + 10; // 10-60ms
    await new Promise(resolve => setTimeout(resolve, delay));

    // Simulate workflow execution based on access level
    if (workflow.access_level === 'cross_team') {
      return {
        workflowId: workflow.workflow_id,
        status: 'success',
        executionTime: delay,
        result: `${targetModule} workflow executed successfully by ${sourceModule}`
      };
    } else {
      throw new Error(`Workflow ${workflow.workflow_id} not accessible for cross-team invocation`);
    }
  }

  /**
   * Test all 6 communication paths
   */
  async testAllCommunicationPaths() {
    console.log('\n🚀 Testing all cross-module communication paths');

    const results = [];

    for (const path of this.communicationPaths) {
      const result = await this.testCommunicationPath(path.source, path.target);
      results.push(result);
    }

    return results;
  }

  /**
   * Generate communication test report
   */
  generateReport() {
    const results = Array.from(this.communicationResults.values());
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    const successRate = (successful / total) * 100;

    const report = {
      timestamp: new Date().toISOString(),
      totalPaths: total,
      successfulPaths: successful,
      failedPaths: total - successful,
      successRate: Math.round(successRate),
      averageDuration: Math.round(results.reduce((sum, r) => sum + r.duration, 0) / total),
      results: Object.fromEntries(this.communicationResults),
      summary: {
        authenticationWorking: results.every(r => r.authSuccess),
        allPathsOperational: successful === total,
        performanceAcceptable: results.every(r => r.duration < 1000),
        integrationCoverage: results.reduce((sum, r) => sum + r.workflowsExposed + r.workflowsConsumed, 0)
      }
    };

    return report;
  }

  /**
   * Get detailed status for all paths
   */
  getDetailedStatus() {
    return {
      communicationPaths: this.communicationPaths.map(path => {
        const key = `${path.source}->${path.target}`;
        const result = this.communicationResults.get(key);
        return {
          ...path,
          tested: !!result,
          success: result?.success || false,
          duration: result?.duration || 0,
          errors: result?.errors || [],
          warnings: result?.warnings || []
        };
      }),
      moduleStatus: Array.from(this.moduleConfigs.keys()).map(moduleName => {
        const config = this.moduleConfigs.get(moduleName);
        return {
          module: moduleName,
          loaded: !!config,
          agentCount: config?.agents?.count || 0,
          workflowCount: config?.workflows?.count || 0,
          hasIntegration: !!config?.integration,
          exposedWorkflows: config?.integration?.exposed_workflows?.length || 0,
          consumedWorkflows: config?.integration?.consumed_workflows?.length || 0
        };
      })
    };
  }
}

/**
 * REST API Simulation Layer
 */
export class RestApiSimulator {
  constructor() {
    this.endpoints = new Map();
    this.requestLog = [];
    this.responseDelay = 50; // 50ms default delay
  }

  /**
   * Register API endpoint for a module
   */
  registerEndpoint(module, endpoint, handler) {
    const fullPath = `/${module}/api/v1/${endpoint}`;
    this.endpoints.set(fullPath, { module, endpoint, handler });
  }

  /**
   * Simulate HTTP request
   */
  async simulateRequest(method, path, data = null, headers = {}) {
    const request = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      method: method.toUpperCase(),
      path,
      data,
      headers
    };

    this.requestLog.push(request);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, this.responseDelay));

    const endpoint = this.endpoints.get(path);
    if (!endpoint) {
      return {
        status: 404,
        error: 'Endpoint not found',
        message: `No handler registered for ${method} ${path}`
      };
    }

    try {
      // Check authentication if required
      if (!headers.authorization && endpoint.endpoint !== 'health') {
        return {
          status: 401,
          error: 'Authentication required',
          message: 'Missing authorization header'
        };
      }

      // Validate token format if provided
      if (headers.authorization) {
        if (!headers.authorization.startsWith('Bearer ')) {
          return {
            status: 401,
            error: 'Invalid authorization format',
            message: 'Authorization must be in Bearer token format'
          };
        }

        const token = headers.authorization.substring(7);
        if (token === 'invalid-token' || token.length < 10) {
          return {
            status: 403,
            error: 'Invalid token',
            message: 'Token validation failed'
          };
        }
      }

      // Execute handler
      const result = await endpoint.handler(data, headers, request);
      return {
        status: 200,
        data: result,
        requestId: request.id
      };
    } catch (error) {
      return {
        status: 500,
        error: 'Internal server error',
        message: error.message,
        requestId: request.id
      };
    }
  }

  /**
   * Setup default module endpoints
   */
  setupDefaultEndpoints() {
    const modules = ['intel-team', 'legal-team', 'strategy-team', 'cybersec-team', 'bmm', 'bmgd'];

    for (const module of modules) {
      // Health check endpoint
      this.registerEndpoint(module, 'health', async () => {
        return { status: 'healthy', module, timestamp: Date.now() };
      });

      // Workflow trigger endpoint
      this.registerEndpoint(module, 'workflows/trigger', async (data) => {
        if (!data?.workflowId) {
          throw new Error('workflowId is required');
        }
        return {
          workflowId: data.workflowId,
          status: 'triggered',
          executionId: `exec_${Date.now()}`,
          estimatedDuration: Math.random() * 5000 + 1000 // 1-6 seconds
        };
      });

      // Agent consultation endpoint
      this.registerEndpoint(module, 'agents/consult', async (data) => {
        if (!data?.agentId) {
          throw new Error('agentId is required');
        }
        return {
          agentId: data.agentId,
          consultation: `Mock consultation response from ${module}`,
          confidence: Math.random() * 0.5 + 0.5, // 50-100%
          timestamp: Date.now()
        };
      });
    }
  }

  /**
   * Get request statistics
   */
  getRequestStats() {
    const successfulRequests = this.requestLog.filter(r => !r.error).length;
    const totalRequests = this.requestLog.length;

    return {
      totalRequests,
      successfulRequests,
      failedRequests: totalRequests - successfulRequests,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      averageResponseTime: this.responseDelay,
      endpointsRegistered: this.endpoints.size
    };
  }
}

// Export for testing
export default { CrossModuleCommunicationManager, RestApiSimulator };