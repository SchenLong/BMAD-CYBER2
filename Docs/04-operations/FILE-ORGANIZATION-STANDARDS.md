# File Organization Standards

**BMAD-CYBER2 Repository File Organization Standards**

Version: 1.0
Last Updated: January 24, 2026
Authority: BMAD Operations Team

## Overview

This document establishes comprehensive standards for file and folder organization within the BMAD-CYBER2 repository. These standards ensure consistency, discoverability, and maintainability across all team contributions.

## Root Directory Standards

### What Belongs in Root Directory

#### Configuration Files (REQUIRED)
```
/.gitignore              # Git exclusions
/package.json           # Node.js dependencies
/tsconfig.json          # TypeScript configuration
/.eslintrc.js           # Code linting rules
/.prettierrc.js         # Code formatting rules
/jest.config.js         # Testing configuration
/webpack.config.js      # Build configuration
```

#### Project Documentation (REQUIRED)
```
/README.md              # Project overview and quick start
/CONTRIBUTING.md        # Contribution guidelines
/LICENSE.md             # License information
/CHANGELOG.md           # Version history
/CODE_OF_CONDUCT.md     # Community standards
```

#### Active Reports (TEMPORARY - MAX 30 DAYS)
```
/EPIC-X-STORY-Y-*.md    # Current EPIC completion reports
/PERFORMANCE-REPORT-*.md # Recent performance assessments
/SECURITY-AUDIT-*.md    # Recent security reviews
```

#### System Directories (MANAGED)
```
/.git/                  # Git version control (auto-managed)
/.github/               # GitHub workflows and templates
/.claude/               # Claude AI integration files
/node_modules/          # Dependencies (gitignored)
/dist/                  # Build output (gitignored)
```

### What Does NOT Belong in Root

❌ **Prohibited Items:**
- Personal notes or drafts
- Historical reports (>30 days old)
- Test output files
- Backup files (`*.bak`, `*.orig`)
- Temporary files (`*.tmp`, `*.temp`)
- IDE-specific files (`.vscode/`, `.idea/`)
- OS-specific files (`.DS_Store`, `Thumbs.db`)
- Log files (`*.log`)
- Cache directories

## Documentation Categorization Rules

### Primary Categories

#### 1. `/docs/active/` - Current Working Documents
**Purpose:** Documents in active use or development
**Retention:** Move to permanent location within 60 days
**Examples:**
- Draft documentation under review
- Current project specifications
- Active meeting notes

#### 2. `/docs/archive/` - Historical Content
**Purpose:** Completed projects and historical documentation
**Retention:** Permanent, organized by date/project
**Structure:**
```
/docs/archive/
├── 2025/
│   ├── q1/
│   ├── q2/
│   ├── q3/
│   └── q4/
├── 2026/
│   ├── q1/
│   └── projects/
│       ├── project-alpha/
│       └── project-beta/
└── legacy-systems/
```

#### 3. `/docs/epics/` - EPIC Documentation
**Purpose:** Organized EPIC reports and documentation
**Structure:**
```
/docs/epics/
├── epic-1-foundation/
│   ├── README.md
│   ├── epic-1-completion-report.md
│   ├── story-1.1-implementation.md
│   └── story-1.2-testing.md
├── epic-2-security/
└── epic-3-performance/
```

#### 4. `/docs/framework/` - System Architecture
**Purpose:** Technical architecture and framework documentation
**Examples:**
- System architecture diagrams
- API documentation
- Database schemas
- Integration patterns

#### 5. `/docs/guides/` - Procedural Documentation
**Purpose:** How-to guides and procedures
**Structure:**
```
/docs/guides/
├── developer/
│   ├── getting-started.md
│   ├── coding-standards.md
│   └── deployment.md
├── user/
│   ├── installation.md
│   └── configuration.md
└── operations/
    ├── monitoring.md
    └── troubleshooting.md
```

#### 6. `/Docs/04-operations/` - Operational Procedures
**Purpose:** Operational runbooks and maintenance procedures
**Security:** Internal use only
**Examples:**
- This document
- Incident response procedures
- Maintenance schedules
- Automation scripts

#### 7. `/docs/security/` - Security Documentation
**Purpose:** Security-related documentation with access controls
**Structure:**
```
/docs/security/
├── public/              # Public security information
├── internal/            # Internal team access
├── confidential/        # Restricted access
└── incidents/           # Incident reports
```

