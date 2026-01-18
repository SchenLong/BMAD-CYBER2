# BMAD-CYBER2 Developer Guide

> **Technical Documentation for Developers**
>
> Comprehensive guide to BMAD-CYBER2's architecture, development practices, and extension mechanisms for contributors and integrators.

---

## 🎯 Developer Quick Start

### New Contributors
1. **[Architecture Overview](architecture.md)** - Understand the platform design
2. **[Contributing Guide](contributing.md)** - Development workflow and standards
3. **[Testing Framework](testing-framework.md)** - Testing practices and tools
4. **[Local Development Setup](#local-development-setup)** - Get your dev environment ready

### Integration Developers
1. **[API Reference](api-reference.md)** - Integration endpoints and SDKs
2. **[Extension Guide](extending-bmad.md)** - Build custom agents and workflows
3. **[Security Guidelines](#security-considerations)** - Secure development practices
4. **[Performance Guide](../operations/performance-tuning.md)** - Optimization strategies

---

## 📋 Technical Documentation

### 🏗️ Core Architecture
| Document | Description | Audience |
|----------|-------------|----------|
| **[Architecture Deep Dive](architecture.md)** | Complete system architecture documentation | All developers |
| **[Security Architecture](architecture.md#security-layer)** | Defense-in-depth security design | Security developers |
| **[Module System](architecture.md#module-system)** | Modular architecture and plugin system | Extension developers |
| **[Hook System](architecture.md#hook-system)** | Pre/post execution hooks and validators | Integration developers |

### 🔧 Development
| Document | Description | Audience |
|----------|-------------|----------|
| **[Contributing Guide](contributing.md)** | Development workflow, standards, PR process | Contributors |
| **[Testing Framework](testing-framework.md)** | Testing strategies, tools, and practices | All developers |
| **[Code Style Guide](contributing.md#code-standards)** | Coding standards and best practices | All developers |
| **[Security Guidelines](contributing.md#security-guidelines)** | Secure development practices | All developers |

### 🚀 Extension & Integration
| Document | Description | Audience |
|----------|-------------|----------|
| **[Extending BMAD](extending-bmad.md)** | Build custom agents, workflows, and modules | Extension developers |
| **[API Reference](api-reference.md)** | REST APIs, SDKs, and integration patterns | Integration developers |
| **[Plugin Development](extending-bmad.md#plugin-system)** | Advanced plugin development | Advanced developers |
| **[Custom Validators](extending-bmad.md#security-validators)** | Build security validators | Security developers |

---

## 🏗️ System Architecture Overview

### Core Components
```
┌─────────────────────────────────────────────────────────────────┐
│                    BMAD-CYBER2 Architecture                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Configuration & Auth Layer                    │ │
│  │   RBAC │ Token Validation │ LLM Config │ Security Policies │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌────────────────────────────▼──────────────────────────────┐  │
│  │              Security & Validation Layer                  │  │
│  │   21 Validators │ Hook System │ Jailbreak Guard │ Audit   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                  │
│  ┌────────────────────────────▼──────────────────────────────┐  │
│  │                Agent Orchestration Layer                  │  │
│  │   80+ Agents │ Party Mode │ Workflow Engine │ State Mgmt │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                  │
│  ┌────────────────────────────▼──────────────────────────────┐  │
│  │                   Module Execution Layer                  │  │
│  │   143+ Workflows │ Multi-LLM │ Error Handling │ Logging  │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Statistics
- **Total Agents:** 80+
- **Total Workflows:** 143+
- **Security Validators:** 21
- **Hook Scripts:** 43+
- **Modules:** 9
- **RBAC Roles:** 9
- **Party Mode Presets:** 27

---

## 🛠️ Local Development Setup

### Prerequisites
```bash
# Required tools
- Claude Code CLI (Sonnet 4+ or Opus 4.5+)
- Git
- Node.js 18+ (for validators)
- Python 3.9+ (for legacy validators)
- GPG (for security verification)
```

### Development Environment
```bash
# Clone repository
git clone https://github.com/SchenLong/BMAD-CYBER2.git
cd BMAD-CYBER2

# Verify integrity
gpg --import _bmad/core/security/bmad-public-key.asc
./_bmad/core/security/verify-integrity.sh

# Setup development config
cp _bmad/core/configs/development/dev-config.yaml .claude/config.yaml

# Install development dependencies
cd .claude/validators-node
npm install

# Run tests
npm test
```

### Development Workflow
1. **Create Feature Branch** - `git checkout -b feature/your-feature`
2. **Develop & Test** - Follow [Testing Framework](testing-framework.md)
3. **Security Validation** - Run security validators
4. **Code Review** - Follow [Contributing Guide](contributing.md)
5. **Merge** - PR review and merge process

---

## 🔒 Security Considerations

### Security-First Development
- **Input Validation** - All inputs must pass through security validators
- **Authentication** - Every endpoint requires proper authentication
- **Authorization** - RBAC enforced on all operations
- **Audit Logging** - All security events must be logged
- **Secure Coding** - Follow OWASP secure coding practices

### Security Tools
```bash
# Security validation
./_bmad/core/security/validate-security.sh

# Dependency scanning
npm audit
pip-audit

# Static analysis
npm run lint:security
python -m bandit -r .

# Integration tests
npm run test:security
```

### Security Guidelines
- **Never commit secrets** - Use environment variables
- **Validate all inputs** - Implement comprehensive input validation
- **Follow principle of least privilege** - Minimal required permissions
- **Implement defense in depth** - Multiple security layers
- **Regular security reviews** - Code review with security focus

---

## 🚀 Extension Development

### Custom Agents
```yaml
# Agent definition template
agent:
  name: "custom-agent"
  description: "Custom agent description"
  role: "specialist"
  expertise: ["domain1", "domain2"]
  instructions: |
    Custom agent instructions and behavior
  tools: ["tool1", "tool2"]
  security_level: "standard"
```

### Custom Workflows
```yaml
# Workflow definition template
workflow:
  name: "custom-workflow"
  description: "Custom workflow description"
  type: "linear"
  complexity: 5
  agents: ["agent1", "agent2"]
  steps:
    - name: "Step 1"
      agent: "agent1"
      prompt: "Step 1 instructions"
    - name: "Step 2"
      agent: "agent2"
      prompt: "Step 2 instructions"
```

### Plugin System
```typescript
// Plugin interface
interface BMADPlugin {
  name: string;
  version: string;
  initialize(): Promise<void>;
  execute(context: ExecutionContext): Promise<PluginResult>;
  cleanup(): Promise<void>;
}

// Security validator interface
interface SecurityValidator {
  name: string;
  validate(input: ValidationInput): ValidationResult;
  priority: number;
}
```

---

## 📊 Performance & Monitoring

### Performance Metrics
- **Agent Response Time** - Target: <30 seconds
- **Workflow Completion** - Target: <5 minutes
- **Memory Usage** - Target: <2GB baseline
- **CPU Utilization** - Target: <80% sustained
- **Error Rate** - Target: <1% of operations

### Monitoring & Observability
```typescript
// Telemetry collection
interface TelemetryEvent {
  timestamp: string;
  event_type: string;
  agent_id?: string;
  workflow_id?: string;
  user_id?: string;
  metrics: Record<string, any>;
  security_context: SecurityContext;
}
```

### Performance Tools
- **Profiling** - Built-in performance profiling
- **Metrics Collection** - Comprehensive telemetry
- **Health Checks** - System health monitoring
- **Resource Monitoring** - CPU, memory, disk usage

---

## 🧪 Testing Strategy

### Test Categories
1. **Unit Tests** - Individual component testing
2. **Integration Tests** - Module interaction testing
3. **Security Tests** - Security validation testing
4. **Performance Tests** - Load and stress testing
5. **E2E Tests** - Complete workflow testing

### Testing Tools
```bash
# Unit testing
npm test                    # Node.js tests
pytest tests/              # Python tests

# Security testing
npm run test:security      # Security-specific tests
./security/validate-all.sh # Comprehensive security validation

# Performance testing
npm run test:performance   # Load testing
./benchmarks/run-all.sh   # Performance benchmarks
```

---

## 📚 API Reference

### Core APIs
- **Agent Management API** - Create, update, delete agents
- **Workflow Execution API** - Execute and monitor workflows
- **Security API** - Authentication, authorization, audit
- **Configuration API** - Platform configuration management
- **Telemetry API** - Metrics and monitoring data

### Integration Patterns
- **REST APIs** - Standard HTTP REST interfaces
- **WebSocket** - Real-time updates and notifications
- **Webhook** - Event-driven integrations
- **Plugin API** - Custom extension interfaces

---

## 🆘 Developer Support

### Documentation
- **[Complete API Docs](api-reference.md)** - Full API reference
- **[Extension Examples](extending-bmad.md#examples)** - Sample implementations
- **[Troubleshooting](../user-guide/troubleshooting.md)** - Common development issues
- **[Security Best Practices](contributing.md#security-guidelines)** - Secure development

### Community
- **GitHub Issues** - [Report bugs and request features](https://github.com/SchenLong/BMAD-CYBER2/issues)
- **Discussions** - [Developer discussions and Q&A](https://github.com/SchenLong/BMAD-CYBER2/discussions)
- **Contributing** - [How to contribute](contributing.md)

### Code Quality
- **Code Coverage** - Target: >80% test coverage
- **Security Scanning** - Automated vulnerability scanning
- **Code Review** - Mandatory peer review process
- **Documentation** - Comprehensive inline documentation

---

> **Build powerful AI agent solutions with BMAD-CYBER2**
>
> This developer guide provides everything you need to understand, extend, and integrate with BMAD-CYBER2. Follow security best practices and testing guidelines to ensure high-quality contributions.
>
> **Get Started:** Review the [Architecture](architecture.md) and [Contributing Guide](contributing.md)