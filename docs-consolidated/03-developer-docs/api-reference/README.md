# BMAD Specialized Teams - API Reference

## Table of Contents

- [Core API](#core-api)
- [Team Management](#team-management)
- [Agent Interaction](#agent-interaction)
- [Workflow Execution](#workflow-execution)
- [Configuration](#configuration)
- [Error Handling](#error-handling)

## Core API

### BMADTeams Class

Main entry point for all BMAD Specialized Teams functionality.

```javascript
const BMADTeams = require('@bmad-cybercommand/meta-package');

const bmad = new BMADTeams(options);
```

#### Constructor Options

```typescript
interface BMADOptions {
    configPath?: string;           // Path to config file
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    outputPath?: string;           // Output directory
    teams?: string[];              // Teams to enable
}
```

#### Methods

##### initialize()

Initialize all teams and agents.

```javascript
await bmad.initialize();
```

##### getTeams()

Get list of available teams.

```javascript
const teams = bmad.getTeams();
// Returns: ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team']
```

##### getTeam(teamId)

Get specific team instance.

```javascript
const cybersecTeam = bmad.getTeam('cybersec-team');
```

## Team Management

### Team Class

Represents a specialized team module.

#### Methods

##### getAgents()

Get all agents in the team.

```javascript
const agents = team.getAgents();
```

##### getAgent(agentId)

Get specific agent.

```javascript
const agent = team.getAgent('security-architect');
```

##### getWorkflows()

Get all workflows in the team.

```javascript
const workflows = team.getWorkflows();
```

##### getWorkflow(workflowId)

Get specific workflow.

```javascript
const workflow = team.getWorkflow('incident-response');
```

## Agent Interaction

### Agent Class

Represents an individual AI agent.

#### Properties

```typescript
interface Agent {
    id: string;                    // Agent identifier
    name: string;                  // Display name
    codename: string;              // Agent codename
    title: string;                 // Agent title/role
    description: string;           // Agent description
    capabilities: string[];        // Agent capabilities
    team: string;                  // Parent team ID
}
```

#### Methods

##### execute(command, options)

Execute an agent command.

```javascript
const result = await agent.execute('analyze-threat', {
    target: 'suspicious-file.exe',
    depth: 'comprehensive'
});
```

##### getMenu()

Get agent's available commands.

```javascript
const menu = agent.getMenu();
```

##### getCapabilities()

Get agent's capabilities.

```javascript
const capabilities = agent.getCapabilities();
```

## Workflow Execution

### Workflow Class

Represents a multi-step workflow.

#### Properties

```typescript
interface Workflow {
    id: string;                    // Workflow identifier
    name: string;                  // Display name
    description: string;           // Workflow description
    version: string;               // Version number
    steps: WorkflowStep[];         // Workflow steps
    team: string;                  // Parent team ID
}

interface WorkflowStep {
    name: string;                  // Step name
    agent: string;                 // Agent responsible
    description: string;           // Step description
    required: boolean;             // Is step required
}
```

#### Methods

##### execute(parameters)

Execute the complete workflow.

```javascript
const result = await workflow.execute({
    target: 'example.com',
    scope: 'comprehensive',
    outputFormat: 'json'
});
```

##### executeStep(stepIndex, parameters)

Execute a specific workflow step.

```javascript
const stepResult = await workflow.executeStep(0, {
    target: 'example.com'
});
```

##### getProgress()

Get workflow execution progress.

```javascript
const progress = workflow.getProgress();
```

## Configuration

### Configuration Options

#### Global Configuration

```typescript
interface GlobalConfig {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    outputPath: string;
    maxConcurrentWorkflows: number;
    timeoutMs: number;
}
```

#### Team Configuration

```typescript
interface TeamConfig {
    enabled: boolean;
    agents: Record<string, AgentConfig>;
    workflows: Record<string, WorkflowConfig>;
}

interface AgentConfig {
    enabled: boolean;
    customization?: Record<string, any>;
}

interface WorkflowConfig {
    enabled: boolean;
    defaultParameters?: Record<string, any>;
}
```

### Configuration Methods

##### setConfig(config)

Update configuration.

```javascript
bmad.setConfig({
    logLevel: 'debug',
    outputPath: './custom-output'
});
```

##### getConfig()

Get current configuration.

```javascript
const config = bmad.getConfig();
```

## Error Handling

### Error Types

#### BMADError

Base error class for all BMAD errors.

```typescript
class BMADError extends Error {
    code: string;
    team?: string;
    agent?: string;
    workflow?: string;
}
```

#### TeamNotFoundError

Thrown when requesting non-existent team.

#### AgentNotFoundError

Thrown when requesting non-existent agent.

#### WorkflowExecutionError

Thrown when workflow execution fails.

#### ConfigurationError

Thrown for configuration-related issues.

### Error Handling Examples

```javascript
try {
    const result = await bmad.executeWorkflow('intel-team:flash-assessment', {
        target: 'example.com'
    });
} catch (error) {
    if (error instanceof WorkflowExecutionError) {
        console.error('Workflow failed:', error.message);
        console.error('Failed step:', error.step);
    } else {
        console.error('Unexpected error:', error);
    }
}
```

## Utility Functions

### Validation

#### validateConfig(config)

Validate configuration object.

```javascript
const isValid = bmad.validateConfig(config);
```

#### validateWorkflowParameters(workflowId, parameters)

Validate workflow parameters.

```javascript
const isValid = bmad.validateWorkflowParameters('intel-team:flash-assessment', {
    target: 'example.com'
});
```

### Information

#### getVersion()

Get BMAD version information.

```javascript
const version = bmad.getVersion();
// Returns: { version: '1.0.0', build: '2024-01-23', teams: {...} }
```

#### getSystemInfo()

Get system information.

```javascript
const sysInfo = bmad.getSystemInfo();
```

## Events

### Event Emitter

BMAD Teams extends EventEmitter for real-time notifications.

```javascript
// Listen for workflow progress
bmad.on('workflow:progress', (data) => {
    console.log(`Workflow ${data.workflowId} progress: ${data.progress}%`);
});

// Listen for agent execution
bmad.on('agent:execute', (data) => {
    console.log(`Agent ${data.agentId} executing: ${data.command}`);
});

// Listen for errors
bmad.on('error', (error) => {
    console.error('BMAD Error:', error);
});
```

### Available Events

- `workflow:start` - Workflow execution started
- `workflow:progress` - Workflow progress update
- `workflow:complete` - Workflow execution completed
- `workflow:error` - Workflow execution error
- `agent:execute` - Agent command execution
- `agent:complete` - Agent command completed
- `config:changed` - Configuration updated
- `error` - General error occurred

---

*API Reference generated by BMAD Documentation System v1.0.0*
