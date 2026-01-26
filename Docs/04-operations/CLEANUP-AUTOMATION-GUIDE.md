# Cleanup Automation Guide

**BMAD-CYBER2 Repository Cleanup Automation Guide**

Version: 1.0
Last Updated: January 24, 2026
Authority: BMAD Operations Team

## Overview

This guide provides comprehensive instructions for executing automated cleanup operations in the BMAD-CYBER2 repository. It covers the use of automated scripts, parallel agent deployment, and integration with the Abdul project management system.

## Automated Cleanup Scripts

### Core Cleanup Scripts Location

All cleanup scripts are located in `/scripts/maintenance/` and should be version controlled with the main repository.

#### Script Inventory

```bash
/scripts/maintenance/
├── repo-health-check.sh        # Primary health assessment
├── auto-archive.sh             # Automated file archival
├── validate-structure.sh       # Structure compliance check
├── check-duplicates.sh         # Duplicate file detection
├── validate-links.sh           # Broken link detection
├── generate-health-report.sh   # Comprehensive reporting
├── parallel-cleanup-deploy.sh  # Multi-agent deployment
└── abdul-integration.sh        # Project manager integration
```

### Primary Scripts Usage

#### 1. Repository Health Check (`repo-health-check.sh`)

**Purpose:** Comprehensive assessment of repository health and compliance

**Usage:**
```bash
# Basic health check
./scripts/maintenance/repo-health-check.sh

# Detailed analysis with report generation
./scripts/maintenance/repo-health-check.sh --detailed --output-report

# Check specific directory
./scripts/maintenance/repo-health-check.sh --path=/docs/epics

# Dry run (no changes)
./scripts/maintenance/repo-health-check.sh --dry-run
```

**Output Example:**
```
BMAD-CYBER2 Repository Health Report
=====================================
Generated: 2026-01-24 15:30:45

ROOT DIRECTORY ANALYSIS:
✅ Configuration files: Compliant
❌ Old files detected: 3 files older than 30 days
⚠️  Large files: 1 file >10MB detected

DOCUMENTATION STRUCTURE:
✅ Category compliance: 95%
❌ Broken links: 12 links broken
✅ Naming conventions: Compliant

RECOMMENDATIONS:
1. Archive 3 old EPIC reports to /docs/epics/
2. Fix 12 broken documentation links
3. Review large performance report file
```

#### 2. Auto Archive (`auto-archive.sh`)

**Purpose:** Automatically move old files to appropriate archive locations

**Usage:**
```bash
# Dry run to see what would be moved
./scripts/maintenance/auto-archive.sh --dry-run

# Execute archival with confirmation
./scripts/maintenance/auto-archive.sh --interactive

# Automatic archival (use with caution)
./scripts/maintenance/auto-archive.sh --auto-confirm

# Archive specific file types only
./scripts/maintenance/auto-archive.sh --type="EPIC-*" --dry-run

# Archive files older than specific age
./scripts/maintenance/auto-archive.sh --older-than=60 --dry-run
```

**Configuration File (`config/archive-rules.yaml`):**
```yaml
archive_rules:
  epic_reports:
    pattern: "EPIC-*-*.md"
    age_days: 30
    destination: "docs/epics/"

  performance_reports:
    pattern: "*PERFORMANCE*.md"
    age_days: 14
    destination: "docs/archive/performance/"

  security_reports:
    pattern: "*SECURITY*.md"
    age_days: 7
    destination: "docs/security/reports/"
    classification_check: true

exclusions:
  - "README.md"
  - "CONTRIBUTING.md"
  - "LICENSE.md"
  - ".github/**"
```

#### 3. Validate Structure (`validate-structure.sh`)

**Purpose:** Ensure repository structure complies with organization standards

**Usage:**
```bash
# Full structure validation
./scripts/maintenance/validate-structure.sh

# Check specific standards
./scripts/maintenance/validate-structure.sh --check=naming,structure,security

# Generate compliance report
./scripts/maintenance/validate-structure.sh --report=compliance-$(date +%Y%m%d).json

# Fix automatically (where safe)
./scripts/maintenance/validate-structure.sh --auto-fix
```

