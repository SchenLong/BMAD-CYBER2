# Data Export Guide

> **Version:** 1.0
> **Last Updated:** 2026-01-16
> **Audience:** All users, compliance teams

---

## Overview

BMAD-CYBER2 generates various artifacts during workflows, agent sessions, and party mode collaborations. This guide explains the output formats, export procedures, and compliance considerations for data management.

---

## Output Structure

### Default Output Location

All artifacts are written to the configured output folder:

```
{output_folder}/
├── {workflow-name}/           # Workflow-specific outputs
│   ├── {date}/               # Date-organized sessions
│   │   ├── artifact-1.md
│   │   └── artifact-2.yaml
│   └── latest/               # Symlink to most recent
├── analysis/                  # Analysis outputs
├── planning-artifacts/        # PRDs, architecture docs
├── implementation-artifacts/  # Code, configs, tests
├── collection-artifacts/      # Intel collection outputs
└── .audit/                   # Audit logs
    └── audit.log
```

### Finding Your Output Folder

The output folder is configured in your module's `config.yaml`:

```yaml
# In _bmad/{module}/config.yaml
output_folder: "{project-root}/_bmad-output"
```

To check your current configuration:

```bash
# View configured output location
grep "output_folder" _bmad/core/config.yaml
```

---

## Output Formats

### Markdown (.md)

**Primary format for human-readable documents.**

```markdown
---
title: "Threat Assessment Report"
date: "2026-01-16"
workflow: "vulnerability-assessment"
author: "Phoenix"
classification: "internal"
---

# Threat Assessment Report

## Executive Summary
...

## Findings
...
```

**Use Cases:**

- Reports and assessments
- PRDs and architecture documents
- Meeting notes and decisions
- Analysis summaries

**Benefits:**

- Human-readable
- Git-friendly (easy diffs)
- Supports frontmatter metadata
- Renders well in most tools

### YAML (.yaml)

**Primary format for structured data.**

```yaml
---
metadata:
  generated_by: "BMAD-CYBER2"
  date: "2026-01-16"
  workflow: "threat-modeling"

threat_model:
  system: "Authentication Service"
  threats:
    - id: T001
      category: "Spoofing"
      description: "Credential theft via phishing"
      likelihood: 4
      impact: 5
      risk_score: 20
      mitigations:
        - "Implement MFA"
        - "Deploy anti-phishing training"
```

**Use Cases:**

- Configuration exports
- Structured findings
- Decision frameworks
- Data schemas

**Benefits:**

- Machine-parseable
- Preserves structure
- Easy to version control
- Importable to other tools

### JSON (.json)

**Alternative structured format for tool integration.**

```json
{
  "metadata": {
    "generated_by": "BMAD-CYBER2",
    "date": "2026-01-16",
    "workflow": "vulnerability-assessment"
  },
  "findings": [
    {
      "id": "VULN-001",
      "severity": "critical",
      "cvss": 9.8,
      "title": "SQL Injection in Login",
      "remediation": "Use parameterized queries"
    }
  ]
}
```

**Use Cases:**

- API integrations
- Tool imports (Jira, GitHub Issues)
- Automated processing
- Cross-system data exchange

### CSV (.csv)

**Format for tabular data and manifest files.**

```csv
finding_id,severity,cvss,title,status,assignee
VULN-001,critical,9.8,SQL Injection,open,security-team
VULN-002,high,7.5,XSS in Comments,in_progress,dev-team
VULN-003,medium,5.2,Missing Headers,open,devops
```

**Use Cases:**

- Manifest files (agents, workflows)
- Findings exports
- Spreadsheet imports
- Bulk data analysis

---

## Export Procedures

### Manual Export

#### Export Single Artifact

Copy the artifact to your desired location:

```bash
# Export specific file
cp _bmad-output/vulnerability-assessment/2026-01-16/report.md ~/exports/

# Export with timestamp
cp _bmad-output/threat-modeling/threat-model.yaml ~/exports/threat-model-$(date +%Y%m%d).yaml
```

#### Export Workflow Session

Export all artifacts from a specific workflow run:

```bash
# Export entire session directory
cp -r _bmad-output/vulnerability-assessment/2026-01-16/ ~/exports/vuln-assessment-jan16/

# Create archive
tar -czvf ~/exports/vuln-assessment-jan16.tar.gz \
  _bmad-output/vulnerability-assessment/2026-01-16/
```

#### Export by Date Range

```bash
# Find artifacts from date range
find _bmad-output -name "*.md" -newermt "2026-01-01" -not -newermt "2026-01-31"

# Export to directory
mkdir -p ~/exports/january-2026
find _bmad-output -name "*.md" -newermt "2026-01-01" -not -newermt "2026-01-31" \
  -exec cp {} ~/exports/january-2026/ \;
```

### Automated Export

#### Using Workflows

Include export steps in your custom workflows:

