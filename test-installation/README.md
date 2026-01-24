# BMAD Specialized Teams Multi-Module Distribution

> Complete cybersecurity, intelligence, legal, and strategy teams for your BMAD installation

[![NPM Version](https://img.shields.io/npm/v/@bmad-cybercommand/meta-package)](https://www.npmjs.com/package/@bmad-cybercommand/meta-package)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![BMAD Compatible](https://img.shields.io/badge/BMAD-v2.0+-green.svg)](https://bmad.ai)

## Overview

This multi-module distribution package provides four specialized team modules for the BMAD (Business Multi-Agent Director) framework:

- **🔒 Cybersec-Team** (15 agents, 13 workflows) - Comprehensive cybersecurity operations
- **🕵️ Intel-Team** (11 agents, 12 workflows) - Open source intelligence and threat analysis
- **⚖️ Legal-Team** (13 agents, 6 workflows) - Legal operations and compliance
- **📊 Strategy-Team** (14 agents, 15 workflows) - Strategic planning and business operations

**Total: 53 specialized agents, 46 workflows**

## Quick Installation

```bash
# Install all specialized teams
npm install @bmad-cybercommand/meta-package

# Or install individual teams
npm install @bmad-cybercommand/cybersec-team
npm install @bmad-cybercommand/intel-team
npm install @bmad-cybercommand/legal-team
npm install @bmad-cybercommand/strategy-team
```

## Module Structure

Following the bmad-builder format for seamless integration:

```
src/
├── cybersec-team/           # Cybersecurity Operations
│   ├── agents/             # 15 security agents (.agent.yaml)
│   ├── workflows/          # 13 security workflows
│   ├── tools/              # Security utilities
│   └── module.yaml         # Module configuration
├── intel-team/             # Intelligence Operations
│   ├── agents/             # 11 intelligence agents
│   ├── workflows/          # 12 intelligence workflows
│   └── ...
├── legal-team/             # Legal Operations
└── strategy-team/          # Strategic Operations
```

## Team Capabilities

### 🔒 Cybersec-Team
- **Threat Analysis**: Advanced threat intelligence and APT analysis
- **Penetration Testing**: Red team operations and vulnerability assessment
- **Incident Response**: Crisis management and forensic investigation
- **Compliance**: Security governance and regulatory compliance

### 🕵️ Intel-Team
- **OSINT Operations**: Open source intelligence collection
- **Threat Attribution**: Actor profiling and infrastructure mapping
- **Digital Forensics**: Evidence collection and analysis
- **Surveillance**: Field operations and reconnaissance

### ⚖️ Legal-Team
- **Contract Management**: Drafting, review, and negotiation
- **Compliance**: Regulatory analysis and risk assessment
- **Dispute Resolution**: Litigation strategy and mediation
- **Corporate Law**: Formation, governance, and M&A

### 📊 Strategy-Team
- **Strategic Planning**: Long-term strategy and decision analysis
- **Leadership**: Executive coaching and team management
- **Crisis Management**: Emergency response and communications
- **Business Operations**: Process optimization and performance

## Installation & Usage

### Prerequisites

- BMAD v2.0+ installed
- Node.js 16+ for NPM installation
- Git for repository management

### Standard Installation

```bash
# Clone or download the distribution package
git clone https://github.com/bmad-code-org/bmad-specialized-teams.git

# Install using BMAD installer
bmad install ./bmad-specialized-teams

# Or use NPM
npm install @bmad-cybercommand/meta-package
bmad install node_modules/@bmad-cybercommand/meta-package
```

### Selective Installation

Install only specific teams:

```bash
# Security focus
bmad install @bmad-cybercommand/cybersec-team @bmad-cybercommand/intel-team

# Business focus
bmad install @bmad-cybercommand/legal-team @bmad-cybercommand/strategy-team
```

### Configuration

Each team module includes interactive configuration during installation:

- **Output folders**: Customize where each team saves artifacts
- **Integration settings**: Configure cross-team workflows
- **Security settings**: Set permission levels and access controls
- **Notification preferences**: Configure alerts and reporting

## Cross-Team Integration

Specialized teams are designed to work together:

- **Security + Intel**: Threat hunting and attribution workflows
- **Legal + Strategy**: Compliance-aware strategic planning
- **Intel + Legal**: Evidence collection for legal proceedings
- **Strategy + Security**: Risk-aware strategic decision making

## Examples

### Basic Usage

```bash
# Activate cybersecurity team lead
bmad agent cipher

# Execute threat analysis workflow
bmad workflow cybersec-team:threat-analysis

# Generate security incident report
bmad report security-incident --template soc-report
```

### Advanced Cross-Team Workflow

```bash
# Multi-team incident response
bmad workflow incident-response \
  --primary-team cybersec \
  --support-teams intel,legal,strategy \
  --severity critical
```

## Documentation

- [Installation Guide](docs/installation.md)
- [Configuration Reference](docs/configuration.md)
- [Workflow Documentation](docs/workflows.md)
- [API Reference](docs/api.md)
- [Troubleshooting](docs/troubleshooting.md)

## Support

- **Issues**: [GitHub Issues](https://github.com/bmad-code-org/BMAD-CYBERCOMMAND/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bmad-code-org/BMAD-CYBERCOMMAND/discussions)
- **Documentation**: [docs.bmad.ai](https://docs.bmad.ai/specialized-teams)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Security

For security vulnerabilities, please see [SECURITY.md](SECURITY.md).

---

**Generated by**: BMAD Module Packager v1.0.0
**Date**: 2026-01-23T16:44:40.177Z
**Maintainer**: BMAD Development Team <dev@bmad.ai>
