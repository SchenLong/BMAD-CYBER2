# BMAD-CYBER2 Debugging & Troubleshooting Guide

> **Comprehensive Developer Support for Common Issues**
> **Version:** 1.0.0
> **Last Updated:** January 24, 2026
> **Author:** Amelia, The Developer

---

## Quick Reference

### Emergency Support Contacts
- **🚨 Critical Issues**: +1-800-BMAD-911
- **Technical Support**: support@bmad.code
- **Architecture Consultation**: architects@bmad.code
- **Documentation Issues**: docs@bmad.code

### Common Solutions (30-Second Fixes)

| Problem | Solution |
|---------|----------|
| **API Authentication Failed** | Check `BMAD_API_KEY` environment variable |
| **Module Installation Stuck** | Restart with `enableRollback: true` |
| **Workflow Timeout** | Increase timeout to 300+ seconds |
| **Rate Limit Exceeded** | Implement exponential backoff |
| **Memory Usage High** | Add connection pooling and cleanup |

---

## Table of Contents

1. [Authentication & Authorization Issues](#authentication--authorization-issues)
2. [Module Installation Problems](#module-installation-problems)
3. [Workflow Execution Failures](#workflow-execution-failures)
4. [Security Testing Issues](#security-testing-issues)
5. [Abdul Orchestration Problems](#abdul-orchestration-problems)
6. [Performance & Memory Issues](#performance--memory-issues)
7. [Network & Connectivity Problems](#network--connectivity-problems)
8. [Error Code Reference](#error-code-reference)
9. [Debug Configuration](#debug-configuration)
10. [Monitoring & Logging](#monitoring--logging)
11. [Advanced Troubleshooting](#advanced-troubleshooting)

---

## Authentication & Authorization Issues

### Problem: API Authentication Failed (401)

**Symptoms:**
```
BmadApiError: Authentication failed
Status: 401
Code: INVALID_API_KEY
```

**Root Causes:**
1. Missing or incorrect API key
2. Expired API key
3. API key not properly configured
4. Wrong environment (staging vs production)

**Solutions:**

#### 1. Verify API Key Configuration
```typescript
// ✅ Correct: Load from environment
const client = new BmadClient({
  apiKey: process.env.BMAD_API_KEY,  // Never hardcode!
  baseUrl: process.env.BMAD_BASE_URL
});

// ❌ Wrong: Hardcoded API key
const client = new BmadClient({
  apiKey: 'bmad_api_key_hardcoded_123'  // Security risk!
});
```

#### 2. Check Environment Variables
```bash
# Verify environment variables are set
echo $BMAD_API_KEY
echo $BMAD_BASE_URL

# If missing, set them:
export BMAD_API_KEY="your-actual-api-key"
export BMAD_BASE_URL="https://api.bmad-enterprise.com/v2"
```

#### 3. Test API Key Validity
```typescript
async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const client = new BmadClient({ apiKey });
    await client.health.check();
    console.log('✅ API key is valid');
    return true;
  } catch (error) {
    if (error instanceof BmadApiError && error.statusCode === 401) {
      console.error('❌ API key is invalid or expired');
      return false;
    }
    throw error;
  }
}

// Usage
const isValid = await validateApiKey(process.env.BMAD_API_KEY);
```

#### 4. API Key Rotation
```typescript
// If API key is expired, rotate it
async function rotateApiKey(client: BmadClient): Promise<string> {
  try {
    const newCredentials = await client.auth.rotateApiKey();

    // Update environment variable (in production, use secret manager)
    process.env.BMAD_API_KEY = newCredentials.apiKey;

    console.log('✅ API key rotated successfully');
    return newCredentials.apiKey;
  } catch (error) {
    console.error('❌ Failed to rotate API key:', error.message);
    throw error;
  }
}
```

### Problem: Insufficient Permissions (403)

**Symptoms:**
```
BmadApiError: Insufficient permissions
Status: 403
Code: INSUFFICIENT_PERMISSIONS
```

**Solutions:**

#### 1. Check Required Permissions
```typescript
async function checkPermissions(client: BmadClient, operation: string): Promise<void> {
  try {
    const permissions = await client.auth.getPermissions();

    const requiredPermissions = {
      'module_installation': ['modules:install', 'modules:read'],
      'security_testing': ['security:test', 'security:read'],
      'workflow_execution': ['workflows:execute', 'workflows:read'],
      'abdul_orchestration': ['orchestration:request', 'teams:coordinate']
    };

    const required = requiredPermissions[operation] || [];
    const missing = required.filter(perm => !permissions.includes(perm));

    if (missing.length > 0) {
      console.error(`❌ Missing permissions for ${operation}:`, missing);
      console.log('Contact your administrator to grant these permissions');
    } else {
      console.log(`✅ All permissions available for ${operation}`);
    }
  } catch (error) {
    console.error('Failed to check permissions:', error.message);
  }
}
```

#### 2. Request Permission Elevation
```typescript
async function requestPermissionElevation(
  client: BmadClient,
  requiredPermissions: string[],
  justification: string
): Promise<void> {
  try {
    const request = await client.auth.requestPermissions({
      permissions: requiredPermissions,
      justification,
      temporaryElevation: true,
      duration: '24h'
    });

    console.log('✅ Permission elevation requested:', request.requestId);
    console.log('Wait for administrator approval');
  } catch (error) {
    console.error('❌ Permission elevation failed:', error.message);
  }
}
```

---

## Module Installation Problems

### Problem: Installation Stuck or Hanging

**Symptoms:**
- Installation progress at 0% for extended period
- No progress updates for 5+ minutes
- Process appears hung

**Diagnostic Steps:**

#### 1. Check Installation Status
```typescript
async function diagnoseInstallation(
  client: BmadClient,
  installationId: string
): Promise<void> {
  try {
    const status = await client.installation.getStatus(installationId);

    console.log('Installation Diagnostic Report:');
    console.log(`Status: ${status.status}`);
    console.log(`Progress: ${status.progress?.percentage || 0}%`);
    console.log(`Current Step: ${status.progress?.currentStep || 'Unknown'}`);
    console.log(`Last Updated: ${status.updatedAt}`);

    // Check if stuck
    const lastUpdate = new Date(status.updatedAt);
    const timeSinceUpdate = Date.now() - lastUpdate.getTime();

    if (timeSinceUpdate > 300000) { // 5 minutes
      console.warn('⚠️ Installation appears stuck');
      await troubleshootStuckInstallation(client, installationId, status);
    }

  } catch (error) {
    console.error('Failed to get installation status:', error.message);
  }
}

async function troubleshootStuckInstallation(
  client: BmadClient,
  installationId: string,
  status: any
): Promise<void> {
  console.log('🔧 Troubleshooting stuck installation...');

  // Check system health
  try {
    const health = await client.health.check();
    if (health.status !== 'healthy') {
      console.error('❌ BMAD system is not healthy:', health);
      return;
    }
  } catch (error) {
    console.error('❌ System health check failed:', error.message);
    return;
  }

  // Check for dependency conflicts
  if (status.progress?.currentStep?.includes('dependencies')) {
    console.log('🔍 Checking for dependency conflicts...');
    await checkDependencyConflicts(client, installationId);
  }

  // Attempt installation restart
  console.log('🔄 Attempting to restart installation...');
  await restartInstallation(client, installationId);
}
```

#### 2. Dependency Conflict Resolution
```typescript
async function checkDependencyConflicts(
  client: BmadClient,
  installationId: string
): Promise<void> {
  try {
    const conflicts = await client.installation.checkConflicts(installationId);

    if (conflicts.length === 0) {
      console.log('✅ No dependency conflicts found');
      return;
    }

    console.warn('⚠️ Dependency conflicts detected:');
    conflicts.forEach(conflict => {
      console.log(`  - ${conflict.module}: ${conflict.description}`);
      console.log(`    Resolution: ${conflict.suggestedResolution}`);
    });

    // Auto-resolve if possible
    const autoResolvable = conflicts.filter(c => c.autoResolvable);
    if (autoResolvable.length > 0) {
      console.log('🔧 Auto-resolving conflicts...');
      await client.installation.resolveConflicts(installationId, {
        conflicts: autoResolvable.map(c => c.id),
        strategy: 'auto'
      });
    }

  } catch (error) {
    console.error('Failed to check dependency conflicts:', error.message);
  }
}
```

#### 3. Installation Recovery
```typescript
async function restartInstallation(
  client: BmadClient,
  installationId: string
): Promise<void> {
  try {
    console.log('🔄 Attempting installation recovery...');

    const recovery = await client.installation.recover(installationId, {
      strategy: 'restart_from_last_checkpoint',
      cleanupPartialState: true,
      enableVerboseLogging: true
    });

    console.log('✅ Installation recovery initiated:', recovery.recoveryId);

    // Monitor recovery progress
    await monitorRecovery(client, recovery.recoveryId);

  } catch (error) {
    console.error('❌ Installation recovery failed:', error.message);

    // Last resort: complete rollback
    await rollbackInstallation(client, installationId);
  }
}

async function rollbackInstallation(
  client: BmadClient,
  installationId: string
): Promise<void> {
  try {
    console.log('⏮️ Initiating installation rollback...');

    const rollback = await client.installation.rollback(installationId, {
      preserveUserData: true,
      createRecoveryPoint: true,
      cleanupArtifacts: true
    });

    console.log('✅ Rollback completed:', rollback.rollbackId);

  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    console.log('Manual intervention required - contact support');
  }
}
```

### Problem: Module Installation Fails

**Symptoms:**
```
BmadApiError: Installation failed
Status: 422
Code: INSTALLATION_FAILED
```

**Common Causes & Solutions:**

#### 1. Insufficient Disk Space
```typescript
async function checkDiskSpace(client: BmadClient): Promise<void> {
  try {
    const resources = await client.system.getResources();

    console.log('System Resources:');
    console.log(`Disk Space: ${resources.disk.available}GB available`);
    console.log(`Memory: ${resources.memory.available}MB available`);
    console.log(`CPU: ${resources.cpu.usage}% usage`);

    if (resources.disk.available < 5) { // Less than 5GB
      console.error('❌ Insufficient disk space for installation');
      console.log('Free up disk space and retry installation');
    }

  } catch (error) {
    console.error('Failed to check system resources:', error.message);
  }
}
```

#### 2. Network Connectivity Issues
```typescript
async function checkNetworkConnectivity(client: BmadClient): Promise<void> {
  const endpoints = [
    'https://api.bmad-enterprise.com/v2/health',
    'https://cdn.bmad.code/modules/',
    'https://registry.bmad.code/v2/'
  ];

  console.log('🌐 Testing network connectivity...');

  for (const endpoint of endpoints) {
    try {
      const start = Date.now();
      const response = await fetch(endpoint, {
        method: 'HEAD',
        timeout: 5000
      });
      const duration = Date.now() - start;

      if (response.ok) {
        console.log(`✅ ${endpoint} - ${duration}ms`);
      } else {
        console.warn(`⚠️ ${endpoint} - HTTP ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ ${endpoint} - ${error.message}`);
    }
  }
}
```

---

## Workflow Execution Failures

### Problem: Workflow Timeout

**Symptoms:**
```
BmadTimeoutError: Workflow execution timed out
Timeout: 30000ms
```

**Solutions:**

#### 1. Increase Timeout for Complex Workflows
```typescript
// ❌ Default timeout (too short for complex workflows)
const result = await client.workflows.execute('intel-team:comprehensive-investigation', {
  target: 'complex-target.com'
});

// ✅ Increased timeout for complex operations
const result = await client.workflows.execute('intel-team:comprehensive-investigation', {
  target: 'complex-target.com'
}, {
  timeout: 600000, // 10 minutes
  priority: 'high'
});
```

#### 2. Implement Timeout Handling with Retry
```typescript
async function executeWorkflowWithRetry(
  client: BmadClient,
  workflowId: string,
  parameters: any,
  options: {
    maxRetries?: number;
    timeoutMultiplier?: number;
    backoffMs?: number;
  } = {}
): Promise<any> {
  const {
    maxRetries = 3,
    timeoutMultiplier = 1.5,
    backoffMs = 5000
  } = options;

  let currentTimeout = 60000; // Start with 1 minute

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${maxRetries} (timeout: ${currentTimeout}ms)`);

      const result = await client.workflows.execute(workflowId, parameters, {
        timeout: currentTimeout,
        priority: attempt > 0 ? 'high' : 'normal' // Increase priority on retry
      });

      return result;

    } catch (error) {
      if (error instanceof BmadTimeoutError) {
        console.warn(`⏱️ Timeout on attempt ${attempt + 1}`);

        if (attempt < maxRetries - 1) {
          currentTimeout = Math.floor(currentTimeout * timeoutMultiplier);
          console.log(`Retrying in ${backoffMs}ms with timeout ${currentTimeout}ms`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      } else {
        // Non-timeout error, don't retry
        throw error;
      }
    }
  }

  throw new Error(`Workflow failed after ${maxRetries} attempts`);
}
```

#### 3. Monitor Long-Running Workflows
```typescript
async function monitorLongRunningWorkflow(
  client: BmadClient,
  executionId: string
): Promise<any> {
  console.log(`📊 Monitoring workflow execution: ${executionId}`);

  const startTime = Date.now();
  let lastProgressUpdate = Date.now();

  while (true) {
    try {
      const status = await client.workflows.getStatus(executionId);

      console.log(`Status: ${status.status} | Progress: ${status.progress?.percentage || 0}%`);

      if (status.status === 'completed') {
        console.log('✅ Workflow completed successfully');
        return status.result;
      }

      if (status.status === 'failed') {
        console.error('❌ Workflow failed:', status.error);
        throw new Error(`Workflow failed: ${status.error}`);
      }

      // Check for progress stagnation
      if (status.progress?.percentage) {
        lastProgressUpdate = Date.now();
      } else if (Date.now() - lastProgressUpdate > 300000) { // 5 minutes without progress
        console.warn('⚠️ Workflow appears stuck');

        // Attempt to nudge the workflow
        await client.workflows.nudge(executionId);
      }

      // Check overall timeout (30 minutes for very complex workflows)
      if (Date.now() - startTime > 1800000) {
        console.error('❌ Workflow exceeded maximum execution time');
        await client.workflows.cancel(executionId);
        throw new Error('Workflow exceeded maximum execution time');
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds

    } catch (error) {
      if (error.message.includes('not found')) {
        console.error('❌ Workflow execution not found - may have been cleaned up');
        throw error;
      }

      console.warn('⚠️ Status check failed, retrying...', error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}
```

### Problem: Workflow Parameter Validation Errors

**Symptoms:**
```
BmadApiError: Invalid workflow parameters
Status: 400
Code: INVALID_PARAMETERS
```

**Solutions:**

#### 1. Parameter Validation Utility
```typescript
interface WorkflowParameterSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required: boolean;
    validation?: RegExp;
    allowedValues?: any[];
    description: string;
  };
}

class WorkflowParameterValidator {
  private schemas: Map<string, WorkflowParameterSchema> = new Map();

  constructor() {
    this.initializeSchemas();
  }

  private initializeSchemas(): void {
    // Define parameter schemas for common workflows
    this.schemas.set('cybersec-team:threat-analysis', {
      target: {
        type: 'string',
        required: true,
        validation: /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        description: 'Domain name or IP address to analyze'
      },
      depth: {
        type: 'string',
        required: false,
        allowedValues: ['basic', 'standard', 'comprehensive', 'exhaustive'],
        description: 'Analysis depth level'
      },
      includeSubdomains: {
        type: 'boolean',
        required: false,
        description: 'Whether to include subdomain analysis'
      }
    });

    this.schemas.set('intel-team:attribution-chain', {
      indicators: {
        type: 'array',
        required: true,
        description: 'Array of indicators of compromise'
      },
      timeframe: {
        type: 'string',
        required: false,
        validation: /^\d+[hdwmy]$/,
        description: 'Analysis timeframe (e.g., 7d, 2w, 1m)'
      }
    });
  }

  validate(workflowId: string, parameters: any): ValidationResult {
    const schema = this.schemas.get(workflowId);
    if (!schema) {
      return {
        valid: true,
        errors: [],
        warnings: [`No validation schema defined for workflow: ${workflowId}`]
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required parameters
    for (const [paramName, paramSchema] of Object.entries(schema)) {
      if (paramSchema.required && !(paramName in parameters)) {
        errors.push(`Missing required parameter: ${paramName}`);
      }
    }

    // Validate parameter types and values
    for (const [paramName, paramValue] of Object.entries(parameters)) {
      const paramSchema = schema[paramName];
      if (!paramSchema) {
        warnings.push(`Unknown parameter: ${paramName}`);
        continue;
      }

      // Type validation
      if (typeof paramValue !== paramSchema.type) {
        errors.push(`Parameter ${paramName} must be of type ${paramSchema.type}`);
        continue;
      }

      // Regex validation
      if (paramSchema.validation && typeof paramValue === 'string') {
        if (!paramSchema.validation.test(paramValue)) {
          errors.push(`Parameter ${paramName} format is invalid`);
        }
      }

      // Allowed values validation
      if (paramSchema.allowedValues && !paramSchema.allowedValues.includes(paramValue)) {
        errors.push(`Parameter ${paramName} must be one of: ${paramSchema.allowedValues.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Usage example
async function executeWorkflowWithValidation(
  client: BmadClient,
  workflowId: string,
  parameters: any
): Promise<any> {
  const validator = new WorkflowParameterValidator();
  const validation = validator.validate(workflowId, parameters);

  if (!validation.valid) {
    console.error('❌ Parameter validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Invalid workflow parameters');
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️ Parameter validation warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  return client.workflows.execute(workflowId, parameters);
}
```

---

## Security Testing Issues

### Problem: Security Test Hangs or Takes Too Long

**Symptoms:**
- Security test running for 30+ minutes without completion
- No progress updates
- High CPU/memory usage

**Solutions:**

#### 1. Optimize Security Test Configuration
```typescript
async function runOptimizedSecurityTest(
  client: BmadClient,
  targets: string[]
): Promise<any> {
  try {
    // Use incremental testing approach
    const testConfig = {
      target: {
        modules: targets,
        scope: 'focused' // Start with focused testing
      },
      options: {
        attackVectors: ['direct_prompt_injection'], // Start with one vector
        intensity: 'standard', // Don't start with comprehensive
        timeout: 300, // 5 minutes maximum
        earlyTermination: true, // Stop on first critical finding
        parallelExecution: false // Avoid resource contention
      }
    };

    console.log('🔍 Running optimized security test...');
    const result = await client.security.runTest(testConfig);

    // If basic test passes, gradually expand
    if (result.overallScore > 80) {
      console.log('✅ Basic security test passed, expanding scope...');
      return await runExpandedSecurityTest(client, targets, result);
    }

    return result;

  } catch (error) {
    console.error('❌ Security test failed:', error.message);
    throw error;
  }
}

async function runExpandedSecurityTest(
  client: BmadClient,
  targets: string[],
  previousResult: any
): Promise<any> {
  const expandedConfig = {
    target: {
      modules: targets,
      scope: 'comprehensive'
    },
    options: {
      attackVectors: ['direct_prompt_injection', 'role_hijacking', 'encoded_payload_bypass'],
      intensity: 'comprehensive',
      timeout: 600, // 10 minutes
      excludeKnownGoodFindings: true,
      buildOnPreviousResult: previousResult.testId
    }
  };

  return client.security.runTest(expandedConfig);
}
```

#### 2. Security Test Monitoring and Intervention
```typescript
async function monitorSecurityTest(
  client: BmadClient,
  testId: string
): Promise<void> {
  console.log(`🔍 Monitoring security test: ${testId}`);

  const startTime = Date.now();
  let lastUpdate = Date.now();

  while (true) {
    try {
      const status = await client.security.getTestStatus(testId);

      console.log(`Vector: ${status.currentVector} | Progress: ${status.progress}%`);

      if (status.status === 'completed') {
        console.log('✅ Security test completed');
        break;
      }

      if (status.status === 'failed') {
        console.error('❌ Security test failed:', status.error);
        break;
      }

      // Check for hanging test
      if (Date.now() - lastUpdate > 180000) { // 3 minutes without update
        console.warn('⚠️ Security test appears stuck');

        // Try to get more detailed status
        const detailed = await client.security.getDetailedStatus(testId);
        console.log('Detailed status:', detailed);

        // Consider cancelling if truly stuck
        if (Date.now() - startTime > 900000) { // 15 minutes total
          console.warn('🛑 Cancelling stuck security test');
          await client.security.cancelTest(testId);
          break;
        }
      }

      lastUpdate = Date.now();
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds

    } catch (error) {
      console.error('Failed to get security test status:', error.message);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}
```

### Problem: False Positive Security Findings

**Symptoms:**
- Security test reports vulnerabilities that don't actually exist
- High number of low-confidence findings
- Same finding reported multiple times

**Solutions:**

#### 1. Configure Finding Filters
```typescript
interface SecurityFindingFilter {
  minimumConfidence: number;
  excludeCategories: string[];
  excludeCVEs: string[];
  suppressDuplicates: boolean;
  customRules: FilterRule[];
}

interface FilterRule {
  condition: string;
  action: 'suppress' | 'reduce_severity' | 'flag_for_review';
  justification: string;
}

async function runFilteredSecurityTest(
  client: BmadClient,
  targets: string[]
): Promise<any> {
  const filters: SecurityFindingFilter = {
    minimumConfidence: 0.7, // Only findings with 70%+ confidence
    excludeCategories: ['informational', 'false_positive_prone'],
    excludeCVEs: ['CVE-2019-12345'], // Known false positives
    suppressDuplicates: true,
    customRules: [
      {
        condition: 'finding.title.includes("test environment")',
        action: 'suppress',
        justification: 'Test environment findings not relevant for production'
      },
      {
        condition: 'finding.severity === "low" && finding.confidence < 0.8',
        action: 'suppress',
        justification: 'Low severity, low confidence findings cause noise'
      }
    ]
  };

  const result = await client.security.runTest({
    target: { modules: targets },
    options: {
      attackVectors: 'all',
      filters,
      generateEvidence: true, // Include evidence for manual review
      enableHumanReview: true // Flag uncertain findings for human review
    }
  });

  // Post-process findings
  const processedFindings = await postProcessFindings(result.findings, filters);

  return {
    ...result,
    findings: processedFindings,
    suppressedFindings: result.findings.length - processedFindings.length
  };
}

async function postProcessFindings(
  findings: any[],
  filters: SecurityFindingFilter
): Promise<any[]> {
  return findings.filter(finding => {
    // Apply confidence threshold
    if (finding.confidence < filters.minimumConfidence) {
      return false;
    }

    // Apply category filters
    if (filters.excludeCategories.includes(finding.category)) {
      return false;
    }

    // Apply custom rules
    for (const rule of filters.customRules) {
      if (evaluateCondition(rule.condition, finding)) {
        if (rule.action === 'suppress') {
          return false;
        } else if (rule.action === 'reduce_severity') {
          finding.severity = reduceSeverity(finding.severity);
        }
      }
    }

    return true;
  });
}

function evaluateCondition(condition: string, finding: any): boolean {
  // Simplified condition evaluation (use proper expression parser in production)
  return eval(condition.replace('finding.', 'finding.'));
}

function reduceSeverity(severity: string): string {
  const severityMap = { 'critical': 'high', 'high': 'medium', 'medium': 'low' };
  return severityMap[severity] || severity;
}
```

---

## Abdul Orchestration Problems

### Problem: Abdul Requests Timeout or No Response

**Symptoms:**
```
BmadTimeoutError: Abdul orchestration request timed out
Timeout: 300000ms
```

**Solutions:**

#### 1. Implement Abdul Request with Fallback
```typescript
async function requestAbdulWithFallback(
  client: BmadClient,
  request: any,
  options: {
    timeoutMs?: number;
    fallbackStrategy?: 'manual' | 'simplified' | 'defer';
    maxRetries?: number;
  } = {}
): Promise<any> {
  const {
    timeoutMs = 300000, // 5 minutes
    fallbackStrategy = 'simplified',
    maxRetries = 3
  } = options;

  console.log('🤖 Requesting Abdul orchestration...');

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await Promise.race([
        client.orchestration.requestAbdul(request),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Abdul request timeout')), timeoutMs)
        )
      ]);

      console.log('✅ Abdul orchestration successful');
      return response;

    } catch (error) {
      console.warn(`⚠️ Abdul request attempt ${attempt + 1} failed:`, error.message);

      if (attempt === maxRetries - 1) {
        console.log('🔄 Applying fallback strategy:', fallbackStrategy);
        return await applyAbdulFallback(request, fallbackStrategy);
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 5000 * (attempt + 1)));
    }
  }
}

async function applyAbdulFallback(
  request: any,
  strategy: string
): Promise<any> {
  switch (strategy) {
    case 'manual':
      return {
        orchestrationId: `manual-${Date.now()}`,
        status: 'manual_mode',
        recommendations: ['Manual coordination required due to Abdul unavailability'],
        teamAssignments: await generateBasicTeamAssignments(request),
        fallbackMode: true
      };

    case 'simplified':
      return await generateSimplifiedOrchestration(request);

    case 'defer':
      return {
        orchestrationId: `deferred-${Date.now()}`,
        status: 'deferred',
        message: 'Request queued for later processing',
        estimatedProcessingTime: '1 hour'
      };

    default:
      throw new Error('Unknown fallback strategy');
  }
}

async function generateBasicTeamAssignments(request: any): Promise<any[]> {
  // Basic team assignment logic when Abdul is unavailable
  const assignments = [];

  if (request.type === 'crisis_response') {
    assignments.push(
      { teamId: 'cybersec-team', role: 'incident_response', priority: 1 },
      { teamId: 'legal-team', role: 'compliance_review', priority: 2 },
      { teamId: 'strategy-team', role: 'communication', priority: 3 }
    );
  }

  return assignments;
}
```

#### 2. Abdul Health Monitoring
```typescript
async function monitorAbdulHealth(client: BmadClient): Promise<void> {
  try {
    const health = await client.orchestration.getAbdulHealth();

    console.log('Abdul Health Status:');
    console.log(`Status: ${health.status}`);
    console.log(`Load: ${health.currentLoad}/${health.maxCapacity}`);
    console.log(`Average Response Time: ${health.averageResponseTime}ms`);
    console.log(`Active Sessions: ${health.activeSessions}`);

    if (health.status !== 'healthy') {
      console.warn('⚠️ Abdul is not operating at full capacity');

      if (health.status === 'overloaded') {
        console.log('💡 Consider using simplified orchestration or deferring non-urgent requests');
      }

      if (health.status === 'degraded') {
        console.log('💡 Expect longer response times, consider timeouts');
      }
    }

  } catch (error) {
    console.error('Failed to check Abdul health:', error.message);
  }
}
```

---

## Performance & Memory Issues

### Problem: High Memory Usage

**Symptoms:**
- Node.js process consuming excessive memory
- Memory leaks during long-running operations
- Out of memory errors

**Solutions:**

#### 1. Memory Usage Monitoring
```typescript
class MemoryMonitor {
  private startMemory: NodeJS.MemoryUsage;
  private checkpoints: Array<{ name: string; memory: NodeJS.MemoryUsage; timestamp: number }> = [];

  constructor() {
    this.startMemory = process.memoryUsage();
  }

  checkpoint(name: string): void {
    const memory = process.memoryUsage();
    const timestamp = Date.now();

    this.checkpoints.push({ name, memory, timestamp });

    const diffFromStart = {
      rss: memory.rss - this.startMemory.rss,
      heapUsed: memory.heapUsed - this.startMemory.heapUsed,
      heapTotal: memory.heapTotal - this.startMemory.heapTotal,
      external: memory.external - this.startMemory.external
    };

    console.log(`📊 Memory checkpoint "${name}":`);
    console.log(`  RSS: ${(memory.rss / 1024 / 1024).toFixed(2)}MB (${this.formatDiff(diffFromStart.rss)})`);
    console.log(`  Heap Used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB (${this.formatDiff(diffFromStart.heapUsed)})`);
    console.log(`  Heap Total: ${(memory.heapTotal / 1024 / 1024).toFixed(2)}MB (${this.formatDiff(diffFromStart.heapTotal)})`);
    console.log(`  External: ${(memory.external / 1024 / 1024).toFixed(2)}MB (${this.formatDiff(diffFromStart.external)})`);

    // Warn if memory usage is high
    if (memory.heapUsed > 500 * 1024 * 1024) { // 500MB
      console.warn('⚠️ High memory usage detected');
      this.suggestOptimizations();
    }
  }

  private formatDiff(bytes: number): string {
    const mb = bytes / 1024 / 1024;
    return `${mb > 0 ? '+' : ''}${mb.toFixed(2)}MB`;
  }

  private suggestOptimizations(): void {
    console.log('💡 Memory optimization suggestions:');
    console.log('  - Use connection pooling');
    console.log('  - Implement proper cleanup in finally blocks');
    console.log('  - Consider streaming for large datasets');
    console.log('  - Use weak references where appropriate');
    console.log('  - Force garbage collection in development: global.gc()');
  }

  forceGarbageCollection(): void {
    if (global.gc) {
      console.log('🗑️ Forcing garbage collection...');
      global.gc();
      this.checkpoint('After GC');
    } else {
      console.warn('⚠️ Garbage collection not available. Start Node.js with --expose-gc');
    }
  }
}

// Usage example
async function memoryAwareWorkflowExecution(
  client: BmadClient,
  workflowId: string,
  parameters: any
): Promise<any> {
  const monitor = new MemoryMonitor();
  monitor.checkpoint('Start');

  try {
    const result = await client.workflows.execute(workflowId, parameters);
    monitor.checkpoint('Workflow Complete');
    return result;

  } catch (error) {
    monitor.checkpoint('Error Occurred');
    throw error;

  } finally {
    // Cleanup
    monitor.checkpoint('Cleanup');

    // Force garbage collection in development
    if (process.env.NODE_ENV === 'development') {
      monitor.forceGarbageCollection();
    }
  }
}
```

#### 2. Connection Pooling Implementation
```typescript
import { Agent } from 'http';

class BmadConnectionPool {
  private static instance: BmadConnectionPool;
  private httpAgent: Agent;

  private constructor() {
    this.httpAgent = new Agent({
      keepAlive: true,
      maxSockets: 10,
      maxFreeSockets: 5,
      timeout: 60000,
      freeSocketTimeout: 30000
    });
  }

  static getInstance(): BmadConnectionPool {
    if (!BmadConnectionPool.instance) {
      BmadConnectionPool.instance = new BmadConnectionPool();
    }
    return BmadConnectionPool.instance;
  }

  getAgent(): Agent {
    return this.httpAgent;
  }

  getStats(): any {
    return {
      totalSocketCount: this.httpAgent.totalSocketCount,
      sockets: Object.keys(this.httpAgent.sockets).length,
      freeSockets: Object.keys(this.httpAgent.freeSockets).length,
      requests: Object.keys(this.httpAgent.requests).length
    };
  }

  cleanup(): void {
    this.httpAgent.destroy();
  }
}

// Use with BMAD client
function createOptimizedBmadClient(config: BmadConfig): BmadClient {
  const pool = BmadConnectionPool.getInstance();

  return new BmadClient({
    ...config,
    httpAgent: pool.getAgent()
  });
}
```

#### 3. Memory Leak Detection
```typescript
class MemoryLeakDetector {
  private baselines: Map<string, NodeJS.MemoryUsage> = new Map();

  setBaseline(operationName: string): void {
    this.baselines.set(operationName, process.memoryUsage());
  }

  checkForLeaks(operationName: string, threshold: number = 50 * 1024 * 1024): boolean {
    const baseline = this.baselines.get(operationName);
    if (!baseline) {
      console.warn(`No baseline set for operation: ${operationName}`);
      return false;
    }

    const current = process.memoryUsage();
    const heapDiff = current.heapUsed - baseline.heapUsed;

    if (heapDiff > threshold) {
      console.error('🚨 Potential memory leak detected!');
      console.log(`Operation: ${operationName}`);
      console.log(`Memory increase: ${(heapDiff / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Threshold: ${(threshold / 1024 / 1024).toFixed(2)}MB`);

      // Generate heap snapshot for analysis
      this.generateHeapSnapshot(operationName);

      return true;
    }

    return false;
  }

  private generateHeapSnapshot(operationName: string): void {
    if (process.env.NODE_ENV === 'development') {
      try {
        const v8 = require('v8');
        const fs = require('fs');

        const filename = `heap-snapshot-${operationName}-${Date.now()}.heapsnapshot`;
        const snapshot = v8.writeHeapSnapshot(filename);

        console.log(`📸 Heap snapshot saved: ${snapshot}`);
        console.log('Use Chrome DevTools Memory tab to analyze the snapshot');

      } catch (error) {
        console.error('Failed to generate heap snapshot:', error.message);
      }
    }
  }
}
```

---

## Network & Connectivity Problems

### Problem: Intermittent Connection Failures

**Symptoms:**
```
Error: ENOTFOUND api.bmad-enterprise.com
Error: ETIMEDOUT
Error: ECONNRESET
```

**Solutions:**

#### 1. Network Resilience Implementation
```typescript
import { EventEmitter } from 'events';

class NetworkResilienceManager extends EventEmitter {
  private retryConfig: RetryConfig;
  private circuitBreaker: NetworkCircuitBreaker;

  constructor(config: RetryConfig = {}) {
    super();
    this.retryConfig = {
      maxRetries: 5,
      baseDelay: 1000,
      maxDelay: 30000,
      exponential: true,
      jitter: true,
      ...config
    };

    this.circuitBreaker = new NetworkCircuitBreaker({
      failureThreshold: 5,
      resetTimeoutMs: 60000
    });
  }

  async executeWithResilience<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    return this.circuitBreaker.execute(async () => {
      return this.executeWithRetry(operation, context);
    });
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt < this.retryConfig.maxRetries; attempt++) {
      try {
        const result = await operation();

        if (attempt > 0) {
          console.log(`✅ Operation succeeded on attempt ${attempt + 1}`);
        }

        return result;

      } catch (error) {
        lastError = error;

        this.emit('retry_attempt', {
          attempt: attempt + 1,
          error: error.message,
          context
        });

        // Don't retry on certain errors
        if (this.shouldNotRetry(error)) {
          throw error;
        }

        // Calculate delay with jitter
        const delay = this.calculateDelay(attempt);

        console.warn(`⚠️ Attempt ${attempt + 1} failed, retrying in ${delay}ms: ${error.message}`);

        if (attempt < this.retryConfig.maxRetries - 1) {
          await this.sleep(delay);
        }
      }
    }

    throw new Error(`Operation failed after ${this.retryConfig.maxRetries} attempts: ${lastError?.message}`);
  }

  private shouldNotRetry(error: Error): boolean {
    const nonRetryableErrors = [
      'INVALID_API_KEY',
      'INSUFFICIENT_PERMISSIONS',
      'INVALID_PARAMETERS',
      'NOT_FOUND'
    ];

    return nonRetryableErrors.some(code => error.message.includes(code));
  }

  private calculateDelay(attempt: number): number {
    let delay = this.retryConfig.baseDelay;

    if (this.retryConfig.exponential) {
      delay = Math.min(
        this.retryConfig.baseDelay * Math.pow(2, attempt),
        this.retryConfig.maxDelay
      );
    }

    // Add jitter to prevent thundering herd
    if (this.retryConfig.jitter) {
      delay += Math.random() * 1000;
    }

    return Math.floor(delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  exponential?: boolean;
  jitter?: boolean;
}

class NetworkCircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(private config: { failureThreshold: number; resetTimeoutMs: number }) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
        console.log('🔄 Circuit breaker: HALF_OPEN - testing connectivity');
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log('✅ Circuit breaker: CLOSED - connectivity restored');
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.config.failureThreshold) {
      this.state = 'OPEN';
      console.warn('🔴 Circuit breaker: OPEN - too many failures');
    }
  }

  getState(): string {
    return this.state;
  }
}
```

#### 2. Network Diagnostics
```typescript
async function runNetworkDiagnostics(baseUrl: string): Promise<void> {
  console.log('🌐 Running network diagnostics...');

  const tests = [
    { name: 'DNS Resolution', test: () => testDnsResolution(baseUrl) },
    { name: 'TCP Connection', test: () => testTcpConnection(baseUrl) },
    { name: 'HTTP Connectivity', test: () => testHttpConnectivity(baseUrl) },
    { name: 'TLS/SSL', test: () => testTlsConnection(baseUrl) },
    { name: 'Latency', test: () => measureLatency(baseUrl) },
    { name: 'Bandwidth', test: () => measureBandwidth(baseUrl) }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const result = await test.test();
      console.log(`✅ ${test.name}: ${result}`);
    } catch (error) {
      console.error(`❌ ${test.name}: ${error.message}`);
    }
  }
}

async function testDnsResolution(url: string): Promise<string> {
  const dns = require('dns').promises;
  const hostname = new URL(url).hostname;
  const addresses = await dns.resolve(hostname);
  return `Resolved to ${addresses.join(', ')}`;
}

async function testTcpConnection(url: string): Promise<string> {
  const net = require('net');
  const urlObj = new URL(url);
  const port = urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80);

  return new Promise((resolve, reject) => {
    const socket = net.createConnection(port, urlObj.hostname);

    socket.on('connect', () => {
      socket.end();
      resolve(`Connected to ${urlObj.hostname}:${port}`);
    });

    socket.on('error', (error) => {
      reject(error);
    });

    setTimeout(() => {
      socket.destroy();
      reject(new Error('Connection timeout'));
    }, 10000);
  });
}

async function testHttpConnectivity(url: string): Promise<string> {
  const response = await fetch(`${url}/health`, {
    method: 'HEAD',
    timeout: 10000
  });

  return `HTTP ${response.status} ${response.statusText}`;
}

async function testTlsConnection(url: string): Promise<string> {
  const tls = require('tls');
  const urlObj = new URL(url);

  if (urlObj.protocol !== 'https:') {
    return 'Not using HTTPS';
  }

  return new Promise((resolve, reject) => {
    const socket = tls.connect({
      host: urlObj.hostname,
      port: 443,
      timeout: 10000
    });

    socket.on('secureConnect', () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      resolve(`TLS ${socket.getProtocol()} - Certificate expires: ${cert.valid_to}`);
    });

    socket.on('error', reject);
  });
}

async function measureLatency(url: string): Promise<string> {
  const measurements: number[] = [];

  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    await fetch(`${url}/health`, { method: 'HEAD' });
    measurements.push(Date.now() - start);
  }

  const avg = measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
  const min = Math.min(...measurements);
  const max = Math.max(...measurements);

  return `Avg: ${avg.toFixed(2)}ms, Min: ${min}ms, Max: ${max}ms`;
}

async function measureBandwidth(url: string): Promise<string> {
  // Simple bandwidth test using a small data transfer
  const start = Date.now();
  const response = await fetch(`${url}/health`);
  const data = await response.text();
  const duration = Date.now() - start;

  const bytes = new TextEncoder().encode(data).length;
  const kbps = (bytes * 8) / (duration / 1000) / 1000;

  return `${kbps.toFixed(2)} Kbps (${bytes} bytes in ${duration}ms)`;
}
```

---

## Error Code Reference

### BMAD API Error Codes

| Code | Status | Description | Resolution |
|------|--------|-------------|------------|
| `INVALID_API_KEY` | 401 | API key is invalid or expired | Check API key, rotate if expired |
| `INSUFFICIENT_PERMISSIONS` | 403 | Missing required permissions | Contact admin to grant permissions |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Implement exponential backoff |
| `WORKFLOW_NOT_FOUND` | 404 | Specified workflow doesn't exist | Check workflow ID spelling/availability |
| `MODULE_NOT_INSTALLED` | 404 | Required module not installed | Install dependencies first |
| `INSTALLATION_FAILED` | 422 | Module installation failed | Check logs, retry with rollback enabled |
| `WORKFLOW_TIMEOUT` | 408 | Workflow execution timed out | Increase timeout or check system load |
| `DEPENDENCY_CONFLICT` | 409 | Module dependency conflict | Use dependency resolution options |
| `SECURITY_TEST_FAILED` | 422 | Security test execution failed | Check test configuration and targets |
| `ABDUL_UNAVAILABLE` | 503 | Abdul orchestration unavailable | Use fallback strategy or retry later |
| `INTERNAL_ERROR` | 500 | Unexpected server error | Check system status, contact support |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable | Retry with exponential backoff |

### Detailed Error Resolution Guide

#### Authentication Errors (4xx)

```typescript
function handleAuthError(error: BmadApiError): void {
  switch (error.code) {
    case 'INVALID_API_KEY':
      console.error('🔑 API Key Issues:');
      console.log('1. Verify BMAD_API_KEY environment variable is set');
      console.log('2. Check if API key has expired');
      console.log('3. Ensure you\'re using the correct environment (staging/prod)');
      console.log('4. Rotate API key if necessary');
      break;

    case 'INSUFFICIENT_PERMISSIONS':
      console.error('🚫 Permission Issues:');
      console.log('1. Contact your BMAD administrator');
      console.log('2. Request required permissions for your use case');
      console.log('3. Check if permissions are time-limited');
      console.log('4. Verify team membership if applicable');
      break;

    default:
      console.error('❌ Authentication error:', error.message);
  }
}
```

#### Server Errors (5xx)

```typescript
function handleServerError(error: BmadApiError): void {
  switch (error.code) {
    case 'INTERNAL_ERROR':
      console.error('⚙️ Server Error - Retry Strategy:');
      console.log('1. Retry with exponential backoff');
      console.log('2. Check BMAD system status page');
      console.log('3. Contact support if error persists');
      break;

    case 'SERVICE_UNAVAILABLE':
      console.error('🚧 Service Unavailable:');
      console.log('1. Service may be under maintenance');
      console.log('2. Implement circuit breaker pattern');
      console.log('3. Use graceful degradation where possible');
      break;

    default:
      console.error('❌ Server error:', error.message);
  }
}
```

---

## Debug Configuration

### Enable Debug Logging

#### Environment Variables
```bash
# Enable debug logging
export BMAD_LOG_LEVEL=debug
export BMAD_ENABLE_TRACING=true

# Network debugging
export NODE_DEBUG=net,http,tls

# Memory debugging
export NODE_OPTIONS="--expose-gc --max-old-space-size=4096"
```

#### Application Configuration
```typescript
const debugConfig: BmadConfig = {
  apiKey: process.env.BMAD_API_KEY!,
  baseUrl: process.env.BMAD_BASE_URL,
  logLevel: 'debug',
  timeout: 60000,
  retries: 3,

  // Debug options
  enableTracing: true,
  enableRequestLogging: true,
  enableResponseLogging: true,
  validateResponses: true,

  // Development helpers
  throwOnWarnings: process.env.NODE_ENV === 'development',
  enableDebugInfo: true
};

const client = new BmadClient(debugConfig);
```

### Debug Helper Functions

```typescript
class BmadDebugger {
  static async debugWorkflowExecution(
    client: BmadClient,
    workflowId: string,
    parameters: any
  ): Promise<void> {
    console.log('🐛 Debug Mode: Workflow Execution');
    console.log('Workflow ID:', workflowId);
    console.log('Parameters:', JSON.stringify(parameters, null, 2));

    try {
      // Validate workflow exists
      const workflows = await client.workflows.list();
      const workflow = workflows.find(w => w.id === workflowId);

      if (!workflow) {
        console.error('❌ Workflow not found');
        console.log('Available workflows:', workflows.map(w => w.id));
        return;
      }

      console.log('✅ Workflow found:', workflow.name);

      // Validate parameters
      if (workflow.parameters) {
        console.log('🔍 Validating parameters...');
        for (const [param, value] of Object.entries(parameters)) {
          if (param in workflow.parameters) {
            console.log(`✅ ${param}: ${value}`);
          } else {
            console.warn(`⚠️ ${param}: not in workflow schema`);
          }
        }
      }

      // Execute with monitoring
      console.log('🚀 Executing workflow...');
      const result = await client.workflows.execute(workflowId, parameters);

      console.log('✅ Workflow completed:');
      console.log(JSON.stringify(result, null, 2));

    } catch (error) {
      console.error('❌ Workflow execution failed:');
      console.error('Error:', error.message);

      if (error instanceof BmadApiError) {
        console.error('Status:', error.statusCode);
        console.error('Code:', error.code);
        console.error('Details:', error.details);
      }
    }
  }

  static async debugApiConnectivity(client: BmadClient): Promise<void> {
    console.log('🐛 Debug Mode: API Connectivity');

    const tests = [
      { name: 'Health Check', fn: () => client.health.check() },
      { name: 'Auth Validation', fn: () => client.auth.validate() },
      { name: 'List Workflows', fn: () => client.workflows.list() },
      { name: 'List Modules', fn: () => client.modules.list() }
    ];

    for (const test of tests) {
      try {
        console.log(`Testing: ${test.name}...`);
        const start = Date.now();
        const result = await test.fn();
        const duration = Date.now() - start;

        console.log(`✅ ${test.name}: ${duration}ms`);

      } catch (error) {
        console.error(`❌ ${test.name}: ${error.message}`);
      }
    }
  }
}
```

---

## Monitoring & Logging

### Production Logging Setup

```typescript
import winston from 'winston';

class BmadLogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.BMAD_LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: 'bmad-integration',
        version: process.env.npm_package_version
      },
      transports: [
        // Console logging
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),

        // File logging
        new winston.transports.File({
          filename: 'logs/bmad-error.log',
          level: 'error',
          maxsize: 10485760, // 10MB
          maxFiles: 5
        }),

        new winston.transports.File({
          filename: 'logs/bmad-combined.log',
          maxsize: 10485760,
          maxFiles: 5
        })
      ]
    });
  }

  logApiCall(method: string, url: string, duration: number, statusCode?: number): void {
    this.logger.info('API Call', {
      method,
      url,
      duration,
      statusCode,
      timestamp: new Date().toISOString()
    });
  }

  logError(error: Error, context?: any): void {
    this.logger.error('BMAD Integration Error', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      timestamp: new Date().toISOString()
    });
  }

  logWorkflowExecution(workflowId: string, parameters: any, result: any): void {
    this.logger.info('Workflow Execution', {
      workflowId,
      parametersHash: this.hashObject(parameters),
      success: result.status === 'completed',
      duration: result.metrics?.executionTime,
      timestamp: new Date().toISOString()
    });
  }

  private hashObject(obj: any): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex').substring(0, 8);
  }
}

// Global logger instance
const bmadLogger = new BmadLogger();
export default bmadLogger;
```

### Metrics Collection

```typescript
import { EventEmitter } from 'events';

class BmadMetricsCollector extends EventEmitter {
  private metrics: Map<string, any> = new Map();
  private counters: Map<string, number> = new Map();
  private timers: Map<string, number> = new Map();

  // Counter metrics
  incrementCounter(name: string, value: number = 1): void {
    this.counters.set(name, (this.counters.get(name) || 0) + value);
    this.emit('counter', { name, value: this.counters.get(name) });
  }

  // Timer metrics
  startTimer(name: string): void {
    this.timers.set(name, Date.now());
  }

  endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      throw new Error(`Timer ${name} was not started`);
    }

    const duration = Date.now() - startTime;
    this.timers.delete(name);

    this.recordMetric(`${name}_duration`, duration);
    return duration;
  }

  // General metrics
  recordMetric(name: string, value: number): void {
    this.metrics.set(name, value);
    this.emit('metric', { name, value });
  }

  // Get all metrics
  getAllMetrics(): any {
    return {
      counters: Object.fromEntries(this.counters),
      metrics: Object.fromEntries(this.metrics),
      timestamp: new Date().toISOString()
    };
  }

  // Reset metrics
  reset(): void {
    this.metrics.clear();
    this.counters.clear();
    this.timers.clear();
  }
}

// Global metrics collector
const metricsCollector = new BmadMetricsCollector();

// Usage with BMAD operations
async function instrumentedWorkflowExecution(
  client: BmadClient,
  workflowId: string,
  parameters: any
): Promise<any> {
  const timerName = `workflow_${workflowId}`;

  metricsCollector.startTimer(timerName);
  metricsCollector.incrementCounter('workflow_executions_started');

  try {
    const result = await client.workflows.execute(workflowId, parameters);

    metricsCollector.incrementCounter('workflow_executions_completed');
    metricsCollector.recordMetric('workflow_success_rate', 1);

    return result;

  } catch (error) {
    metricsCollector.incrementCounter('workflow_executions_failed');
    metricsCollector.recordMetric('workflow_success_rate', 0);

    throw error;

  } finally {
    metricsCollector.endTimer(timerName);
  }
}
```

---

## Advanced Troubleshooting

### Performance Profiling

```typescript
import { performance, PerformanceObserver } from 'perf_hooks';

class BmadPerformanceProfiler {
  private observer: PerformanceObserver;
  private profiles: Map<string, PerformanceEntry[]> = new Map();

  constructor() {
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        const category = entry.name.split(':')[0];
        if (!this.profiles.has(category)) {
          this.profiles.set(category, []);
        }
        this.profiles.get(category)!.push(entry);
      });
    });

    this.observer.observe({ entryTypes: ['measure', 'mark'] });
  }

  startProfiling(operationName: string): void {
    performance.mark(`${operationName}:start`);
  }

  endProfiling(operationName: string): void {
    performance.mark(`${operationName}:end`);
    performance.measure(
      operationName,
      `${operationName}:start`,
      `${operationName}:end`
    );
  }

  getProfileResults(category?: string): any {
    if (category) {
      return this.profiles.get(category) || [];
    }

    const results: any = {};
    this.profiles.forEach((entries, cat) => {
      results[cat] = entries.map(entry => ({
        name: entry.name,
        duration: entry.duration,
        startTime: entry.startTime
      }));
    });

    return results;
  }

  generatePerformanceReport(): string {
    let report = '📊 BMAD Performance Profile Report\n';
    report += '=' .repeat(50) + '\n\n';

    this.profiles.forEach((entries, category) => {
      report += `Category: ${category}\n`;

      const durations = entries.map(e => e.duration);
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);

      report += `  Operations: ${entries.length}\n`;
      report += `  Average Duration: ${avgDuration.toFixed(2)}ms\n`;
      report += `  Min Duration: ${minDuration.toFixed(2)}ms\n`;
      report += `  Max Duration: ${maxDuration.toFixed(2)}ms\n`;

      // Find slowest operations
      const slowest = entries
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 3);

      report += '  Slowest Operations:\n';
      slowest.forEach((entry, i) => {
        report += `    ${i + 1}. ${entry.name}: ${entry.duration.toFixed(2)}ms\n`;
      });

      report += '\n';
    });

    return report;
  }

  cleanup(): void {
    this.observer.disconnect();
    this.profiles.clear();
  }
}

// Usage
async function profiledBmadOperation(client: BmadClient): Promise<void> {
  const profiler = new BmadPerformanceProfiler();

  try {
    // Profile workflow execution
    profiler.startProfiling('workflow:threat-analysis');
    await client.workflows.execute('cybersec-team:threat-analysis', {
      target: 'example.com'
    });
    profiler.endProfiling('workflow:threat-analysis');

    // Profile security test
    profiler.startProfiling('security:comprehensive-test');
    await client.security.runComprehensiveTest({
      target: { modules: ['cybersec-team'] }
    });
    profiler.endProfiling('security:comprehensive-test');

    // Generate report
    console.log(profiler.generatePerformanceReport());

  } finally {
    profiler.cleanup();
  }
}
```

### System Health Monitoring

```typescript
class BmadHealthMonitor {
  private healthChecks: Map<string, () => Promise<boolean>> = new Map();
  private lastResults: Map<string, boolean> = new Map();

  constructor() {
    this.setupDefaultHealthChecks();
  }

  private setupDefaultHealthChecks(): void {
    // API connectivity check
    this.healthChecks.set('api_connectivity', async () => {
      try {
        const client = new BmadClient({ apiKey: process.env.BMAD_API_KEY! });
        await client.health.check();
        return true;
      } catch {
        return false;
      }
    });

    // Memory usage check
    this.healthChecks.set('memory_usage', async () => {
      const usage = process.memoryUsage();
      const heapUsedMB = usage.heapUsed / 1024 / 1024;
      return heapUsedMB < 500; // Less than 500MB
    });

    // Event loop lag check
    this.healthChecks.set('event_loop_lag', async () => {
      return new Promise((resolve) => {
        const start = Date.now();
        setImmediate(() => {
          const lag = Date.now() - start;
          resolve(lag < 100); // Less than 100ms lag
        });
      });
    });
  }

  async runHealthChecks(): Promise<Map<string, boolean>> {
    console.log('🏥 Running system health checks...');

    const results = new Map<string, boolean>();

    for (const [name, check] of this.healthChecks) {
      try {
        const result = await check();
        results.set(name, result);

        const status = result ? '✅' : '❌';
        console.log(`${status} ${name}: ${result ? 'HEALTHY' : 'UNHEALTHY'}`);

      } catch (error) {
        results.set(name, false);
        console.log(`❌ ${name}: ERROR - ${error.message}`);
      }
    }

    this.lastResults = results;
    return results;
  }

  getHealthStatus(): 'healthy' | 'degraded' | 'unhealthy' {
    const total = this.lastResults.size;
    const healthy = Array.from(this.lastResults.values()).filter(Boolean).length;
    const healthPercentage = (healthy / total) * 100;

    if (healthPercentage >= 90) return 'healthy';
    if (healthPercentage >= 70) return 'degraded';
    return 'unhealthy';
  }

  addCustomHealthCheck(name: string, check: () => Promise<boolean>): void {
    this.healthChecks.set(name, check);
  }
}

// Usage
const healthMonitor = new BmadHealthMonitor();

// Add custom health check
healthMonitor.addCustomHealthCheck('bmad_workflow_availability', async () => {
  try {
    const client = new BmadClient({ apiKey: process.env.BMAD_API_KEY! });
    const workflows = await client.workflows.list();
    return workflows.length > 0;
  } catch {
    return false;
  }
});

// Run periodic health checks
setInterval(async () => {
  await healthMonitor.runHealthChecks();
  const status = healthMonitor.getHealthStatus();
  console.log(`Overall system health: ${status.toUpperCase()}`);
}, 60000); // Every minute
```

---

## Getting Additional Help

### When to Contact Support

**Contact Immediately For:**
- Security incidents or vulnerabilities
- Data corruption or loss
- Service unavailability > 15 minutes
- Memory leaks or crashes
- Authentication system failures

**Contact Within 24 Hours For:**
- Performance degradation
- Intermittent connectivity issues
- Workflow execution problems
- Documentation errors or gaps
- Feature requests

**Self-Service Resources:**
- [GitHub Discussions](https://github.com/bmad-code/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/bmad-cyber2)
- [Developer Slack](https://bmad-developers.slack.com)
- [Status Page](https://status.bmad.code)

### Support Information to Gather

Before contacting support, gather:

1. **Environment Information**
   - BMAD SDK version
   - Node.js version
   - Operating system
   - Network configuration

2. **Error Details**
   - Complete error message
   - Error code if available
   - Stack trace
   - Request/correlation IDs

3. **Reproduction Steps**
   - Minimal code example
   - Configuration used
   - Expected vs actual behavior
   - Consistency of the issue

4. **System State**
   - Memory usage
   - Network connectivity
   - Recent changes
   - Load/traffic patterns

---

*This debugging guide is maintained by the BMAD Developer Experience team. For updates or suggestions, please contact docs@bmad.code*

**Last Updated:** January 24, 2026
**Version:** 1.0.0
**Author:** Amelia, The Developer