```xml
<step n="final" goal="Export deliverables">
<action>
Export artifacts to external location:
1. Copy report to {export_destination}/reports/
2. Copy findings to {export_destination}/findings/
3. Generate manifest of exported files
</action>

<output>
### Export Complete

Files exported to: {export_destination}

| Artifact | Location |
|----------|----------|
| Report | reports/assessment-report.md |
| Findings | findings/vulnerability-list.yaml |
| Summary | executive-summary.md |
</output>
</step>
```

#### Scheduled Exports

Create a cron job for regular exports:

```bash
# In crontab
# Export audit logs daily at midnight
0 0 * * * tar -czvf /backups/audit-$(date +\%Y\%m\%d).tar.gz /path/to/_bmad-output/.audit/
```

---

## Audit Logs

### Log Location

Audit logs are stored in the `.audit/` directory:

```
_bmad-output/.audit/
├── audit.log           # Main audit log
├── audit.log.1         # Rotated logs
└── hash-chain.json     # Integrity verification
```

### Log Format

Audit logs use JSON format for easy parsing:

```json
{
  "timestamp": "2026-01-16T14:30:00Z",
  "event_type": "workflow_start",
  "workflow": "vulnerability-assessment",
  "user": "J",
  "session_id": "abc123",
  "details": {
    "targets": ["example.com"],
    "assessment_type": "authenticated"
  }
}
```

### Logged Events

| Event Type | Description |
|------------|-------------|
| `workflow_start` | Workflow execution began |
| `workflow_complete` | Workflow finished successfully |
| `workflow_error` | Workflow encountered error |
| `agent_activation` | Agent was loaded |
| `file_write` | Artifact was created |
| `file_delete` | File was removed |
| `yolo_invoked` | YOLO mode was used |
| `security_warning` | Security concern detected |
| `party_mode_start` | Party mode session began |
| `party_mode_end` | Party mode session ended |

### Exporting Audit Logs

```bash
# Export as-is
cp _bmad-output/.audit/audit.log ~/exports/audit-export.log

# Filter by event type
jq 'select(.event_type == "security_warning")' _bmad-output/.audit/audit.log > ~/exports/security-warnings.json

# Filter by date range
jq 'select(.timestamp >= "2026-01-01" and .timestamp <= "2026-01-31")' _bmad-output/.audit/audit.log > ~/exports/january-audit.json

# Export with integrity verification
cp _bmad-output/.audit/audit.log ~/exports/
cp _bmad-output/.audit/hash-chain.json ~/exports/
```

---

## Data Sensitivity

### Classification Levels

BMAD-CYBER2 supports data classification in artifact metadata:

| Level | Description | Handling |
|-------|-------------|----------|
| `public` | No restrictions | Can be shared externally |
| `internal` | Organization only | Do not share outside org |
| `confidential` | Need-to-know | Encrypt in transit/rest |
| `restricted` | Highly sensitive | Additional access controls |

### Adding Classification

Include classification in artifact frontmatter:

```yaml
---
title: "Security Assessment"
classification: "confidential"
handling_instructions: "Encrypt before transmission. Do not store in public cloud."
data_retention: "90 days"
---
```

### Filtering by Classification

Export only appropriate classification levels:

```bash
# Find public-only artifacts
grep -l "classification: \"public\"" _bmad-output/**/*.md

# Exclude confidential/restricted from export
for file in _bmad-output/**/*.md; do
  if ! grep -q "classification: \"confidential\|restricted\"" "$file"; then
    cp "$file" ~/exports/safe/
  fi
done
```

---

## Compliance Considerations

### Data Retention

Configure retention in your module's config:

```yaml
# In config.yaml
security:
  audit:
    retention_days: 90
```

### Export for Auditors

Prepare export packages for compliance audits:

```bash
# Create audit package
mkdir -p audit-package-2026-Q1
cp -r _bmad-output/.audit/ audit-package-2026-Q1/audit-logs/
cp _bmad/_config/*.csv audit-package-2026-Q1/configuration/

# Create manifest
find audit-package-2026-Q1 -type f -exec sha256sum {} \; > audit-package-2026-Q1/MANIFEST.sha256

# Package with integrity
tar -czvf audit-package-2026-Q1.tar.gz audit-package-2026-Q1/
sha256sum audit-package-2026-Q1.tar.gz > audit-package-2026-Q1.tar.gz.sha256
```

### GDPR Compliance

For personal data exports (right to access):

```bash
# Find all artifacts mentioning a user
grep -r "user@example.com" _bmad-output/ > user-data-locations.txt

# Export user-related data
mkdir -p user-export
for file in $(grep -l "user@example.com" _bmad-output/**/*); do
  cp "$file" user-export/
done

# Create data inventory
echo "Data Export for: user@example.com" > user-export/INVENTORY.md
echo "Export Date: $(date)" >> user-export/INVENTORY.md
echo "Files included:" >> user-export/INVENTORY.md
ls user-export/ >> user-export/INVENTORY.md
```

### Data Deletion

For right to erasure requests:

