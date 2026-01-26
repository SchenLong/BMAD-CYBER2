# BMAD-CYBER2 Developer SDK Guide

> **Version:** 2.0.0
> **Last Updated:** January 24, 2026
> **Audience:** Software Engineers, Integration Developers, DevOps Teams

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Authentication](#authentication)
4. [JavaScript/TypeScript SDK](#javascripttypescript-sdk)
5. [Python SDK](#python-sdk)
6. [Go SDK](#go-sdk)
7. [Java SDK](#java-sdk)
8. [C# SDK](#c-sdk)
9. [cURL Examples](#curl-examples)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)
12. [Best Practices](#best-practices)

---

## Overview

The BMAD-CYBER2 SDK provides developers with easy-to-use libraries for integrating with the BMAD enterprise AI framework. The SDK supports multiple programming languages and provides consistent interfaces across all BMAD APIs.

### Supported Languages

| Language | Version | Repository | Package Manager |
|----------|---------|------------|-----------------|
| **JavaScript/TypeScript** | 18+ | [@bmad/sdk-js](https://npm.blackunicorn.tech) | npm/yarn |
| **Python** | 3.9+ | [bmad-sdk-python](https://pypi.blackunicorn.tech) | pip/conda |
| **Go** | 1.19+ | [github.com/bmad/sdk-go](https://pkg.go.dev) | go modules |
| **Java** | 11+ | [com.bmad:sdk-java](https://maven.blackunicorn.tech) | Maven/Gradle |
| **C#** | .NET 6+ | [BMad.SDK](https://nuget.blackunicorn.tech) | NuGet |

### Key Features

- **Complete API Coverage**: All BMAD APIs (Installation, Security, Integration, Teams)
- **Automatic Authentication**: OAuth2, JWT, and API key management
- **Error Handling**: Consistent error handling with retries and circuit breakers
- **Type Safety**: Full TypeScript definitions and strongly-typed responses
- **Streaming Support**: Real-time event streaming and monitoring
- **Rate Limiting**: Built-in rate limiting with backoff strategies
- **Testing Support**: Mock clients and testing utilities

---

## Quick Start

### 15-Minute Developer Onboarding

#### 1. Install SDK (Choose your language)

```bash
# JavaScript/TypeScript
npm install @bmad/sdk-js

# Python
pip install bmad-sdk

# Go
go get github.com/bmad/sdk-go

# Java (Maven)
# Add to pom.xml: <dependency><groupId>com.bmad</groupId><artifactId>sdk-java</artifactId><version>2.0.0</version></dependency>

# C# (.NET CLI)
dotnet add package BMad.SDK
```

#### 2. Basic Setup

```typescript
// JavaScript/TypeScript
import { BmadClient } from '@bmad/sdk-js';

const client = new BmadClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.bmad-enterprise.com/v2'
});

// Test connection
const health = await client.health.check();
console.log('BMAD Status:', health.status);
```

```python
# Python
from bmad_sdk import BmadClient

client = BmadClient(
    api_key='your-api-key',
    base_url='https://api.bmad-enterprise.com/v2'
)

# Test connection
health = client.health.check()
print(f'BMAD Status: {health.status}')
```

#### 3. Execute Your First Workflow

```typescript
// Execute a cybersec workflow
const result = await client.workflows.execute('cybersec-team:threat-analysis', {
  target: 'suspicious-domain.com',
  depth: 'comprehensive'
});

console.log('Threat Analysis Result:', result.findings);
```

---

## Authentication

### API Key Authentication

```typescript
// JavaScript/TypeScript
const client = new BmadClient({
  apiKey: 'bmad_api_key_your_key_here',
  baseUrl: 'https://api.bmad-enterprise.com/v2'
});
```

```python
# Python
client = BmadClient(api_key='bmad_api_key_your_key_here')
```

### OAuth2 Authentication

```typescript
// JavaScript/TypeScript - OAuth2 with PKCE
const client = new BmadClient({
  oauth: {
    clientId: 'your-client-id',
    redirectUri: 'https://yourapp.com/callback',
    scopes: ['read', 'write', 'admin']
  }
});

// Get authorization URL
const authUrl = await client.auth.getAuthorizationUrl();
// Redirect user to authUrl...

// Exchange code for tokens
const tokens = await client.auth.exchangeCode('authorization-code');
```

```python
# Python - OAuth2
from bmad_sdk.auth import OAuth2Config

oauth_config = OAuth2Config(
    client_id='your-client-id',
    client_secret='your-client-secret',
    redirect_uri='https://yourapp.com/callback'
)

client = BmadClient(oauth=oauth_config)
```

### Enterprise SSO Integration

```typescript
// Azure AD Integration
const client = new BmadClient({
  sso: {
    provider: 'azure-ad',
    tenantId: 'your-tenant-id',
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret'
  }
});
```

---

## JavaScript/TypeScript SDK

### Installation

```bash
npm install @bmad/sdk-js
# or
yarn add @bmad/sdk-js
```

### Core Client

```typescript
import { BmadClient, BmadConfig } from '@bmad/sdk-js';

interface BmadConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  oauth?: OAuthConfig;
  sso?: SSOConfig;
}

const client = new BmadClient({
  apiKey: process.env.BMAD_API_KEY,
  baseUrl: 'https://api.bmad-enterprise.com/v2',
  timeout: 30000,
  retries: 3
});
```

### Module Installation

```typescript
// Install a cybersec module
const installation = await client.installation.installModules([
  '@bmad-cybercommand/cybersec-team'
], {
  validateDependencies: true,
  enableRollback: true,
  verbose: true
});

console.log('Installation ID:', installation.installationId);

// Monitor installation progress
const status = await client.installation.getStatus(installation.installationId);
console.log('Progress:', status.progress.percentage + '%');
```

### Agent Management

```typescript
// List available agents
const agents = await client.agents.list({
  team: 'cybersec-team',
  status: 'active'
});

console.log(`Found ${agents.total} agents`);

// Get agent details
const bastionAgent = await client.agents.get('cybersec-team:bastion');
console.log('Agent capabilities:', bastionAgent.capabilities);

// Update agent configuration
await client.agents.update('cybersec-team:bastion', {
  configuration: {
    securityLevel: 'high',
    enableAuditLogging: true
  }
});
```

### Workflow Execution

```typescript
// Execute workflow synchronously
const result = await client.workflows.execute('intel-team:osint-investigation', {
  target: 'target-domain.com',
  scope: 'comprehensive',
  includeSubdomains: true
});

console.log('Investigation results:', result.findings);

// Execute workflow asynchronously
const execution = await client.workflows.executeAsync('intel-team:operation-mosaic', {
  targets: ['domain1.com', 'domain2.com'],
  analysisDepth: 'deep'
});

// Poll for completion
const finalResult = await client.workflows.waitForCompletion(execution.executionId, {
  timeout: 600000,  // 10 minutes
  pollInterval: 5000  // Check every 5 seconds
});
```

### Abdul Orchestration

```typescript
// Request Abdul's assistance
const orchestration = await client.orchestration.requestAbdul({
  requestType: 'crisis_response',
  description: 'Security incident requiring multi-team coordination',
  priority: 'urgent',
  requiredTeams: ['cybersec-team', 'intel-team', 'legal-team']
});

console.log('Abdul\'s recommendations:', orchestration.result.recommendedActions);
```

### Party Mode Collaboration

```typescript
// Start a Party Mode session
const session = await client.orchestration.startPartyMode({
  sessionName: 'Incident Response - Data Breach',
  participants: [
    'cybersec-team:bastion',
    'intel-team:ghost',
    'legal-team:counsel',
    'strategy-team:strategist'
  ],
  objective: 'Coordinate response to data breach incident'
});

console.log('Party Mode session started:', session.sessionId);
```

### Security Testing

```typescript
// Run comprehensive security test
const securityTest = await client.security.runComprehensiveTest({
  target: {
    modules: ['cybersec-team', 'intel-team'],
    scope: 'enterprise'
  },
  options: {
    attackVectors: 'all',
    complianceFramework: 'enterprise',
    reportFormat: 'comprehensive'
  }
});

console.log('Security score:', securityTest.overallScore);
console.log('Critical findings:', securityTest.criticalFindings.length);
```

### Real-time Monitoring

```typescript
// Monitor security events in real-time
const eventStream = client.security.monitorRealTime({
  modules: ['cybersec-team'],
  alertLevel: 'warning'
});

eventStream.on('alert', (alert) => {
  console.log('Security alert:', alert.title, alert.severity);
});

eventStream.on('event', (event) => {
  console.log('Security event:', event.type, event.description);
});

// Integration events
const integrationStream = client.integration.getEventStream({
  eventTypes: ['agent_activation', 'workflow_execution']
});

integrationStream.on('agent_activation', (event) => {
  console.log('Agent activated:', event.agentId);
});
```

### Error Handling

```typescript
import { BmadError, BmadApiError, BmadTimeoutError } from '@bmad/sdk-js';

try {
  const result = await client.workflows.execute('invalid-workflow-id', {});
} catch (error) {
  if (error instanceof BmadApiError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Error Code:', error.code);
  } else if (error instanceof BmadTimeoutError) {
    console.error('Request timed out after', error.timeout, 'ms');
  } else {
    console.error('Unknown error:', error);
  }
}
```

### TypeScript Types

```typescript
// Response types are fully typed
interface WorkflowExecutionResult {
  executionId: string;
  status: 'completed' | 'failed' | 'timeout';
  result: {
    findings?: SecurityFinding[];
    recommendations?: string[];
    score?: number;
  };
  metrics: {
    executionTime: number;
    stepsExecuted: number;
  };
}

interface SecurityFinding {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  remediation: string;
  evidence: string[];
}
```

---

## Python SDK

### Installation

```bash
pip install bmad-sdk
# or with conda
conda install -c bmad bmad-sdk
```

### Core Client

```python
from bmad_sdk import BmadClient
from bmad_sdk.exceptions import BmadError, BmadApiError
from bmad_sdk.types import InstallationOptions, WorkflowExecutionRequest

# Initialize client
client = BmadClient(
    api_key='your-api-key',
    base_url='https://api.bmad-enterprise.com/v2',
    timeout=30,
    max_retries=3
)

# With OAuth2
from bmad_sdk.auth import OAuth2Config

oauth_config = OAuth2Config(
    client_id='your-client-id',
    client_secret='your-client-secret',
    redirect_uri='https://yourapp.com/callback',
    scopes=['read', 'write']
)

client = BmadClient(oauth=oauth_config)
```

### Module Installation

```python
# Install modules
installation = client.installation.install_modules(
    modules=['@bmad-cybercommand/cybersec-team'],
    options=InstallationOptions(
        validate_dependencies=True,
        enable_rollback=True,
        verbose=True
    )
)

print(f"Installation ID: {installation.installation_id}")

# Monitor progress
import time

while True:
    status = client.installation.get_status(installation.installation_id)
    print(f"Progress: {status.progress.percentage}%")

    if status.status in ['completed', 'failed']:
        break

    time.sleep(5)
```

### Agent and Workflow Management

```python
# List agents
agents = client.agents.list(team='cybersec-team', status='active')
print(f"Found {agents.total} agents")

for agent in agents.agents:
    print(f"Agent: {agent.name} - {agent.title}")

# Execute workflow
result = client.workflows.execute(
    'intel-team:threat-assessment',
    parameters={
        'target': 'suspicious-domain.com',
        'depth': 'comprehensive'
    },
    options={
        'timeout': 300,
        'priority': 'high'
    }
)

print(f"Threat assessment completed: {result.status}")
print(f"Findings: {len(result.result.get('findings', []))}")
```

### Security Testing

```python
from bmad_sdk.types import SecurityTestTarget, SecurityTestOptions

# Configure security test
target = SecurityTestTarget(
    modules=['cybersec-team', 'intel-team'],
    scope='enterprise'
)

options = SecurityTestOptions(
    attack_vectors=['direct_prompt_injection', 'role_hijacking'],
    compliance_framework='enterprise',
    report_format='detailed'
)

# Run security test
security_test = client.security.run_comprehensive_test(
    target=target,
    options=options
)

print(f"Security Score: {security_test.overall_score}")
print(f"Critical Issues: {len(security_test.critical_findings)}")

# Get specific attack vector results
for vector, result in security_test.attack_vector_results.items():
    print(f"{vector}: {result.status} (Score: {result.score})")
```

### Real-time Monitoring

```python
from bmad_sdk.streaming import SecurityEventStream

# Monitor security events
def handle_security_alert(alert):
    print(f"🚨 ALERT: {alert.title} - {alert.severity}")
    if alert.severity == 'critical':
        # Trigger incident response
        client.security.initiate_incident_response({
            'incident_type': 'security_breach',
            'severity': 'critical',
            'description': alert.description
        })

# Set up event stream
event_stream = SecurityEventStream(client)
event_stream.on_alert(handle_security_alert)
event_stream.start()

# Monitor for specific events
integration_stream = client.integration.get_event_stream(
    event_types=['agent_activation', 'workflow_execution']
)

for event in integration_stream:
    print(f"Event: {event.type} - {event.description}")
```

### Context Managers and Async Support

```python
# Context manager for automatic cleanup
with BmadClient(api_key='your-api-key') as client:
    result = client.workflows.execute('cybersec-team:vulnerability-scan', {
        'target': 'internal-network',
        'scan_type': 'comprehensive'
    })
    print(f"Vulnerabilities found: {len(result.vulnerabilities)}")

# Async support
import asyncio
from bmad_sdk import AsyncBmadClient

async def run_parallel_scans():
    client = AsyncBmadClient(api_key='your-api-key')

    # Run multiple scans in parallel
    tasks = [
        client.workflows.execute_async('cybersec-team:port-scan', {'target': '192.168.1.0/24'}),
        client.workflows.execute_async('cybersec-team:vulnerability-scan', {'target': 'web-server'}),
        client.workflows.execute_async('intel-team:osint-scan', {'target': 'company.com'})
    ]

    results = await asyncio.gather(*tasks)

    for i, result in enumerate(results):
        print(f"Scan {i+1}: {result.status}")

# Run async function
asyncio.run(run_parallel_scans())
```

### Error Handling and Logging

```python
import logging
from bmad_sdk.exceptions import BmadApiError, BmadTimeoutError, BmadRateLimitError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    result = client.workflows.execute('invalid-workflow', {})
except BmadApiError as e:
    logger.error(f"API Error: {e.message} (Status: {e.status_code})")
except BmadTimeoutError as e:
    logger.error(f"Timeout after {e.timeout} seconds")
except BmadRateLimitError as e:
    logger.warning(f"Rate limited. Retry after {e.retry_after} seconds")
    time.sleep(e.retry_after)
    # Retry the request
```

---

## Go SDK

### Installation

```bash
go get github.com/bmad/sdk-go
```

### Core Client

```go
package main

import (
    "context"
    "fmt"
    "log"
    "time"

    "github.com/bmad/sdk-go/bmad"
)

func main() {
    // Initialize client
    config := bmad.Config{
        APIKey:  "your-api-key",
        BaseURL: "https://api.bmad-enterprise.com/v2",
        Timeout: 30 * time.Second,
        Retries: 3,
    }

    client, err := bmad.NewClient(config)
    if err != nil {
        log.Fatal("Failed to create BMAD client:", err)
    }

    // Test connection
    ctx := context.Background()
    health, err := client.Health.Check(ctx)
    if err != nil {
        log.Fatal("Health check failed:", err)
    }

    fmt.Printf("BMAD Status: %s\n", health.Status)
}
```

### Module Installation

```go
package main

import (
    "context"
    "fmt"
    "time"

    "github.com/bmad/sdk-go/bmad"
)

func installModule(client *bmad.Client) error {
    ctx := context.Background()

    // Install cybersec module
    req := bmad.InstallationRequest{
        Modules: []string{"@bmad-cybercommand/cybersec-team"},
        Options: bmad.InstallationOptions{
            ValidateDependencies: true,
            EnableRollback:       true,
            Verbose:             true,
        },
    }

    installation, err := client.Installation.InstallModules(ctx, req)
    if err != nil {
        return fmt.Errorf("installation failed: %w", err)
    }

    fmt.Printf("Installation ID: %s\n", installation.InstallationID)

    // Monitor progress
    for {
        status, err := client.Installation.GetStatus(ctx, installation.InstallationID)
        if err != nil {
            return fmt.Errorf("failed to get status: %w", err)
        }

        fmt.Printf("Progress: %.1f%%\n", status.Progress.Percentage)

        if status.Status == "completed" {
            fmt.Println("Installation completed successfully!")
            break
        } else if status.Status == "failed" {
            return fmt.Errorf("installation failed: %s", status.Error)
        }

        time.Sleep(5 * time.Second)
    }

    return nil
}
```

### Workflow Execution

```go
package main

import (
    "context"
    "encoding/json"
    "fmt"

    "github.com/bmad/sdk-go/bmad"
)

func executeWorkflow(client *bmad.Client) error {
    ctx := context.Background()

    // Execute threat analysis workflow
    req := bmad.WorkflowExecutionRequest{
        Parameters: map[string]interface{}{
            "target": "suspicious-domain.com",
            "depth":  "comprehensive",
        },
        Options: bmad.WorkflowExecutionOptions{
            Timeout:  300,
            Priority: "high",
        },
    }

    result, err := client.Workflows.Execute(ctx, "cybersec-team:threat-analysis", req)
    if err != nil {
        return fmt.Errorf("workflow execution failed: %w", err)
    }

    fmt.Printf("Execution ID: %s\n", result.ExecutionID)
    fmt.Printf("Status: %s\n", result.Status)

    // Print findings if available
    if findings, ok := result.Result["findings"].([]interface{}); ok {
        fmt.Printf("Found %d threat indicators\n", len(findings))

        for i, finding := range findings {
            if findingMap, ok := finding.(map[string]interface{}); ok {
                fmt.Printf("Finding %d: %s (Severity: %s)\n",
                    i+1,
                    findingMap["title"],
                    findingMap["severity"])
            }
        }
    }

    return nil
}
```

### Security Testing

```go
package main

import (
    "context"
    "fmt"

    "github.com/bmad/sdk-go/bmad"
)

func runSecurityTest(client *bmad.Client) error {
    ctx := context.Background()

    // Configure security test
    req := bmad.ComprehensiveTestRequest{
        Target: bmad.SecurityTestTarget{
            Modules: []string{"cybersec-team", "intel-team"},
            Scope:   "enterprise",
        },
        Options: bmad.SecurityTestOptions{
            AttackVectors:       []string{"all"},
            ComplianceFramework: "enterprise",
            ReportFormat:        "detailed",
        },
    }

    test, err := client.Security.RunComprehensiveTest(ctx, req)
    if err != nil {
        return fmt.Errorf("security test failed: %w", err)
    }

    fmt.Printf("Security Test ID: %s\n", test.TestID)
    fmt.Printf("Overall Score: %.1f\n", test.OverallScore)
    fmt.Printf("Critical Findings: %d\n", len(test.CriticalFindings))

    // Print attack vector results
    for vector, result := range test.AttackVectorResults {
        fmt.Printf("%s: %s (Score: %.1f)\n",
            vector,
            result.Status,
            result.Score)
    }

    return nil
}
```

### Concurrent Operations

```go
package main

import (
    "context"
    "fmt"
    "sync"

    "github.com/bmad/sdk-go/bmad"
)

func runParallelScans(client *bmad.Client) error {
    ctx := context.Background()

    targets := []string{
        "domain1.com",
        "domain2.com",
        "domain3.com",
    }

    var wg sync.WaitGroup
    results := make(chan bmad.WorkflowExecutionResult, len(targets))

    for _, target := range targets {
        wg.Add(1)
        go func(target string) {
            defer wg.Done()

            req := bmad.WorkflowExecutionRequest{
                Parameters: map[string]interface{}{
                    "target": target,
                    "scan_type": "comprehensive",
                },
            }

            result, err := client.Workflows.Execute(ctx, "intel-team:osint-scan", req)
            if err != nil {
                fmt.Printf("Scan failed for %s: %v\n", target, err)
                return
            }

            results <- *result
        }(target)
    }

    wg.Wait()
    close(results)

    // Collect results
    for result := range results {
        fmt.Printf("Scan completed: %s (Status: %s)\n",
            result.ExecutionID,
            result.Status)
    }

    return nil
}
```

### Error Handling

```go
package main

import (
    "context"
    "errors"
    "fmt"

    "github.com/bmad/sdk-go/bmad"
)

func handleBmadErrors(client *bmad.Client) {
    ctx := context.Background()

    _, err := client.Workflows.Execute(ctx, "invalid-workflow", bmad.WorkflowExecutionRequest{})
    if err != nil {
        var apiErr *bmad.APIError
        var timeoutErr *bmad.TimeoutError
        var rateLimitErr *bmad.RateLimitError

        switch {
        case errors.As(err, &apiErr):
            fmt.Printf("API Error: %s (Code: %s, Status: %d)\n",
                apiErr.Message,
                apiErr.Code,
                apiErr.StatusCode)

        case errors.As(err, &timeoutErr):
            fmt.Printf("Timeout Error: operation timed out after %v\n",
                timeoutErr.Timeout)

        case errors.As(err, &rateLimitErr):
            fmt.Printf("Rate Limit Error: retry after %v\n",
                rateLimitErr.RetryAfter)

        default:
            fmt.Printf("Unknown error: %v\n", err)
        }
    }
}
```

---

## Java SDK

### Installation

#### Maven
```xml
<dependency>
    <groupId>com.bmad</groupId>
    <artifactId>sdk-java</artifactId>
    <version>2.0.0</version>
</dependency>
```

#### Gradle
```groovy
implementation 'com.bmad:sdk-java:2.0.0'
```

### Core Client

```java
package com.example.bmad;

import com.bmad.sdk.BmadClient;
import com.bmad.sdk.BmadConfig;
import com.bmad.sdk.models.*;
import com.bmad.sdk.exceptions.*;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

public class BmadExample {

    public static void main(String[] args) {
        // Initialize client
        BmadConfig config = BmadConfig.builder()
            .apiKey("your-api-key")
            .baseUrl("https://api.bmad-enterprise.com/v2")
            .timeout(Duration.ofSeconds(30))
            .maxRetries(3)
            .build();

        BmadClient client = new BmadClient(config);

        // Test connection
        try {
            HealthResponse health = client.health().check();
            System.out.println("BMAD Status: " + health.getStatus());
        } catch (BmadException e) {
            System.err.println("Health check failed: " + e.getMessage());
        }
    }
}
```

### Module Installation

```java
import com.bmad.sdk.models.installation.*;

public class ModuleInstallation {

    public void installModule(BmadClient client) {
        try {
            // Configure installation
            InstallationOptions options = InstallationOptions.builder()
                .validateDependencies(true)
                .enableRollback(true)
                .verbose(true)
                .build();

            InstallationRequest request = InstallationRequest.builder()
                .modules(List.of("@bmad-cybercommand/cybersec-team"))
                .options(options)
                .build();

            // Start installation
            InstallationResponse installation = client.installation()
                .installModules(request);

            System.out.println("Installation ID: " + installation.getInstallationId());

            // Monitor progress
            monitorInstallation(client, installation.getInstallationId());

        } catch (BmadApiException e) {
            System.err.println("Installation failed: " + e.getMessage());
            System.err.println("Error code: " + e.getErrorCode());
        }
    }

    private void monitorInstallation(BmadClient client, String installationId) {
        while (true) {
            try {
                InstallationStatusResponse status = client.installation()
                    .getStatus(installationId);

                System.out.printf("Progress: %.1f%%\n",
                    status.getProgress().getPercentage());

                if ("completed".equals(status.getStatus())) {
                    System.out.println("Installation completed successfully!");
                    break;
                } else if ("failed".equals(status.getStatus())) {
                    System.err.println("Installation failed: " + status.getError());
                    break;
                }

                Thread.sleep(5000);

            } catch (Exception e) {
                System.err.println("Failed to get status: " + e.getMessage());
                break;
            }
        }
    }
}
```

### Workflow Execution

```java
import com.bmad.sdk.models.workflows.*;

public class WorkflowExecution {

    public void executeWorkflow(BmadClient client) {
        try {
            // Configure workflow execution
            Map<String, Object> parameters = Map.of(
                "target", "suspicious-domain.com",
                "depth", "comprehensive"
            );

            WorkflowExecutionOptions options = WorkflowExecutionOptions.builder()
                .timeout(300)
                .priority(Priority.HIGH)
                .async(false)
                .build();

            WorkflowExecutionRequest request = WorkflowExecutionRequest.builder()
                .parameters(parameters)
                .options(options)
                .build();

            // Execute workflow
            WorkflowExecutionResponse result = client.workflows()
                .execute("cybersec-team:threat-analysis", request);

            System.out.println("Execution ID: " + result.getExecutionId());
            System.out.println("Status: " + result.getStatus());

            // Process results
            if (result.getResult().containsKey("findings")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> findings =
                    (List<Map<String, Object>>) result.getResult().get("findings");

                System.out.println("Found " + findings.size() + " threat indicators");

                findings.forEach(finding -> {
                    System.out.printf("Finding: %s (Severity: %s)\n",
                        finding.get("title"),
                        finding.get("severity"));
                });
            }

        } catch (BmadException e) {
            System.err.println("Workflow execution failed: " + e.getMessage());
        }
    }

    public void executeAsyncWorkflow(BmadClient client) {
        // Async execution with CompletableFuture
        CompletableFuture<WorkflowExecutionResponse> future = client.workflows()
            .executeAsync("intel-team:osint-investigation",
                WorkflowExecutionRequest.builder()
                    .parameters(Map.of(
                        "target", "target-domain.com",
                        "scope", "comprehensive"
                    ))
                    .build());

        future.thenAccept(result -> {
            System.out.println("Async execution completed: " + result.getExecutionId());
        }).exceptionally(throwable -> {
            System.err.println("Async execution failed: " + throwable.getMessage());
            return null;
        });
    }
}
```

### Security Testing

```java
import com.bmad.sdk.models.security.*;

public class SecurityTesting {

    public void runSecurityTest(BmadClient client) {
        try {
            // Configure security test
            SecurityTestTarget target = SecurityTestTarget.builder()
                .modules(List.of("cybersec-team", "intel-team"))
                .scope(TestScope.ENTERPRISE)
                .build();

            SecurityTestOptions options = SecurityTestOptions.builder()
                .attackVectors(List.of("all"))
                .complianceFramework("enterprise")
                .reportFormat(ReportFormat.DETAILED)
                .build();

            ComprehensiveTestRequest request = ComprehensiveTestRequest.builder()
                .target(target)
                .options(options)
                .build();

            // Run security test
            ComprehensiveTestResponse test = client.security()
                .runComprehensiveTest(request);

            System.out.println("Security Test ID: " + test.getTestId());
            System.out.println("Overall Score: " + test.getOverallScore());
            System.out.println("Critical Findings: " + test.getCriticalFindings().size());

            // Print attack vector results
            test.getAttackVectorResults().forEach((vector, result) -> {
                System.out.printf("%s: %s (Score: %.1f)\n",
                    vector,
                    result.getStatus(),
                    result.getScore());
            });

        } catch (BmadException e) {
            System.err.println("Security test failed: " + e.getMessage());
        }
    }
}
```

### Real-time Event Streaming

```java
import com.bmad.sdk.streaming.*;

public class EventStreaming {

    public void monitorSecurityEvents(BmadClient client) {
        // Create event stream
        SecurityEventStream eventStream = client.security()
            .monitorRealTime(SecurityMonitoringRequest.builder()
                .modules(List.of("cybersec-team"))
                .alertLevel(AlertLevel.WARNING)
                .build());

        // Register event handlers
        eventStream.onAlert(alert -> {
            System.out.printf("🚨 ALERT: %s - %s\n",
                alert.getTitle(),
                alert.getSeverity());

            if (alert.getSeverity() == Severity.CRITICAL) {
                // Trigger incident response
                initiateIncidentResponse(client, alert);
            }
        });

        eventStream.onEvent(event -> {
            System.out.printf("Event: %s - %s\n",
                event.getType(),
                event.getDescription());
        });

        // Start streaming
        eventStream.start();

        // Keep alive
        try {
            Thread.currentThread().join();
        } catch (InterruptedException e) {
            eventStream.stop();
        }
    }

    private void initiateIncidentResponse(BmadClient client, SecurityAlert alert) {
        try {
            IncidentResponseRequest request = IncidentResponseRequest.builder()
                .incidentType(IncidentType.SECURITY_BREACH)
                .severity(Severity.CRITICAL)
                .description(alert.getDescription())
                .containmentRequired(true)
                .build();

            IncidentResponseResponse response = client.security()
                .initiateIncidentResponse(request);

            System.out.println("Incident response initiated: " + response.getIncidentId());

        } catch (BmadException e) {
            System.err.println("Failed to initiate incident response: " + e.getMessage());
        }
    }
}
```

### Error Handling and Logging

```java
import com.bmad.sdk.exceptions.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ErrorHandlingExample {
    private static final Logger logger = LoggerFactory.getLogger(ErrorHandlingExample.class);

    public void handleBmadExceptions(BmadClient client) {
        try {
            client.workflows().execute("invalid-workflow",
                WorkflowExecutionRequest.builder().build());

        } catch (BmadApiException e) {
            logger.error("API Error: {} (Code: {}, Status: {})",
                e.getMessage(),
                e.getErrorCode(),
                e.getStatusCode());

            // Handle specific error codes
            switch (e.getErrorCode()) {
                case "WORKFLOW_NOT_FOUND":
                    logger.info("Workflow does not exist, checking alternatives...");
                    break;
                case "INSUFFICIENT_PERMISSIONS":
                    logger.error("User lacks required permissions");
                    break;
                default:
                    logger.error("Unhandled API error: {}", e.getErrorCode());
            }

        } catch (BmadTimeoutException e) {
            logger.warn("Request timed out after {} seconds", e.getTimeoutSeconds());
            // Implement retry logic

        } catch (BmadRateLimitException e) {
            logger.warn("Rate limited. Retry after {} seconds", e.getRetryAfterSeconds());
            try {
                Thread.sleep(e.getRetryAfterSeconds() * 1000);
                // Retry the request
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }

        } catch (BmadException e) {
            logger.error("Unknown BMAD error: {}", e.getMessage(), e);
        }
    }
}
```

---

## C# SDK

### Installation

```bash
dotnet add package BMad.SDK
# or via Package Manager
Install-Package BMad.SDK
```

### Core Client

```csharp
using BMad.SDK;
using BMad.SDK.Models;
using BMad.SDK.Exceptions;

namespace BMadExample
{
    class Program
    {
        static async Task Main(string[] args)
        {
            // Initialize client
            var config = new BmadConfig
            {
                ApiKey = "your-api-key",
                BaseUrl = "https://api.bmad-enterprise.com/v2",
                Timeout = TimeSpan.FromSeconds(30),
                MaxRetries = 3
            };

            var client = new BmadClient(config);

            try
            {
                // Test connection
                var health = await client.Health.CheckAsync();
                Console.WriteLine($"BMAD Status: {health.Status}");
            }
            catch (BmadException ex)
            {
                Console.WriteLine($"Health check failed: {ex.Message}");
            }
        }
    }
}
```

### Module Installation

```csharp
using BMad.SDK.Models.Installation;

public class ModuleInstallationService
{
    public async Task InstallModuleAsync(BmadClient client)
    {
        try
        {
            var options = new InstallationOptions
            {
                ValidateDependencies = true,
                EnableRollback = true,
                Verbose = true
            };

            var request = new InstallationRequest
            {
                Modules = new[] { "@bmad-cybercommand/cybersec-team" },
                Options = options
            };

            var installation = await client.Installation.InstallModulesAsync(request);
            Console.WriteLine($"Installation ID: {installation.InstallationId}");

            // Monitor progress
            await MonitorInstallationAsync(client, installation.InstallationId);
        }
        catch (BmadApiException ex)
        {
            Console.WriteLine($"Installation failed: {ex.Message}");
            Console.WriteLine($"Error code: {ex.ErrorCode}");
        }
    }

    private async Task MonitorInstallationAsync(BmadClient client, string installationId)
    {
        while (true)
        {
            try
            {
                var status = await client.Installation.GetStatusAsync(installationId);
                Console.WriteLine($"Progress: {status.Progress.Percentage:F1}%");

                if (status.Status == "completed")
                {
                    Console.WriteLine("Installation completed successfully!");
                    break;
                }
                else if (status.Status == "failed")
                {
                    Console.WriteLine($"Installation failed: {status.Error}");
                    break;
                }

                await Task.Delay(5000);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to get status: {ex.Message}");
                break;
            }
        }
    }
}
```

### Workflow Execution

```csharp
using BMad.SDK.Models.Workflows;

public class WorkflowService
{
    public async Task ExecuteWorkflowAsync(BmadClient client)
    {
        try
        {
            var parameters = new Dictionary<string, object>
            {
                ["target"] = "suspicious-domain.com",
                ["depth"] = "comprehensive"
            };

            var options = new WorkflowExecutionOptions
            {
                Timeout = 300,
                Priority = Priority.High,
                Async = false
            };

            var request = new WorkflowExecutionRequest
            {
                Parameters = parameters,
                Options = options
            };

            var result = await client.Workflows.ExecuteAsync(
                "cybersec-team:threat-analysis",
                request);

            Console.WriteLine($"Execution ID: {result.ExecutionId}");
            Console.WriteLine($"Status: {result.Status}");

            // Process results
            if (result.Result.TryGetValue("findings", out var findingsObj) &&
                findingsObj is IEnumerable<object> findings)
            {
                var findingsList = findings.Cast<Dictionary<string, object>>().ToList();
                Console.WriteLine($"Found {findingsList.Count} threat indicators");

                foreach (var finding in findingsList)
                {
                    Console.WriteLine($"Finding: {finding["title"]} (Severity: {finding["severity"]})");
                }
            }
        }
        catch (BmadException ex)
        {
            Console.WriteLine($"Workflow execution failed: {ex.Message}");
        }
    }

    public async Task ExecuteAsyncWorkflowAsync(BmadClient client)
    {
        var request = new WorkflowExecutionRequest
        {
            Parameters = new Dictionary<string, object>
            {
                ["target"] = "target-domain.com",
                ["scope"] = "comprehensive"
            }
        };

        try
        {
            var result = await client.Workflows.ExecuteAsync(
                "intel-team:osint-investigation",
                request);

            Console.WriteLine($"Async execution completed: {result.ExecutionId}");
        }
        catch (BmadException ex)
        {
            Console.WriteLine($"Async execution failed: {ex.Message}");
        }
    }
}
```

### Security Testing

```csharp
using BMad.SDK.Models.Security;

public class SecurityTestingService
{
    public async Task RunSecurityTestAsync(BmadClient client)
    {
        try
        {
            var target = new SecurityTestTarget
            {
                Modules = new[] { "cybersec-team", "intel-team" },
                Scope = TestScope.Enterprise
            };

            var options = new SecurityTestOptions
            {
                AttackVectors = new[] { "all" },
                ComplianceFramework = "enterprise",
                ReportFormat = ReportFormat.Detailed
            };

            var request = new ComprehensiveTestRequest
            {
                Target = target,
                Options = options
            };

            var test = await client.Security.RunComprehensiveTestAsync(request);

            Console.WriteLine($"Security Test ID: {test.TestId}");
            Console.WriteLine($"Overall Score: {test.OverallScore}");
            Console.WriteLine($"Critical Findings: {test.CriticalFindings.Count}");

            // Print attack vector results
            foreach (var (vector, result) in test.AttackVectorResults)
            {
                Console.WriteLine($"{vector}: {result.Status} (Score: {result.Score:F1})");
            }
        }
        catch (BmadException ex)
        {
            Console.WriteLine($"Security test failed: {ex.Message}");
        }
    }
}
```

### Real-time Event Streaming

```csharp
using BMad.SDK.Streaming;

public class EventStreamingService
{
    public async Task MonitorSecurityEventsAsync(BmadClient client)
    {
        var request = new SecurityMonitoringRequest
        {
            Modules = new[] { "cybersec-team" },
            AlertLevel = AlertLevel.Warning
        };

        var eventStream = await client.Security.MonitorRealTimeAsync(request);

        // Register event handlers
        eventStream.OnAlert += (alert) =>
        {
            Console.WriteLine($"🚨 ALERT: {alert.Title} - {alert.Severity}");

            if (alert.Severity == Severity.Critical)
            {
                // Trigger incident response
                _ = InitiateIncidentResponseAsync(client, alert);
            }
        };

        eventStream.OnEvent += (securityEvent) =>
        {
            Console.WriteLine($"Event: {securityEvent.Type} - {securityEvent.Description}");
        };

        // Start streaming
        await eventStream.StartAsync();

        // Keep alive
        Console.WriteLine("Monitoring security events. Press any key to stop...");
        Console.ReadKey();

        await eventStream.StopAsync();
    }

    private async Task InitiateIncidentResponseAsync(BmadClient client, SecurityAlert alert)
    {
        try
        {
            var request = new IncidentResponseRequest
            {
                IncidentType = IncidentType.SecurityBreach,
                Severity = Severity.Critical,
                Description = alert.Description,
                ContainmentRequired = true
            };

            var response = await client.Security.InitiateIncidentResponseAsync(request);
            Console.WriteLine($"Incident response initiated: {response.IncidentId}");
        }
        catch (BmadException ex)
        {
            Console.WriteLine($"Failed to initiate incident response: {ex.Message}");
        }
    }
}
```

### Error Handling and Logging

```csharp
using Microsoft.Extensions.Logging;
using BMad.SDK.Exceptions;

public class ErrorHandlingService
{
    private readonly ILogger<ErrorHandlingService> _logger;

    public ErrorHandlingService(ILogger<ErrorHandlingService> logger)
    {
        _logger = logger;
    }

    public async Task HandleBmadExceptionsAsync(BmadClient client)
    {
        try
        {
            await client.Workflows.ExecuteAsync("invalid-workflow",
                new WorkflowExecutionRequest());
        }
        catch (BmadApiException ex)
        {
            _logger.LogError("API Error: {Message} (Code: {Code}, Status: {Status})",
                ex.Message, ex.ErrorCode, ex.StatusCode);

            // Handle specific error codes
            switch (ex.ErrorCode)
            {
                case "WORKFLOW_NOT_FOUND":
                    _logger.LogInformation("Workflow does not exist, checking alternatives...");
                    break;
                case "INSUFFICIENT_PERMISSIONS":
                    _logger.LogError("User lacks required permissions");
                    break;
                default:
                    _logger.LogError("Unhandled API error: {Code}", ex.ErrorCode);
                    break;
            }
        }
        catch (BmadTimeoutException ex)
        {
            _logger.LogWarning("Request timed out after {Timeout} seconds", ex.TimeoutSeconds);
            // Implement retry logic
        }
        catch (BmadRateLimitException ex)
        {
            _logger.LogWarning("Rate limited. Retry after {RetryAfter} seconds", ex.RetryAfterSeconds);
            await Task.Delay(TimeSpan.FromSeconds(ex.RetryAfterSeconds));
            // Retry the request
        }
        catch (BmadException ex)
        {
            _logger.LogError(ex, "Unknown BMAD error: {Message}", ex.Message);
        }
    }
}
```

### Dependency Injection Setup

```csharp
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

public class Startup
{
    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        // Configure BMAD client
        services.AddSingleton<BmadClient>(serviceProvider =>
        {
            var config = new BmadConfig
            {
                ApiKey = configuration["BMad:ApiKey"],
                BaseUrl = configuration["BMad:BaseUrl"],
                Timeout = TimeSpan.FromSeconds(30),
                MaxRetries = 3
            };

            return new BmadClient(config);
        });

        // Register services
        services.AddScoped<ModuleInstallationService>();
        services.AddScoped<WorkflowService>();
        services.AddScoped<SecurityTestingService>();
        services.AddScoped<EventStreamingService>();
    }
}
```

---

## cURL Examples

### Authentication

```bash
# API Key Authentication
curl -X GET "https://api.bmad-enterprise.com/v2/health" \
  -H "X-API-Key: your-api-key"

# Bearer Token Authentication
curl -X GET "https://api.bmad-enterprise.com/v2/health" \
  -H "Authorization: Bearer your-jwt-token"
```

### Module Installation

```bash
# Install single module
curl -X POST "https://api.bmad-enterprise.com/v2/installation" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "modules": ["@bmad-cybercommand/cybersec-team"],
    "options": {
      "validateDependencies": true,
      "enableRollback": true,
      "verbose": true
    }
  }'

# Check installation status
curl -X GET "https://api.bmad-enterprise.com/v2/installation/bmad_install_1kz2m3p_a1b2c3d4" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Install multiple modules
curl -X POST "https://api.bmad-enterprise.com/v2/installation" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "modules": [
      "@bmad-cybercommand/cybersec-team",
      "@bmad-cybercommand/intel-team"
    ],
    "options": {
      "validateDependencies": true,
      "enableRollback": true
    }
  }'
```

### Agent Management

```bash
# List all agents
curl -X GET "https://api.bmad-enterprise.com/v2/agents" \
  -H "Authorization: Bearer YOUR_TOKEN"

# List agents by team
curl -X GET "https://api.bmad-enterprise.com/v2/agents?team=cybersec-team&status=active" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get specific agent details
curl -X GET "https://api.bmad-enterprise.com/v2/agents/cybersec-team:bastion" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update agent configuration
curl -X PUT "https://api.bmad-enterprise.com/v2/agents/cybersec-team:bastion" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "configuration": {
      "securityLevel": "high",
      "enableAuditLogging": true
    }
  }'
```

### Workflow Execution

```bash
# Execute workflow synchronously
curl -X POST "https://api.bmad-enterprise.com/v2/workflows/intel-team:threat-assessment" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "target": "suspicious-domain.com",
      "depth": "comprehensive"
    },
    "options": {
      "timeout": 300,
      "priority": "high"
    }
  }'

# Execute workflow asynchronously
curl -X POST "https://api.bmad-enterprise.com/v2/workflows/intel-team:operation-mosaic" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "targets": ["domain1.com", "domain2.com"],
      "analysisDepth": "deep"
    },
    "options": {
      "async": true,
      "priority": "high"
    }
  }'

# Get workflow execution status
curl -X GET "https://api.bmad-enterprise.com/v2/workflows/executions/exec_123456789" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Security Testing

```bash
# Run comprehensive security test
curl -X POST "https://api.bmad-enterprise.com/v2/security/test/comprehensive" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target": {
      "modules": ["cybersec-team", "intel-team"],
      "scope": "enterprise"
    },
    "options": {
      "attackVectors": "all",
      "complianceFramework": "enterprise",
      "reportFormat": "comprehensive"
    }
  }'

# Test specific attack vector
curl -X POST "https://api.bmad-enterprise.com/v2/security/test/attack-vector/direct_prompt_injection" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target": {
      "modules": ["cybersec-team"]
    },
    "options": {
      "intensity": "comprehensive"
    }
  }'

# Get security posture assessment
curl -X GET "https://api.bmad-enterprise.com/v2/security/security-posture?detailLevel=comprehensive" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Abdul Orchestration

```bash
# Request Abdul orchestration
curl -X POST "https://api.bmad-enterprise.com/v2/orchestration/abdul" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requestType": "crisis_response",
    "description": "Security incident requiring multi-team coordination",
    "priority": "urgent",
    "requiredTeams": ["cybersec-team", "intel-team", "legal-team"]
  }'

# Initiate Party Mode
curl -X POST "https://api.bmad-enterprise.com/v2/orchestration/party-mode" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionName": "Incident Response Session",
    "participants": ["cybersec-team:bastion", "intel-team:ghost", "legal-team:counsel"],
    "objective": "Coordinate response to data breach incident"
  }'
```

### Health and Monitoring

```bash
# Check API health
curl -X GET "https://api.bmad-enterprise.com/v2/health" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get system health
curl -X GET "https://api.bmad-enterprise.com/v2/registry/health?detail=comprehensive" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Stream real-time events (Server-Sent Events)
curl -X GET "https://api.bmad-enterprise.com/v2/events/stream?eventTypes=agent_activation,workflow_execution" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: text/event-stream"
```

---

## Error Handling

### Standard Error Response Format

All BMAD APIs return consistent error responses:

```json
{
  "success": false,
  "error": "Workflow execution failed",
  "code": "WORKFLOW_EXECUTION_ERROR",
  "message": "The specified workflow could not be executed due to missing dependencies",
  "details": {
    "workflowId": "intel-team:invalid-workflow",
    "missingDependencies": ["python-requests", "nmap"],
    "suggestedActions": [
      "Install missing dependencies",
      "Check workflow configuration"
    ]
  },
  "timestamp": "2026-01-24T15:30:45.123Z",
  "requestId": "req_abc123def456"
}
```

### Common Error Codes

| Error Code | HTTP Status | Description | Retry Recommended |
|------------|-------------|-------------|-------------------|
| `INVALID_API_KEY` | 401 | API key is invalid or expired | No |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions | No |
| `WORKFLOW_NOT_FOUND` | 404 | Specified workflow does not exist | No |
| `MODULE_NOT_INSTALLED` | 404 | Required module is not installed | No |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Yes (with backoff) |
| `WORKFLOW_TIMEOUT` | 408 | Workflow execution timed out | Yes |
| `DEPENDENCY_CONFLICT` | 409 | Module dependency conflict | No |
| `INSTALLATION_FAILED` | 422 | Module installation failed | Maybe |
| `SECURITY_TEST_FAILED` | 422 | Security test execution failed | Yes |
| `INTERNAL_ERROR` | 500 | Unexpected server error | Yes |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable | Yes |

### Error Handling Best Practices

#### Exponential Backoff

```typescript
// JavaScript/TypeScript
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (error instanceof BmadRateLimitError) {
        // Respect rate limit headers
        await sleep(error.retryAfter * 1000);
        continue;
      }

      if (error instanceof BmadTimeoutError && attempt < maxRetries) {
        // Exponential backoff for timeouts
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await sleep(delay);
        continue;
      }

      if (error instanceof BmadApiError && error.statusCode >= 500 && attempt < maxRetries) {
        // Retry server errors
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await sleep(delay);
        continue;
      }

      // Don't retry client errors (4xx)
      throw error;
    }
  }

  throw lastError!;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

#### Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold = 5,
    private timeout = 60000,
    private monitoringWindow = 120000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is OPEN');
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
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }
}
```

---

## Rate Limiting

### Rate Limit Headers

BMAD APIs include rate limit information in response headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 3600
```

### Rate Limit Handling

```typescript
// JavaScript/TypeScript
async function makeRequestWithRateLimit(client: BmadClient, operation: () => Promise<any>) {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof BmadRateLimitError) {
      console.log(`Rate limited. Waiting ${error.retryAfter} seconds...`);
      await sleep(error.retryAfter * 1000);
      return await operation(); // Retry once
    }
    throw error;
  }
}
```

```python
# Python
import time
from bmad_sdk.exceptions import BmadRateLimitError

def make_request_with_rate_limit(client, operation):
    try:
        return operation()
    except BmadRateLimitError as e:
        print(f"Rate limited. Waiting {e.retry_after} seconds...")
        time.sleep(e.retry_after)
        return operation()  # Retry once
```

### Rate Limits by Endpoint

| Endpoint Category | Rate Limit | Window | Burst Limit |
|-------------------|------------|--------|-------------|
| **Authentication** | 20 req/min | 1 minute | 10 |
| **Module Installation** | 5 req/min | 1 minute | 2 |
| **Workflow Execution** | 50 req/min | 1 minute | 10 |
| **Agent Operations** | 100 req/min | 1 minute | 20 |
| **Security Testing** | 10 req/hour | 1 hour | 3 |
| **Real-time Monitoring** | Unlimited | - | - |
| **Health Checks** | Unlimited | - | - |

---

## Best Practices

### 1. Authentication Security

```typescript
// Store API keys securely
const client = new BmadClient({
  apiKey: process.env.BMAD_API_KEY, // Never hardcode
  baseUrl: process.env.BMAD_BASE_URL
});

// Rotate API keys regularly
async function rotateApiKey(client: BmadClient) {
  const newKey = await client.auth.rotateApiKey();
  // Update environment variables
  process.env.BMAD_API_KEY = newKey.apiKey;
}
```

### 2. Resource Management

```typescript
// Use connection pooling
const client = new BmadClient({
  apiKey: 'your-api-key',
  httpAgent: new Agent({
    keepAlive: true,
    maxSockets: 10
  })
});

// Cleanup resources
process.on('SIGTERM', async () => {
  await client.close();
  process.exit(0);
});
```

### 3. Error Logging

```typescript
// Structured logging
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'bmad-errors.log', level: 'error' }),
    new winston.transports.File({ filename: 'bmad-combined.log' })
  ]
});

try {
  const result = await client.workflows.execute('workflow-id', params);
} catch (error) {
  logger.error('Workflow execution failed', {
    workflowId: 'workflow-id',
    error: error.message,
    requestId: error.requestId,
    timestamp: new Date().toISOString()
  });
}
```

### 4. Performance Optimization

```typescript
// Batch operations when possible
const workflows = ['workflow1', 'workflow2', 'workflow3'];
const results = await Promise.allSettled(
  workflows.map(id => client.workflows.execute(id, {}))
);

// Use streaming for large datasets
const eventStream = client.integration.getEventStream();
eventStream.on('data', (chunk) => {
  // Process chunk immediately
  processEvent(chunk);
});
```

### 5. Testing

```typescript
// Use mock client for testing
import { MockBmadClient } from '@bmad/sdk-js/testing';

describe('BMAD Integration', () => {
  let client: MockBmadClient;

  beforeEach(() => {
    client = new MockBmadClient();
  });

  it('should execute workflow successfully', async () => {
    // Mock response
    client.workflows.execute.mockResolvedValue({
      executionId: 'test-execution',
      status: 'completed',
      result: { findings: [] }
    });

    const result = await client.workflows.execute('test-workflow', {});
    expect(result.status).toBe('completed');
  });
});
```

### 6. Configuration Management

```typescript
// Use configuration files
interface BmadClientConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  retries: number;
  environment: 'development' | 'staging' | 'production';
}