**Example Output:**
```
Structure Validation Report
===========================

NAMING COMPLIANCE:
✅ File naming: 98% compliant
❌ Directory naming: 2 violations
    - /docs/Old/ should be /docs/old/
    - /docs/Archive should be /docs/archive

STRUCTURE COMPLIANCE:
✅ Root directory: Compliant
❌ Documentation hierarchy: 1 violation
    - Epic reports found in root (should be in /docs/epics/)

SECURITY COMPLIANCE:
⚠️  Classification review needed: 3 files
    - security-audit-detailed.md (needs classification)
```

### Parallel Cleanup Agent Deployment

#### When to Deploy Parallel Agents

**Deploy parallel agents when:**
- Repository has >1000 files requiring organization
- Multiple categories of cleanup needed simultaneously
- Time-sensitive cleanup required
- Complex dependency resolution needed

**Scenarios:**
```
High Priority Scenarios:
├── Security incident requiring rapid file classification
├── Regulatory audit requiring immediate compliance
├── System migration with tight deadlines
└── Large-scale refactoring with file reorganization

Medium Priority Scenarios:
├── Quarterly cleanup with extensive backlog
├── Team onboarding requiring clear structure
├── Documentation standardization project
└── Integration with new tooling requiring organization
```

#### Parallel Deployment Script

**Usage:**
```bash
# Deploy cleanup agents for comprehensive cleanup
./scripts/maintenance/parallel-cleanup-deploy.sh

# Deploy with specific agent configuration
./scripts/maintenance/parallel-cleanup-deploy.sh --config=parallel-config.yaml

# Deploy with Abdul coordination
./scripts/maintenance/parallel-cleanup-deploy.sh --abdul-managed

# Monitor agent progress
./scripts/maintenance/parallel-cleanup-deploy.sh --monitor

# Emergency stop all agents
./scripts/maintenance/parallel-cleanup-deploy.sh --emergency-stop
```

#### Agent Configuration (`parallel-config.yaml`)

```yaml
parallel_cleanup:
  agent_count: 4
  coordination_method: "abdul"

  agents:
    agent_1:
      name: "FileOrganizer"
      responsibility: "root_directory_cleanup"
      focus_areas: ["EPIC_reports", "performance_reports"]

    agent_2:
      name: "DocumentationArchiver"
      responsibility: "docs_organization"
      focus_areas: ["active_to_archive", "category_placement"]

    agent_3:
      name: "SecurityClassifier"
      responsibility: "security_file_handling"
      focus_areas: ["classification", "access_control"]

    agent_4:
      name: "QualityValidator"
      responsibility: "content_validation"
      focus_areas: ["link_checking", "format_validation"]

  coordination:
    conflict_resolution: "abdul_arbitration"
    progress_reporting: true
    real_time_monitoring: true

  safety:
    backup_before_changes: true
    dry_run_first: true
    human_approval_required: ["security_files", "root_config"]
```

#### Agent Deployment Process

**Phase 1: Preparation**
```bash
# 1. Create backup
git branch backup-before-cleanup-$(date +%Y%m%d)

# 2. Validate current state
./scripts/maintenance/repo-health-check.sh --baseline

# 3. Initialize Abdul coordination
abdul create-project --name="repository-cleanup-$(date +%Y%m%d)" --type=maintenance
```

**Phase 2: Agent Deployment**
```bash
# 1. Deploy agents with dry run
./scripts/maintenance/parallel-cleanup-deploy.sh --dry-run --config=parallel-config.yaml

# 2. Review proposed changes
less /tmp/cleanup-plan-$(date +%Y%m%d).json

# 3. Execute with monitoring
./scripts/maintenance/parallel-cleanup-deploy.sh --execute --monitor
```

**Phase 3: Validation**
```bash
# 1. Health check after cleanup
./scripts/maintenance/repo-health-check.sh --post-cleanup

# 2. Validate structure compliance
./scripts/maintenance/validate-structure.sh --full-check

# 3. Generate completion report
./scripts/maintenance/generate-health-report.sh --cleanup-summary
```

### Abdul Project Management Integration

#### Integration Overview

Abdul (BMAD Core Project Manager) coordinates cleanup operations, manages agent conflicts, and provides intelligent oversight.

#### Abdul Commands for Repository Maintenance