#### 8. `/docs/stories/` - User Story Documentation
**Purpose:** Individual user story documentation
**Organization:** By epic and sprint
**Structure:**
```
/docs/stories/
├── epic-1/
│   ├── story-1.1/
│   ├── story-1.2/
│   └── story-1.3/
└── epic-2/
```

#### 9. `/docs/systems/` - System-Specific Documentation
**Purpose:** Documentation for specific system components
**Examples:**
- Database documentation
- Service documentation
- Infrastructure documentation

#### 10. `/docs/old/` - Deprecated Content Awaiting Review
**Purpose:** Temporary holding area for content pending classification
**Retention:** Review monthly, maximum 90 days
**Action Required:** Must be reclassified or deleted within 90 days

## Naming Conventions

### File Naming Standards

#### General Rules
- Use lowercase with hyphens: `system-architecture.md`
- Include dates for reports: `performance-report-2026-01-24.md`
- Use descriptive names: `user-authentication-guide.md` not `auth.md`
- Avoid special characters: `a-z`, `0-9`, `-`, `_` only
- Maximum filename length: 60 characters

#### Specific Patterns

**EPIC Reports:**
```
EPIC-{number}-{short-description}.md
EPIC-{number}-STORY-{number}-{description}.md

Examples:
EPIC-4-SECURITY-IMPLEMENTATION.md
EPIC-4-STORY-4.1-AUTHENTICATION-SYSTEM.md
```

**Technical Documentation:**
```
{system}-{component}-{type}.md

Examples:
database-schema-reference.md
api-authentication-guide.md
deployment-aws-runbook.md
```

**Reports and Assessments:**
```
{type}-{subject}-{date}.md

Examples:
security-audit-2026-01-24.md
performance-report-2026-01-24.md
code-review-auth-module-2026-01-24.md
```

**Meeting Notes:**
```
{meeting-type}-{date}-{optional-topic}.md

Examples:
standup-2026-01-24.md
retrospective-2026-01-24-epic-4.md
architecture-review-2026-01-24-auth-system.md
```

### Directory Naming Standards

- Use lowercase with hyphens
- Be descriptive but concise
- Group related content logically
- Avoid deep nesting (max 4 levels)

#### Examples:
```
✅ Good:
/docs/guides/developer/
/docs/security/incident-response/
/docs/epics/epic-4-security/

❌ Bad:
/docs/Guides/Developer/
/docs/security/incident_response/
/docs/epics/E4/
```

## Archive vs Active Content Criteria

### Decision Matrix

| Criteria | Active | Archive | Old (Review) |
|----------|--------|---------|--------------|
| **Age** | <30 days | >30 days, historical value | >30 days, unclear value |
| **Usage** | Regular reference | Occasional reference | Rarely/never referenced |
| **Status** | In development/current | Completed/historical | Unclear/deprecated |
| **Value** | Current operational value | Historical/reference value | Questionable value |

### Specific Guidelines

#### Move to Archive When:
- Project is completed and documented
- Report is finalized and approved
- System is deprecated but documented for reference
- Historical value for future reference

#### Move to Old When:
- Purpose is unclear
- Content may be outdated
- Duplicate of existing documentation
- Personal notes or drafts

#### Keep Active When:
- Currently being developed or modified
- Regular operational reference
- Part of current project scope
- Less than 30 days old and relevant

## Duplicate Detection and Handling

### Detection Methods

#### Manual Review
```bash
# Find potential duplicates by name similarity
find /docs -name "*.md" | sort | grep -E "(copy|duplicate|backup|old)"

# Find files with same content
find /docs -name "*.md" -exec md5sum {} \; | sort | uniq -d -w32
```

#### Automated Tools
- Use `fdupes` for binary duplicate detection
- Custom scripts for content similarity
- Git history analysis for file renames

### Resolution Procedures

#### Identical Files
1. **Verify files are truly identical**
2. **Keep the file in the most appropriate location**
3. **Delete the duplicate**
4. **Update any links pointing to deleted file**

#### Similar but Different Files
1. **Compare content differences**
2. **Determine if both versions have value**
3. **If one is clearly better:**
   - Keep the better version
   - Archive or delete the inferior version
4. **If both have unique value:**
   - Rename for clarity
   - Update links and references
   - Document the relationship

#### Example Resolution:
```
Found duplicates:
/docs/security/auth-guide.md
/docs/guides/developer/authentication.md

Resolution:
1. Content review shows developer guide is more comprehensive
2. Security guide has additional security-specific considerations
3. Action: Merge security considerations into developer guide
4. Archive security-specific guide as reference
5. Update all links to point to merged document
```