// Load configuration based on environment
function loadConfig(): BmadClientConfig {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return {
        apiKey: process.env.BMAD_API_KEY!,
        baseUrl: 'https://api.bmad-enterprise.com/v2',
        timeout: 30000,
        retries: 3,
        environment: 'production'
      };

    case 'staging':
      return {
        apiKey: process.env.BMAD_STAGING_API_KEY!,
        baseUrl: 'https://staging-api.bmad-enterprise.com/v2',
        timeout: 15000,
        retries: 2,
        environment: 'staging'
      };

    default:
      return {
        apiKey: process.env.BMAD_DEV_API_KEY!,
        baseUrl: 'http://localhost:3000/api/v2',
        timeout: 10000,
        retries: 1,
        environment: 'development'
      };
  }
}
```

### 7. Monitoring and Observability

```typescript
// Instrument SDK calls
import { trace, context } from '@opentelemetry/api';

const tracer = trace.getTracer('@bmad/sdk-js');

async function executeWorkflowWithTracing(workflowId: string, params: any) {
  const span = tracer.startSpan('bmad.workflow.execute', {
    attributes: {
      'bmad.workflow.id': workflowId,
      'bmad.workflow.team': workflowId.split(':')[0]
    }
  });

  try {
    const result = await context.with(trace.setSpan(context.active(), span), () =>
      client.workflows.execute(workflowId, params)
    );

    span.setStatus({ code: trace.SpanStatusCode.OK });
    span.setAttributes({
      'bmad.workflow.execution.id': result.executionId,
      'bmad.workflow.execution.status': result.status
    });

    return result;
  } catch (error) {
    span.setStatus({
      code: trace.SpanStatusCode.ERROR,
      message: error.message
    });
    throw error;
  } finally {
    span.end();
  }
}
```

---

This completes the comprehensive Developer SDK Guide for BMAD-CYBER2. The guide provides complete coverage of all supported programming languages with practical examples, error handling patterns, and enterprise best practices for integrating with the BMAD framework.