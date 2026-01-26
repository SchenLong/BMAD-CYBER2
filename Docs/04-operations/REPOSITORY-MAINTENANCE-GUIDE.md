# Repository Maintenance Guide

**BMAD-CYBER2 Repository Maintenance Documentation**

Version: 1.0
Last Updated: January 24, 2026
Maintainer: BMAD Cyber Operations Team

## Overview

This guide provides comprehensive instructions for maintaining the BMAD-CYBER2 repository structure, preventing clutter, and ensuring long-term organization. The repository serves as a multi-module cyber operations platform with extensive documentation, code, and operational reports.

## Repository Structure Overview

### Root Directory Standards

The root directory should contain **only** the following types of files:

#### ✅ **ALLOWED in Root:**
- **Core configuration files**: `.gitignore`, `package.json`, `tsconfig.json`, `.eslintrc.js`, etc.
- **Critical README files**: `README.md`, `CONTRIBUTING.md`, `LICENSE.md`
- **Current active reports**: Most recent EPIC completion reports (max 5-7 files)
- **Build artifacts**: Temporary build outputs (should be gitignored)
- **CI/CD files**: `.github/`, `.claude/` directories

#### ❌ **NOT ALLOWED in Root:**
- Historical reports older than 30 days
- Duplicate documentation files
- Test outputs or logs
- Backup files
- Draft documents
- Personal notes or temporary files

### Documentation Hierarchy

```
/docs/
├── active/                     # Current active documentation
├── archive/                    # Historical and legacy content
├── epics/                     # EPIC documentation and reports
├── framework/                 # System architecture and frameworks
├── guides/                    # User and developer guides
├── operations/                # This file and operational procedures
├── old/                       # Deprecated files awaiting review
├── reference/                 # Technical reference materials
├── security/                  # Security procedures and protocols
├── stories/                   # User story documentation
└── systems/                   # System-specific documentation
```

## File Organization Principles

### 1. The 30-Day Rule

**Active vs Archive Decision Tree:**

```
Is the file less than 30 days old?
├── YES: Can stay in root or /docs/active/
└── NO: Should move to /docs/archive/ or /docs/old/
    ├── Is it referenced by active systems?
    │   ├── YES: Move to appropriate /docs/ subdirectory
    │   └── NO: Move to /docs/old/
    └── Is it a completed EPIC/STORY?
        ├── YES: Move to /docs/epics/ or /docs/stories/
        └── NO: Move to /docs/archive/
```

### 2. EPIC/STORY Report Organization

#### Current EPICs (Root Directory)
Keep in root **only** if:
- Completed within last 30 days
- Currently being referenced by active development
- Part of ongoing operational review

#### Archive Criteria
Move to `/docs/epics/` when:
- EPIC is completed and reviewed
- Report is older than 30 days
- No active references in current work

#### Example Organization:
```
# Root (temporary, max 30 days)
EPIC-4-STORY-4.1-SENTINEL-EXECUTIVE-SUMMARY.md
EPIC-4-STORY-4.2-ARCHITECTURE-REVIEW-REPORT.md

# /docs/epics/ (permanent archive)
/docs/epics/epic-1/
├── EPIC-1-COMPLETION-REPORT.md
├── EPIC-1-STORY-1.1-IMPLEMENTATION.md
└── EPIC-1-STORY-1.2-TESTING.md
```

### 3. Security File Handling Protocols

#### Classification Levels

**PUBLIC** - Can remain in standard locations
- General system documentation
- Public API references
- Non-sensitive operational procedures

**INTERNAL** - Move to `/docs/security/internal/`
- Internal architecture details
- Team-specific procedures
- Non-public configuration examples

**CONFIDENTIAL** - Move to `/docs/security/confidential/`
- Security assessment reports
- Vulnerability details
- Incident response records

**RESTRICTED** - Special handling required
- May need encryption or separate repository
- Contact security team for guidance

#### Security File Decision Matrix

| File Type | Sensitivity | Location |
|-----------|-------------|----------|
| API Documentation | Public | `/docs/reference/` |
| Architecture Diagrams | Internal | `/docs/framework/` |
| Security Assessments | Confidential | `/docs/security/confidential/` |
| Incident Reports | Confidential | `/docs/security/incidents/` |
| Penetration Test Results | Restricted | Secure storage consultation |

## Regular Maintenance Checklist

### Weekly Maintenance (Every Monday)

```bash
# 1. Review root directory
ls -la /Users/paultinp/BMAD-CYBER2/

# 2. Identify files older than 7 days in root
find /Users/paultinp/BMAD-CYBER2 -maxdepth 1 -name "*.md" -mtime +7

# 3. Check for duplicate files
find /Users/paultinp/BMAD-CYBER2 -name "*.md" | sort | uniq -d

# 4. Review /docs/active/ for outdated content
find /Users/paultinp/BMAD-CYBER2/docs/active -name "*.md" -mtime +30
```