## Content Lifecycle Management

### Lifecycle Stages

```
Creation → Active Use → Completion → Archive → (Eventual Deletion)
```

#### Stage 1: Creation
- **Location:** `/docs/active/` or appropriate working directory
- **Requirements:** Include creation date, author, purpose
- **Duration:** Project development phase

#### Stage 2: Active Use
- **Location:** Appropriate `/docs/` subdirectory
- **Requirements:** Regular updates, link maintenance
- **Duration:** While content is current and useful

#### Stage 3: Completion
- **Location:** Move to appropriate permanent location
- **Requirements:** Final review, link updates
- **Duration:** Transition period (1-2 weeks)

#### Stage 4: Archive
- **Location:** `/docs/archive/` with appropriate dating
- **Requirements:** Preserve for historical reference
- **Duration:** Indefinite (with periodic review)

#### Stage 5: Deletion (if applicable)
- **Criteria:** No historical value, outdated, or superseded
- **Process:** Team review required before deletion
- **Backup:** Maintain in separate backup before deletion

## Quality Standards

### Documentation Quality Checklist

#### Required Elements
- [ ] Clear title and purpose
- [ ] Creation date and author
- [ ] Last modified date
- [ ] Table of contents (for documents >500 words)
- [ ] Proper markdown formatting
- [ ] Valid internal and external links

#### Content Standards
- [ ] Clear, concise language
- [ ] Proper grammar and spelling
- [ ] Logical organization
- [ ] Examples where appropriate
- [ ] Contact information for questions

#### Technical Standards
- [ ] Valid markdown syntax
- [ ] Proper heading hierarchy
- [ ] Alt text for images
- [ ] Code blocks with language specification
- [ ] Tables properly formatted

### Link Management

#### Internal Links
- Use relative paths: `../guides/developer/setup.md`
- Validate links monthly
- Update when files are moved
- Use descriptive link text

#### External Links
- Include last verified date
- Check quarterly for validity
- Use archive.org for important external references
- Avoid linking to temporary or unstable URLs

## Automation and Tooling

### Recommended Tools

#### File Organization
```bash
# Tree view of documentation structure
tree /docs -I 'node_modules|*.log'

# Find large files that might need archival
find /docs -type f -size +1M

# Identify recently modified files
find /docs -type f -mtime -7
```

#### Content Validation
```bash
# Check for broken links (using markdown-link-check)
npx markdown-link-check /docs/**/*.md

# Validate markdown syntax
npx markdownlint /docs/**/*.md

# Check for TODO items in documentation
grep -r "TODO\|FIXME\|XXX" /docs/
```

### Automated Maintenance Scripts

#### Available Scripts
1. **`validate-structure.sh`** - Validates directory structure compliance
2. **`check-duplicates.sh`** - Identifies potential duplicate files
3. **`archive-old-files.sh`** - Moves old files to archive
4. **`validate-links.sh`** - Checks for broken links
5. **`generate-toc.sh`** - Updates table of contents

#### Integration with CI/CD
```yaml
# Example GitHub Action for documentation validation
name: Documentation Quality Check
on: [pull_request]
jobs:
  validate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Validate file organization
        run: ./scripts/validate-structure.sh
      - name: Check for broken links
        run: npx markdown-link-check docs/**/*.md
```

## Compliance and Auditing

### Monthly Audit Checklist

#### Structure Compliance
- [ ] Root directory contains only approved file types
- [ ] No files in root older than 30 days (except approved exceptions)
- [ ] All documentation properly categorized
- [ ] `/docs/old/` contains no files older than 90 days

#### Quality Compliance
- [ ] All documentation meets quality standards
- [ ] Links are functional
- [ ] Naming conventions followed
- [ ] No duplicate content

#### Security Compliance
- [ ] Sensitive documents properly classified
- [ ] Access controls appropriate for content
- [ ] No credentials or secrets in documentation
- [ ] Security documentation up to date

### Reporting

#### Monthly Reports Include:
- Number of files organized
- Files moved to archive
- Duplicates resolved
- Broken links fixed
- Quality issues addressed

#### Quarterly Reviews Include:
- Standards effectiveness assessment
- Process improvement recommendations
- Team feedback incorporation
- Tool and automation updates

---

**Document Control:**
- **Version:** 1.0
- **Effective Date:** January 24, 2026
- **Review Cycle:** Quarterly
- **Next Review:** April 24, 2026
- **Owner:** BMAD Operations Team
- **Approval:** Repository Maintainers