```bash
# Initialize cleanup project
abdul create-project --name="repo-maintenance" --type="cleanup" --priority="high"

# Assign cleanup task with analysis
abdul assign-task --task="repository-cleanup" --analyze-first

# Get Abdul's assessment
abdul analyze-repository --path=/Users/paultinp/BMAD-CYBER2 --suggest-cleanup

# Request agent coordination
abdul coordinate-agents --task="parallel-cleanup" --config="parallel-config.yaml"

# Monitor progress
abdul status --project="repo-maintenance" --live-updates

# Request conflict resolution
abdul resolve-conflict --agents="FileOrganizer,SecurityClassifier" --issue="file-classification"
```

#### Abdul Integration Configuration

**`.abdul/repository-config.yaml`:**
```yaml
abdul_integration:
  repository_path: "/Users/paultinp/BMAD-CYBER2"

  monitoring:
    health_check_interval: "15min"
    alert_thresholds:
      root_files: 20
      broken_links: 10
      classification_pending: 5

  automation:
    auto_approve_safe_operations: true
    require_approval:
      - security_file_moves
      - root_config_changes
      - bulk_deletions

  reporting:
    daily_health_summary: true
    weekly_detailed_report: true
    incident_notifications: true

  agent_coordination:
    max_concurrent_agents: 4
    conflict_resolution: "weighted_priority"
    communication_method: "message_queue"
```

#### Abdul Workflow Examples

**Scenario 1: Routine Maintenance**
```bash
# Abdul analyzes and suggests maintenance
abdul suggest-maintenance --repository=/Users/paultinp/BMAD-CYBER2

# Output:
# Maintenance Suggestions:
# 1. Archive 5 old EPIC reports (Priority: Medium)
# 2. Fix 8 broken links (Priority: High)
# 3. Classify 3 security documents (Priority: High)
#
# Recommended approach: Sequential cleanup
# Estimated time: 45 minutes

# Execute Abdul's plan
abdul execute-plan --plan-id="maintenance-20260124-001" --confirm
```

**Scenario 2: Emergency Cleanup**
```bash
# Emergency cleanup request
abdul emergency-cleanup --reason="compliance-audit" --deadline="24-hours"

# Output:
# Emergency Cleanup Plan Generated
# Deploying 4 parallel agents
# Priority focus: Security classification and compliance
# ETA: 3 hours with monitoring

# Monitor emergency cleanup
abdul monitor --emergency --real-time
```

**Scenario 3: Conflict Resolution**
```bash
# When agents conflict on file placement
abdul resolve-conflict --context="EPIC-4-STORY-4.1-report classification"

# Abdul arbitration:
# Agent 1 (FileOrganizer): Suggests /docs/epics/epic-4/
# Agent 2 (SecurityClassifier): Suggests /docs/security/confidential/
#
# Resolution: File contains security assessment details
# Decision: Move to /docs/security/confidential/ with copy reference in /docs/epics/epic-4/
```

## Monitoring and Validation Procedures

### Real-time Monitoring

#### Monitoring Dashboard

**Command:**
```bash
# Launch monitoring dashboard
./scripts/maintenance/monitor-cleanup.sh --dashboard

# Monitor specific agents
./scripts/maintenance/monitor-cleanup.sh --agent="FileOrganizer" --real-time

# Monitor system health during cleanup
watch -n 30 './scripts/maintenance/repo-health-check.sh --quick'
```

**Dashboard Metrics:**
- Files processed per minute
- Agent status and progress
- Error rate and types
- System resource usage
- Conflict resolution requests

#### Alert Thresholds

```yaml
alerts:
  error_rate:
    threshold: 5%
    action: "pause_operations"

  conflict_rate:
    threshold: 10%
    action: "request_human_review"

  system_resources:
    cpu_threshold: 80%
    memory_threshold: 85%
    action: "throttle_agents"

  security_violations:
    threshold: 1
    action: "immediate_stop"
```

### Validation Procedures

#### Pre-Cleanup Validation

```bash
# 1. Repository state backup
git stash push --include-untracked -m "pre-cleanup-backup-$(date +%Y%m%d)"

# 2. Baseline health check
./scripts/maintenance/repo-health-check.sh --baseline > baseline-$(date +%Y%m%d).json

# 3. Critical file verification
./scripts/maintenance/verify-critical-files.sh

# 4. Dependency check
./scripts/maintenance/check-file-dependencies.sh
```

#### Post-Cleanup Validation

```bash
# 1. Structure compliance verification
./scripts/maintenance/validate-structure.sh --full-check --strict

# 2. Link integrity check
./scripts/maintenance/validate-links.sh --all-links --external-check

# 3. Security classification verification
./scripts/maintenance/verify-security-classification.sh

# 4. Functionality test
npm test && npm run build

# 5. Generate completion report
./scripts/maintenance/generate-health-report.sh --cleanup-completion
```

