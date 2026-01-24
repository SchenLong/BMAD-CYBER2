# Basic Usage Examples

## Single Agent Activation

```bash
# Activate security architect
bmad agent bastion

# Activate intelligence analyst
bmad agent osint-lead

# Activate legal counsel
bmad agent counsel

# Activate strategic advisor
bmad agent master-strategist
```

## Workflow Execution

```bash
# Security assessment
bmad workflow security-assessment --target "web-application"

# Intelligence collection
bmad workflow osint-campaign --target "threat-actor"

# Contract review
bmad workflow contract-review --document "service-agreement.pdf"

# Strategic planning
bmad workflow strategic-planning --horizon "q1-2024"
```

## Cross-Team Coordination

```bash
# Incident response with multiple teams
bmad workflow incident-response \
  --type "data-breach" \
  --teams "cybersec,intel,legal" \
  --priority "critical"
```
