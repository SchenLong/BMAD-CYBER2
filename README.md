# 🎖️ BMAD CYBERCOMMAND

**Production-ready AI operations framework with security-first design**

<div align="center">

[![Production Ready](https://img.shields.io/badge/status-production-brightgreen.svg)]()
[![Security Score](https://img.shields.io/badge/OWASP_AI-95%2F100-brightgreen.svg)](_bmad/core/security/OWASP-AI-SECURITY-CHECKLIST.md)
[![Quality Score](https://img.shields.io/badge/quality-96.8%25-brightgreen.svg)](docs/stories/STORY-6.5-PRODUCTION-CERTIFICATION-REPORT.md)
[![Performance](https://img.shields.io/badge/startup-<1.5ms-brightgreen.svg)]()
[![Teams](https://img.shields.io/badge/teams-4_specialized-teal.svg)]()
[![Agents](https://img.shields.io/badge/agents-54_active-blue.svg)]()
[![CI/CD](https://img.shields.io/badge/CI%2FCD-4_workflows-blue.svg)](.github/workflows/)
[![Tests](https://img.shields.io/badge/tests-232_suites-blue.svg)]()

**Unified AI platform with Abdul Master Project Manager orchestrating specialized teams: Cybersecurity, Intelligence, Legal, and Strategy**

[Get Started](#-quick-start) • [Choose Your Path](#-choose-your-path) • [Documentation](docs/)

</div>

---

## 🚀 **Quick Start**

Get BMAD running in under 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/SchenLong/BMAD-CYBERSEC.git
cd BMAD-CYBERSEC
git checkout BMAD-CYBEROPS-RP

# 2. Verify integrity (recommended)
./_bmad/core/security/verify-integrity.sh

# 3. Start with Abdul (Master Project Manager)
claude-code /agents/abdul
```

**Next:** [Choose your path](#-choose-your-path) based on what you want to accomplish.

---

## 🎯 **Choose Your Path**

### 📚 **New to AI Operations?**
**Start here if you're learning AI automation and want to understand the fundamentals.**

- **Goal**: Learn BMAD methodology and basic automation
- **Start with**: [Getting Started Guide](docs/UserGuide/GETTING-STARTED.md)
- **First agent**: [Abdul (Master PM)](docs/AGENTS.md#abdul-master-project-manager) - Your guide through the platform
- **Next step**: [Core Concepts Tutorial](docs/UserGuide/GETTING-STARTED.md#core-concepts)

### 🏢 **Enterprise Implementation?**
**Start here if you need production-ready AI operations for your organization.**

- **Goal**: Deploy secure, scalable AI automation
- **Start with**: [Enterprise Deployment Guide](docs/UserGuide/GETTING-STARTED.md#enterprise-setup)
- **Security focus**: [Security Overview](docs/UserGuide/SECURITY-OVERVIEW.md)
- **First workflow**: [Security Assessment](docs/WORKFLOWS.md#security-workflows)

### 🎯 **Specific Domain Expertise?**
**Start here if you need specialized knowledge in cybersecurity, intelligence, legal, or strategy.**

- **Cybersecurity**: [🔐 Cybersec Team](docs/AGENTS.md#cybersec-team) - 15 security specialists
- **Intelligence**: [🕵️ Intel Team](docs/AGENTS.md#intel-team) - 11 OSINT & analysis experts
- **Legal**: [⚖️ Legal Team](docs/AGENTS.md#legal-team) - 13 multi-jurisdictional attorneys
- **Strategy**: [👔 Strategy Team](docs/AGENTS.md#strategy-team) - 14 executive advisors

### 💻 **Software Development?**
**Start here if you're building applications or need development automation.**

- **Goal**: Automated software development and project management
- **Start with**: [BMM (Software Development)](docs/AGENTS.md#bmm-software-development)
- **First workflow**: [Create Project](docs/WORKFLOWS.md#bmm-workflows)
- **Development**: [Developer Guide](docs/GETTING-STARTED.md#developer-setup)

---

## ⚡ **Core Capabilities**

### What You Can Accomplish

#### **🔐 Cybersecurity Operations**
- Penetration testing and vulnerability assessment
- Security architecture and compliance auditing
- Incident response and forensic analysis
- Threat intelligence and monitoring

#### **🕵️ Intelligence & Research**
- OSINT collection and analysis
- Corporate intelligence and due diligence
- Digital forensics and attribution
- Threat actor profiling and tracking

#### **⚖️ Legal & Compliance**
- Multi-jurisdictional legal research
- Contract drafting and review
- Regulatory compliance analysis
- Cross-border legal coordination

#### **👔 Strategic Leadership**
- Executive decision support
- Board presentation preparation
- Crisis response planning
- Stakeholder negotiation strategy

#### **💻 Software Development**
- Automated project management
- Code review and quality assurance
- Architecture design and planning
- Testing and deployment automation

---

## 📦 **Installation & Setup**

### Prerequisites
- [Claude Code CLI](https://github.com/anthropics/claude-code) (Sonnet 4.5+ recommended)
- Git for cloning
- Node.js 18+ (for TypeScript framework components and security validators)

### Step-by-Step Installation

#### 1. Clone Repository
```bash
git clone https://github.com/SchenLong/BMAD-CYBERSEC.git
cd BMAD-CYBERSEC
git checkout BMAD-CYBEROPS-RP
```

#### 2. Verify Security (Recommended)
```bash
# Import signing key
gpg --import _bmad/core/security/bmad-public-key.asc

# Verify all files
./_bmad/core/security/verify-integrity.sh
```

#### 3. Install Framework Components
```bash
# Install TypeScript framework and security validators
npm install
npm run build

# Install security validators (recommended for production)
cd .claude/validators-node && npm install && npm run build && cd ../..
```

#### 4. Start with Abdul
```bash
# Launch the Master Project Manager
claude-code /agents/abdul
```

### Configuration Options

#### **Security Configuration**
```bash
# Review security settings
cat _bmad/core/config.yaml

# Enable/disable audit logging
# Modify YOLO mode restrictions
# Configure multi-factor authentication
```

#### **Team Customization**
```bash
# Configure team access
vim _bmad/_config/agent-manifest.csv

# Customize workflows
ls _bmad/*/workflows/

# Set user preferences
vim _bmad/core/config.yaml
```

---

## 🎓 **Next Steps**

### **After Installation**

#### **Learn the Basics** (New Users)
1. [Talk to Abdul](docs/AGENTS.md#abdul-master-project-manager) - Your AI project manager
2. [First Workflow](docs/UserGuide/GETTING-STARTED.md#your-first-workflow) - Complete your first automation
3. [Understanding Teams](docs/AGENTS.md) - How specialist teams work
4. [Security Basics](docs/UserGuide/SECURITY-OVERVIEW.md) - Essential security concepts

#### **Production Deployment** (Enterprise Users)
1. [Security Hardening](docs/UserGuide/SECURITY-OVERVIEW.md#security-hardening) - Lock down your deployment
2. [Team Configuration](docs/UserGuide/GETTING-STARTED.md#team-configuration) - Configure specialist teams
3. [Workflow Customization](docs/WORKFLOWS.md) - Adapt to your processes
4. [Monitoring Setup](docs/UserGuide/SECURITY-OVERVIEW.md#monitoring) - Track operations and performance

#### **Advanced Usage** (Power Users)
1. [Party Mode](docs/WORKFLOWS.md#party-mode) - Multi-agent coordination
2. [Custom Workflows](docs/UserGuide/Advanced/CUSTOM-WORKFLOW-CREATION.md) - Build your own automations
3. [API Integration](docs/UserGuide/Integration/INTEGRATION-GUIDE.md) - Connect external systems
4. [Performance Tuning](docs/UserGuide/Operations/PERFORMANCE-TUNING.md) - Optimize for your workload

### **Common Tasks**

#### **Security Operations**
- [Run Security Assessment](docs/WORKFLOWS.md#cybersec-workflows)
- [Incident Response](docs/WORKFLOWS.md#incident-response)
- [Penetration Testing](docs/WORKFLOWS.md#penetration-testing)

#### **Intelligence Gathering**
- [OSINT Investigation](docs/WORKFLOWS.md#intel-workflows)
- [Corporate Research](docs/WORKFLOWS.md#corporate-intelligence)
- [Threat Analysis](docs/WORKFLOWS.md#threat-analysis)

#### **Project Management**
- [Create New Project](docs/WORKFLOWS.md#bmm-workflows)
- [Sprint Planning](docs/WORKFLOWS.md#sprint-planning)
- [Code Review](docs/WORKFLOWS.md#code-review)

---

## 📚 **Documentation**

### **User Guides**
- [Getting Started](docs/UserGuide/GETTING-STARTED.md) - Complete setup guide
- [Security Overview](docs/UserGuide/SECURITY-OVERVIEW.md) - Security features and best practices
- [Troubleshooting](docs/UserGuide/TROUBLESHOOTING.md) - Common issues and solutions

### **Team Documentation**
- [🔐 Cybersec Team](docs/AGENTS.md#cybersec-team) - Security operations specialists
- [🕵️ Intel Team](docs/AGENTS.md#intel-team) - Intelligence and research experts
- [⚖️ Legal Team](docs/AGENTS.md#legal-team) - Multi-jurisdictional legal support
- [👔 Strategy Team](docs/AGENTS.md#strategy-team) - Executive decision support

### **Technical Reference**
- [API Documentation](docs/api/) - Framework APIs and integration
- [Architecture Guide](docs/architecture/) - System design and components
- [Security Reference](docs/UserGuide/Security/) - Comprehensive security documentation
- [Developer Guide](docs/Developer/) - Contributing and extending the framework
- [Security Validators](.claude/validators-node/) - Node.js security validation framework

### **Workflows**
- [Workflow Directory](docs/WORKFLOWS.md) - All available workflows by team
- [Workflow Creation](docs/UserGuide/Advanced/CUSTOM-WORKFLOW-CREATION.md) - Build custom workflows
- [Workflow Best Practices](docs/UserGuide/Advanced/) - Design guidelines

### **CI/CD & Testing**
- [Continuous Testing](.github/workflows/bmad-continuous-testing.yml) - Automated test pipeline
- [Extraction QA](.github/workflows/bmad-extraction-qa.yml) - Module extraction validation
- [Quality Gate](.github/workflows/quality-gate.yml) - Production readiness checks
- [Test Logs](docs/TestingLogs/) - Benchmark results, compliance reports, security audits

---

## 🏆 **Production Features**

### **Security Excellence**
- **OWASP AI Compliance**: 95/100 score with comprehensive security framework
- **Production Certified**: 96.8% quality score across all components
- **Zero-Trust Architecture**: Defense-in-depth with multi-layer security
- **Audit Trail**: Tamper-evident logging with SHA256 hash chains
- **Node.js Security Validators**: 139+ validation modules for jailbreak detection, prompt injection prevention, PII protection, and rate limiting

### **Performance & Scale**
- **Sub-millisecond Startup**: <1.5ms initialization for enterprise workloads
- **54 Active Agents**: Specialist teams covering cybersecurity, intelligence, legal, strategy
- **64 Production Workflows**: Battle-tested automations for real-world operations
- **Context Efficiency**: 8.75x token reduction with BMAD-CONCURA architecture
- **232 Test Suites**: Comprehensive testing including performance benchmarks, compliance validation, and security audits

### **Enterprise Ready**
- **ISO 27001 Compliance**: 100% compliance with enterprise security standards
- **Multi-LLM Support**: Claude, OpenAI, Groq, Ollama, LM Studio, vLLM
- **Zero-Downtime Updates**: Production deployment without service interruption
- **Abdul Orchestration**: Master Project Manager coordinating all operations
- **CI/CD Pipeline**: Automated quality gates, continuous testing, and extraction QA workflows

### **New in This Release**
- **Enterprise Security Testing Framework**: Comprehensive security monitoring with anomaly detection
- **Release Readiness Validation**: Production deployment certification and testing
- **Strategic Positioning Package**: Complete deployment automation with build orchestration
- **Security Validators**: Full Node.js validator suite with audit logging, rate limiting, and recursion guards
- **Package Management Tools**: Module selector, PGP signing setup, and security configuration utilities
- **Sub-agent Permission Inheritance**: Fixed permission propagation for nested agent execution

---

## 🤝 **Support & Community**

### **Getting Help**

#### **Documentation First**
- [FAQ](docs/UserGuide/FAQ.md) - Frequently asked questions
- [Troubleshooting](docs/UserGuide/TROUBLESHOOTING.md) - Common issues and solutions
- [Security Guide](docs/UserGuide/SECURITY-OVERVIEW.md) - Security best practices

### **Contributing**
- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project
- [Development Setup](docs/Developer/) - Local development environment
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community guidelines

### **Professional Services**
For enterprise deployments, custom integrations, or professional support, contact blackunicorn.tech

---

## 📄 **License & Attribution**

BMAD CYBER-COMMAND is licensed under the [MIT License](LICENSE).

**Created with**:
- Abdul (Master Project Manager) - Cross-module orchestration
- BMAD Method - Core infrastructure and specialized teams
- Claude Code

**Acknowledgments**:
- Claude AI (Anthropic) - Core LLM capabilities
- BMAD Community - Testing, feedback, and contributions
- Security researchers - Vulnerability reports and hardening guidance

---

## 📋 **Changelog Highlights**

### Integration-Prep Branch (Current)
- **Sec and Perf Testing framework**: Enterprise Security Testing & Performance Framework
- **Security Validators**: Complete Node.js validation suite (139+ modules)
- **CI/CD**: 4 automated workflows for testing, QA, and quality gates
- **Bug Fixes**: Sub-agent permission inheritance, STDIN hang resolution, performance testing

---

*Ready to transform your Cybersec operations? [Get started](#-quick-start) or [choose your path](#-choose-your-path) based on your goals.*