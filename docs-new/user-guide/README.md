# BMAD-CYBER2 User Guide

> **Complete Guide to Using BMAD-CYBER2**
>
> Everything you need to effectively use BMAD-CYBER2's 143+ workflows across cybersecurity, intelligence, strategy, and legal operations.

---

## 🎯 Quick Start

### New to BMAD-CYBER2?
1. **[Installation](../getting-started/installation.md)** - Set up the platform
2. **[First Workflow](../getting-started/)** - Run your first workflow
3. **[Examples](examples/)** - Try guided examples
4. **[Configuration](configuration.md)** - Customize your setup

### Ready to Work?
- **[Browse All Workflows](workflows/)** - 143+ professional workflows
- **[Find by Category](#workflows-by-category)** - Organized by use case
- **[Troubleshooting](#troubleshooting)** - Solve common issues

---

## 📚 Core Documentation

### 🔧 Platform Usage
| Document | Description | Audience |
|----------|-------------|----------|
| **[Workflows Guide](workflows/)** | Complete workflow reference (143+ workflows) | All users |
| **[Configuration](configuration.md)** | Platform configuration and customization | All users |
| **[Agents Reference](agents-reference.md)** | 80+ agent descriptions and usage | All users |
| **[Troubleshooting](troubleshooting.md)** | Common issues and solutions | All users |

### 💡 Learning & Examples
| Document | Description | Audience |
|----------|-------------|----------|
| **[Examples](examples/)** | Hands-on guided examples | New users |
| **[Best Practices](best-practices.md)** | Usage recommendations | Intermediate users |
| **[Advanced Features](advanced-features.md)** | Power user capabilities | Advanced users |

---

## 🎭 Workflows by Category

### 🛡️ Cybersecurity (13 workflows)
**Focus:** Security operations, penetration testing, compliance
- **[Incident Response Playbook](workflows/#incident-response-playbook)** - Create and execute IR playbooks
- **[Security Architecture Review](workflows/#security-architecture-review)** - Comprehensive security assessments
- **[STRIDE Threat Modeling](workflows/#stride-threat-modeling)** - Systematic threat analysis
- **[Compliance Audit Prep](workflows/#compliance-audit-preparation)** - 20+ compliance frameworks
- **[Penetration Testing](workflows/)** - Web app, mobile, network, infrastructure testing
- **[Virtual CISO Consulting](workflows/#virtual-ciso-consulting)** - Strategic security advisory

### 🕵️ Intelligence (19 workflows)
**Focus:** OSINT, threat intelligence, attribution analysis
- **[Flash Assessment](workflows/#flash-assessment)** - 15-minute rapid intelligence triage
- **[Campaign Planner](workflows/)** - Systematic intelligence campaigns (person/org/AI)
- **[Digital Necromancy](workflows/#digital-necromancy)** - Recover deleted/hidden digital presence
- **[Operation Mosaic](workflows/#operation-mosaic)** - Full-spectrum intelligence collection
- **[Attribution Chain](workflows/#attribution-chain)** - Multi-source threat actor attribution
- **[Ground Truth](workflows/#ground-truth)** - Field operation preparation

### 🎯 Strategic Leadership (16 workflows)
**Focus:** Executive decision making, negotiations, crisis management
- **[Strategic Decision Workshop](workflows/#strategic-decision-workshop)** - Multi-perspective analysis
- **[Board Presentation Prep](workflows/#board-presentation-prep)** - Compelling board presentations
- **[Crisis Response Planning](workflows/#crisis-response-planning)** - Crisis communication strategy
- **[M&A Due Diligence](workflows/#ma-due-diligence)** - Target evaluation and integration
- **[Competitive Warfare](workflows/#competitive-warfare)** - High-stakes business battles
- **[Stakeholder Negotiation Prep](workflows/#stakeholder-negotiation-prep)** - Negotiation strategy

### ⚖️ Legal & Compliance (7 workflows)
**Focus:** Contract review, multi-jurisdictional legal matters
- **[Contract Review](workflows/#contract-review)** - Comprehensive contract analysis
- **[Legal Matter Intake](workflows/#legal-matter-intake)** - Case assessment and routing
- **[Corporate Formation](workflows/#corporate-formation)** - Multi-jurisdictional entity formation
- **[Cross-Border Matters](workflows/#cross-border-matter)** - International legal coordination

---

## 🚀 Platform Features

### 🤝 Multi-Agent Collaboration
- **[Party Mode](workflows/#party-mode)** - Multi-agent collaborative sessions
- **[Presets](workflows/#party-mode-presets)** - 27 pre-configured agent combinations
- **[Custom Teams](advanced-features.md#custom-teams)** - Build your own agent teams

### 🔒 Security & Compliance
- **[Security Features](../security/features/)** - Enterprise-grade security controls
- **[Role-Based Access](../security/features/#rbac)** - 9 predefined roles with granular permissions
- **[Audit Logging](../security/audit-reports/)** - Comprehensive activity tracking
- **[Compliance Support](../security/compliance/)** - Multiple regulatory frameworks

### 🔧 Customization & Integration
- **[LLM Configuration](configuration.md#llm-configuration)** - Claude, local LLMs, custom endpoints
- **[Custom Workflows](../developer/extending-bmad.md)** - Build your own workflows
- **[API Integration](../developer/api-reference.md)** - Integrate with external systems
- **[Hook System](../security/features/#hooks-validators)** - Custom pre/post execution logic

---

## 📋 Common Workflows by Use Case

### For Security Teams
```bash
# Incident response
/incident-response-playbook

# Security assessment
/security-architecture-review

# Compliance preparation
/compliance-audit-prep

# Threat modeling
/stride-threat-modeling
```

### For Intelligence Analysts
```bash
# Quick assessment
/flash-assessment

# Person investigation
/campaign-planner-person

# Organization investigation
/campaign-planner-org

# Threat attribution
/attribution-chain
```

### For Executives
```bash
# Strategic decisions
/strategic-decision-workshop

# Board preparation
/board-presentation-prep

# Crisis management
/crisis-response-planning

# M&A evaluation
/ma-due-diligence
```

### For Legal Teams
```bash
# Contract analysis
/contract-review

# Legal matter assessment
/legal-matter-intake

# Multi-jurisdictional issues
/cross-border-matter

# Corporate formation
/corporate-formation
```

---

## 🛠️ Troubleshooting

### Common Issues
| Issue | Solution | Reference |
|-------|----------|-----------|
| Workflow not found | Run `/core-skills-index` | [Troubleshooting](troubleshooting.md#workflow-issues) |
| Security validator errors | Check security configuration | [Security Guide](../security/features/) |
| Performance issues | Tune configuration settings | [Performance Guide](../operations/performance-tuning.md) |
| Authentication errors | Review token management | [Token Guide](../security/compliance/token-management.md) |

### Getting Help
1. **[Troubleshooting Guide](troubleshooting.md)** - Comprehensive problem-solving guide
2. **[Security Documentation](../security/)** - Security-specific issues
3. **[GitHub Issues](https://github.com/SchenLong/BMAD-CYBER2/issues)** - Community support
4. **[Developer Docs](../developer/)** - Technical implementation details

---

## 📈 Advanced Usage

### Power User Features
- **[Custom Agent Creation](../developer/extending-bmad.md#agents)** - Build specialized agents
- **[Workflow Customization](../developer/extending-bmad.md#workflows)** - Modify existing workflows
- **[Batch Operations](advanced-features.md#batch-operations)** - Automate multiple workflows
- **[Integration Patterns](../developer/api-reference.md)** - Connect to external systems

### Performance Optimization
- **[Configuration Tuning](configuration.md#performance)** - Optimize for your use case
- **[Local LLM Setup](configuration.md#local-llms)** - Use local models for sensitive data
- **[Caching Strategies](../operations/performance-tuning.md)** - Improve response times
- **[Resource Management](../operations/)** - Monitor and manage resources

---

## 📞 Support & Community

### Documentation
- **Complete:** [All Workflows](workflows/) | [All Features](../security/features/) | [All Operations](../operations/)
- **Quick Reference:** [Glossary](../reference/glossary.md) | [Changelog](../reference/changelog.md)
- **Advanced:** [Developer Guide](../developer/) | [API Reference](../developer/api-reference.md)

### Community Resources
- **GitHub Repository:** [BMAD-CYBER2](https://github.com/SchenLong/BMAD-CYBER2)
- **Issue Tracking:** [Report Issues](https://github.com/SchenLong/BMAD-CYBER2/issues)
- **Feature Requests:** [Roadmap](../reference/roadmap.md)

---

> **Ready to become a BMAD-CYBER2 expert?**
>
> This user guide provides everything you need to effectively leverage BMAD-CYBER2's capabilities. Start with the basics and gradually explore advanced features as your expertise grows.
>
> **Next Steps:** Try the [Examples](examples/) or dive into [Workflows](workflows/) that match your use case.