**Action Items:**
- [ ] Move completed EPICs to `/docs/epics/`
- [ ] Archive old reports to appropriate directories
- [ ] Remove duplicate files
- [ ] Update this checklist completion date

### Monthly Deep Clean (First Monday of Month)

```bash
# 1. Full repository scan for misplaced files
./scripts/maintenance/repo-health-check.sh

# 2. Archive files older than 30 days
./scripts/maintenance/auto-archive.sh --dry-run

# 3. Generate repository health report
./scripts/maintenance/generate-health-report.sh
```

**Action Items:**
- [ ] Review and approve auto-archive suggestions
- [ ] Update README files with current structure
- [ ] Clean up `/docs/old/` directory
- [ ] Validate all internal links
- [ ] Update this maintenance guide if needed

### Quarterly Review (Every 3 months)

**Action Items:**
- [ ] Complete security classification review
- [ ] Archive completed project documentation
- [ ] Review and update file organization standards
- [ ] Conduct team training on maintenance procedures
- [ ] Update automation scripts
- [ ] Review storage usage and optimization opportunities

## Decision Trees for Common Scenarios

### New EPIC Report Generated

```
New EPIC report created
├── Is EPIC still active?
│   ├── YES: Keep in root for easy access
│   └── NO: Move to /docs/epics/epic-X/
└── Contains sensitive information?
    ├── YES: Review security classification
    └── NO: Standard organization applies
```

### Duplicate File Discovered

```
Duplicate file found
├── Are both files identical?
│   ├── YES: Delete the older version
│   └── NO: Review differences
│       ├── Newer has updates: Keep newer, archive older
│       └── Both have unique content: Rename for clarity
└── Different locations but same content?
    ├── Keep in most appropriate location
    └── Delete from inappropriate location
```

### Legacy System Documentation

```
Legacy documentation found
├── System still in use?
│   ├── YES: Update and move to appropriate /docs/ folder
│   └── NO: Move to /docs/archive/legacy/
└── Historical value for reference?
    ├── YES: Keep in /docs/archive/ with clear dating
    └── NO: Consider for deletion after team review
```

## Automation Integration

### Abdul Project Management Integration

The repository maintenance integrates with Abdul (BMAD Core Project Manager):

```bash
# Trigger Abdul for repository organization
abdul assign-task --task="repository-maintenance" --priority=medium

# Get Abdul's recommendation for file organization
abdul analyze-repository --path=/Users/paultinp/BMAD-CYBER2 --suggest-cleanup
```

### Automated Scripts Available

1. **`/scripts/maintenance/repo-health-check.sh`**
   - Scans for misplaced files
   - Identifies duplicates
   - Checks file age compliance

2. **`/scripts/maintenance/auto-archive.sh`**
   - Moves old files to appropriate directories
   - Creates backup before moving
   - Generates report of actions taken

3. **`/scripts/maintenance/validate-structure.sh`**
   - Validates repository structure compliance
   - Checks naming conventions
   - Reports violations

## Best Practices

### File Naming Conventions

- Use consistent naming: `EPIC-X-STORY-Y-DESCRIPTION.md`
- Include dates in reports: `REPORT-NAME-YYYY-MM-DD.md`
- Avoid spaces, use hyphens: `security-assessment-report.md`
- Include version numbers: `architecture-v2.1.md`

### Documentation Standards

- Include creation date and author in headers
- Use consistent markdown formatting
- Link to related documents
- Update modification dates when editing

### Version Control

- Commit maintenance changes as separate commits
- Use descriptive commit messages: `docs: archive completed EPIC-3 reports`
- Tag major reorganizations for easy rollback

## Escalation Procedures

### When to Contact Teams

**Security Team** - Contact for:
- Classification questions
- Sensitive file handling
- Access control issues

**Development Team** - Contact for:
- Build artifact questions
- Code documentation placement
- CI/CD file organization

**Operations Team** - Contact for:
- Infrastructure documentation
- Operational procedure updates
- System configuration files

### Emergency Procedures

**Repository Corruption:**
1. Stop all maintenance operations
2. Create immediate backup
3. Contact development team lead
4. Document incident in `/docs/operations/incidents/`

**Accidental Deletion:**
1. Check git history for recovery
2. Use backup if available
3. Document what was lost
4. Implement additional safeguards

## Monitoring and Metrics

### Key Performance Indicators

- **Root directory file count**: Target <20 files
- **Documentation findability**: <30 seconds to locate any doc
- **Duplicate file ratio**: Target <5%
- **Archive compliance**: >95% of old files properly archived

### Monthly Reports

Generate reports including:
- Repository health score
- Maintenance actions taken
- Issues identified and resolved
- Recommendations for improvement

## Contact Information

**Primary Maintainer:** BMAD Cyber Operations Team
**Security Classification:** Operations Team Lead
**Emergency Contact:** Development Team Lead
**Documentation Questions:** Technical Writing Team

---

**Next Review Date:** April 24, 2026
**Document Owner:** BMAD Operations
**Classification:** Internal Use