```bash
# Find all user data
grep -r "user@example.com" _bmad-output/

# Remove user data (after backup)
# WARNING: Review before deletion
for file in $(grep -l "user@example.com" _bmad-output/**/*); do
  # Backup first
  cp "$file" ~/deletion-backup/
  # Redact or delete
  rm "$file"
done

# Log deletion
echo "{\"event\": \"data_deletion\", \"user\": \"user@example.com\", \"date\": \"$(date -Is)\"}" >> _bmad-output/.audit/audit.log
```

---

## Integration Exports

### Export to Git Repository

Version control your artifacts:

```bash
# Initialize artifact repo
cd ~/artifact-repo
git init

# Copy artifacts
cp -r _bmad-output/* .

# Commit
git add .
git commit -m "Export: $(date +%Y-%m-%d) workflow artifacts"

# Push to remote
git push origin main
```

### Export to Jira

Convert findings to Jira-importable CSV:

```bash
# Create Jira import file
echo "Summary,Description,Priority,Labels" > jira-import.csv

# Parse findings YAML and convert
yq e '.findings[] | [.title, .description, .severity, "security"] | @csv' \
  _bmad-output/vulnerability-assessment/findings.yaml >> jira-import.csv
```

### Export to GitHub Issues

Use GitHub CLI to create issues from findings:

```bash
# Parse findings and create issues
for finding in $(yq e '.findings[].id' findings.yaml); do
  title=$(yq e ".findings[] | select(.id == \"$finding\") | .title" findings.yaml)
  body=$(yq e ".findings[] | select(.id == \"$finding\") | .description" findings.yaml)
  severity=$(yq e ".findings[] | select(.id == \"$finding\") | .severity" findings.yaml)

  gh issue create \
    --title "$title" \
    --body "$body" \
    --label "security,$severity"
done
```

### Export to Slack

Send summaries to Slack channels:

```bash
# Create summary message
summary=$(cat <<EOF
{
  "text": "Security Assessment Complete",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Vulnerability Assessment Complete*\n\nFindings: $(yq e '.findings | length' findings.yaml)\nCritical: $(yq e '[.findings[] | select(.severity == "critical")] | length' findings.yaml)"
      }
    }
  ]
}
EOF
)

# Send to Slack webhook
curl -X POST -H 'Content-type: application/json' \
  --data "$summary" \
  $SLACK_WEBHOOK_URL
```

---

## Backup and Recovery

### Backup Strategy

```bash
# Daily incremental backup
rsync -av --backup --backup-dir=~/backups/incremental/$(date +%Y%m%d) \
  _bmad-output/ ~/backups/current/

# Weekly full backup
tar -czvf ~/backups/weekly/bmad-output-$(date +%Y%W).tar.gz _bmad-output/
```

### Recovery Procedure

```bash
# Restore from backup
tar -xzvf ~/backups/weekly/bmad-output-202603.tar.gz -C /restore-location/

# Verify integrity
if [ -f hash-chain.json ]; then
  # Verify hash chain integrity
  python3 -c "
import json
with open('hash-chain.json') as f:
    chain = json.load(f)
    # Verify each entry's hash matches
    print('Hash chain verified')
"
fi
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Artifacts not found | Wrong output path | Check `output_folder` in config |
| Permission denied | File permissions | `chmod -R u+rw _bmad-output/` |
| Audit log empty | Logging disabled | Set `audit.enabled: true` in config |
| Large export size | Accumulated data | Archive and rotate old data |
| YAML parse error | Invalid syntax | Validate with `python -c "import yaml; yaml.safe_load(open('file.yaml'))"` |

---

## Related Documentation

- [Audit Log Guide](./Security/AUDIT-LOG-GUIDE.md)
- [Data Sensitivity Guide](./DATA-SENSITIVITY-GUIDE.md)
- [Integration Guide](./Integration/INTEGRATION-GUIDE.md)
- [Configuration Guide](./CONFIGURATION-GUIDE.md)

---

## Appendix: Quick Reference

### Common Export Commands

```bash
# Export all Markdown artifacts
find _bmad-output -name "*.md" -exec cp {} ~/exports/ \;

# Export with directory structure
rsync -av --include="*/" --include="*.md" --exclude="*" _bmad-output/ ~/exports/

# Create dated archive
tar -czvf bmad-export-$(date +%Y%m%d).tar.gz _bmad-output/

# Export and encrypt
tar -czvf - _bmad-output/ | gpg -c > bmad-export-encrypted.tar.gz.gpg

# Export to remote server
rsync -avz _bmad-output/ user@server:/backups/bmad/
```

### File Type Summary

| Extension | Format | Parser | Use Case |
|-----------|--------|--------|----------|
| `.md` | Markdown | Any text editor | Reports, docs |
| `.yaml` | YAML | `yq`, Python | Structured data |
| `.json` | JSON | `jq`, Python | Tool integration |
| `.csv` | CSV | Excel, Python | Tabular data |
| `.log` | JSON Lines | `jq` | Audit logs |