#### Validation Checklist

**Critical Validations:**
- [ ] All critical configuration files preserved
- [ ] No broken internal links
- [ ] Security classifications maintained
- [ ] Build process unaffected
- [ ] Test suite passes
- [ ] No data loss occurred

**Quality Validations:**
- [ ] File naming conventions followed
- [ ] Directory structure compliant
- [ ] Documentation standards met
- [ ] Link hygiene maintained
- [ ] Duplicate files resolved

**Security Validations:**
- [ ] Sensitive files properly classified
- [ ] Access controls maintained
- [ ] No credentials exposed
- [ ] Security documentation updated
- [ ] Audit trail complete

### Rollback Procedures

#### When to Rollback

**Immediate Rollback Triggers:**
- Data loss detected
- Critical system functionality broken
- Security classification errors
- Irreversible file corruption

**Rollback Commands:**
```bash
# Emergency rollback to last backup
git reset --hard backup-before-cleanup-$(date +%Y%m%d)

# Selective rollback using Abdul
abdul rollback --operation="cleanup-$(date +%Y%m%d)" --selective

# Restore from specific backup
./scripts/maintenance/restore-backup.sh --backup-id="$(date +%Y%m%d)-pre-cleanup"

# Validate rollback success
./scripts/maintenance/repo-health-check.sh --post-rollback
```

## Best Practices

### Pre-Cleanup Preparation

1. **Always create backups** before major cleanup operations
2. **Run dry-run** mode first to preview changes
3. **Verify critical files** are not affected
4. **Schedule during low-activity periods**
5. **Notify team** of planned cleanup operations

### During Cleanup

1. **Monitor continuously** during parallel agent operations
2. **Be ready to intervene** if conflicts arise
3. **Document decisions** made during cleanup
4. **Maintain communication** with Abdul for coordination
5. **Verify incrementally** rather than waiting for completion

### Post-Cleanup

1. **Validate thoroughly** before declaring success
2. **Update documentation** reflecting new organization
3. **Archive operation logs** for future reference
4. **Gather feedback** for process improvement
5. **Schedule follow-up** maintenance based on results

## Troubleshooting Common Issues

### Agent Conflicts

**Issue:** Multiple agents attempting to move the same file
**Resolution:**
```bash
# Check conflict status
abdul status --conflicts --detailed

# Manual resolution
abdul resolve-conflict --file="EPIC-4-STORY-4.1-report.md" --arbitrate

# Prevent future conflicts
abdul update-agent-rules --avoid-overlap
```

### Performance Issues

**Issue:** Cleanup operations running slowly
**Diagnosis:**
```bash
# Check system resources
top -p $(pgrep -f "cleanup")

# Monitor I/O
iotop -p $(pgrep -f "cleanup")

# Check agent efficiency
./scripts/maintenance/agent-performance.sh
```

**Resolution:**
- Reduce number of parallel agents
- Increase system resources
- Optimize agent algorithms
- Schedule during off-peak hours

### Security Classification Errors

**Issue:** Files incorrectly classified or moved
**Resolution:**
```bash
# Audit security classifications
./scripts/maintenance/audit-security-classifications.sh

# Correct misclassifications
./scripts/maintenance/fix-security-classifications.sh --file-list=misclassified.txt

# Notify security team
abdul notify --team="security" --issue="classification-errors" --priority="high"
```

### Data Integrity Issues

**Issue:** File corruption or loss during cleanup
**Immediate Action:**
```bash
# Stop all cleanup operations
./scripts/maintenance/emergency-stop.sh

# Assess damage
./scripts/maintenance/assess-integrity.sh

# Restore from backup
./scripts/maintenance/restore-integrity.sh --backup="latest"

# Report incident
abdul report-incident --type="data-integrity" --severity="high"
```

---

**Document Control:**
- **Version:** 1.0
- **Effective Date:** January 24, 2026
- **Review Cycle:** Quarterly
- **Next Review:** April 24, 2026
- **Owner:** BMAD Operations Team
- **Classification:** Internal Use

**Related Documents:**
- Repository Maintenance Guide
- File Organization Standards
- Abdul Project Management Documentation
- Security Classification Procedures