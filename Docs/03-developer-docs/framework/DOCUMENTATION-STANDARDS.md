# Documentation Standards & Style Guide

*Version 1.0 | January 2026 | Paige (Technical Writer)*

## Overview

This guide establishes consistent standards for all documentation in the BMAD-CYBER2 ecosystem. Following these standards ensures our documentation is clear, findable, and maintainable.

## Content Strategy

### Audience-First Approach

Every document should have a clear primary audience:

| Audience | Content Focus | Example Documents |
|----------|---------------|-------------------|
| **End Users** | How to accomplish tasks | Quick start guides, tutorials, examples |
| **Developers** | How systems work internally | Architecture docs, API references |
| **Operators** | How to maintain and troubleshoot | Runbooks, monitoring guides |
| **Contributors** | How to extend the platform | Contributing guides, development setup |

### Documentation Types

#### 1. Procedural Documentation
- **Purpose**: Help users complete specific tasks
- **Structure**: Step-by-step instructions with clear outcomes
- **Examples**: "Setting up Intel Team", "Creating Custom Agents"

#### 2. Reference Documentation
- **Purpose**: Provide comprehensive details about system components
- **Structure**: Systematic coverage with clear organization
- **Examples**: "API Reference", "Configuration Options"

#### 3. Conceptual Documentation
- **Purpose**: Explain how things work and why
- **Structure**: Problem → solution → implementation
- **Examples**: "Security Architecture", "Multi-Agent Orchestration"

#### 4. Contextual Documentation
- **Purpose**: Provide just-in-time help within workflows
- **Structure**: Brief, actionable guidance
- **Examples**: Inline help, tooltips, error messages

## Writing Standards

### Voice and Tone

**Voice**: Clear, confident, helpful teacher
**Tone**: Patient and encouraging, adapting to complexity level

#### Examples:

**Good**: "Set up your Intel Team agents to gather intelligence across multiple disciplines. We'll start with OSINT capabilities and expand from there."

**Avoid**: "Configure the multi-disciplinary intelligence collection framework by instantiating OSINT operational parameters."

### Structure Guidelines

#### Document Headers
Every document must include:

```markdown
# Document Title

*Version X.X | Date | Author*

Brief description of what this document covers and who should read it.

## Prerequisites
- What readers need to know before starting
- Required tools or access
- Dependencies
```

#### Section Organization
1. **Introduction** (What and why)
2. **Prerequisites** (What you need)
3. **Main Content** (How to do it)
4. **Troubleshooting** (When things go wrong)
5. **Next Steps** (Where to go from here)

### Content Guidelines

#### Use Active Voice
- **Good**: "Install the security module"
- **Avoid**: "The security module should be installed"

#### Write Scannable Content
- Use bullet points for lists
- Bold key terms on first use
- Include code blocks for commands
- Use callouts for important information

#### Provide Context
Always explain the "why" along with the "how":

```markdown
## Configure LLM Provider Routing

Route sensitive agents to local LLMs to keep confidential data on-premises. This is especially important for intelligence operations and incident response.
```

## Markdown Standards

### File Naming

Use kebab-case with descriptive names:
- `getting-started-guide.md`
- `intel-team-api-reference.md`
- `security-architecture-overview.md`

### Heading Hierarchy

```markdown
# Document Title (H1 - once per document)
## Main Sections (H2)
### Subsections (H3)
#### Details (H4 - sparingly)
```

### Code Blocks

Always specify language for syntax highlighting:

```bash
# Good
bmad start intel-team/osint-lead
```

```
# Avoid - no language specified
bmad start intel-team/osint-lead
```

### Links

Use descriptive link text:
- **Good**: "See the [Security Architecture Guide](../framework/security/architecture.md)"
- **Avoid**: "See [here](../framework/security/architecture.md) for more info"

### Tables

Keep tables simple and scannable:

| Command | Purpose | Example |
|---------|---------|---------|
| `bmad start` | Launch agent | `bmad start cybersec-team/phoenix` |
| `bmad party` | Multi-agent mode | `bmad party incident-war-room` |

### Callouts

Use consistent callout styles:

```markdown
> 💡 **Tip**: Pro tips and best practices

> ⚠️ **Warning**: Important cautions

> 🚨 **Critical**: Critical security or data loss warnings

> 📚 **Reference**: Links to additional resources
```

## Information Architecture

### Directory Structure

Follow the established architecture:

```
docs/
├── user/           # End-user documentation
├── dev/           # Developer documentation
├── validation/    # Testing and validation
├── framework/     # Core framework docs
├── old/          # Obsolete (gitignored)
├── backups/      # Backups (gitignored)
└── oldprojects/  # Legacy (gitignored)
```

### Cross-References

Create logical pathways between documents:

1. **Hub Pages**: Central navigation for topic areas
2. **Progressive Disclosure**: Start simple, link to details
3. **Contextual Links**: Link to related concepts inline
4. **See Also**: End sections with related resources

### Navigation Aids

#### Index Files
Each major directory should have an `index.md`:

```markdown
# User Guide Index

## Getting Started
- [Quick Start Guide](getting-started/quick-start.md)
- [Installation Guide](getting-started/installation.md)

## Module Setup
- [Cybersec Team](modules/cybersec-team-setup.md)
- [Intel Team](modules/intel-team-setup.md)
```

#### Breadcrumbs
Include navigation context:

```markdown
[Home](../../README.md) > [User Guide](../index.md) > [Modules](index.md) > Intel Team Setup
```

## Quality Standards

### Content Review Checklist

Before publishing any document:

- [ ] **Audience**: Clear target audience identified
- [ ] **Purpose**: Document purpose stated upfront
- [ ] **Accuracy**: All instructions tested and verified
- [ ] **Completeness**: All necessary steps included
- [ ] **Clarity**: Language clear and jargon explained
- [ ] **Structure**: Logical flow with clear headings
- [ ] **Links**: All links verified and working
- [ ] **Examples**: Real examples provided where helpful
- [ ] **Currency**: Information up-to-date with current version

### Accessibility Standards

- Use descriptive link text
- Provide alt text for images
- Use sufficient color contrast
- Structure content with proper headings
- Write at appropriate reading level for audience

## Maintenance Procedures

### Version Control

- Update version numbers in document headers
- Use semantic versioning (Major.Minor.Patch)
- Document change rationale in commit messages

### Review Cycles

- **Quarterly**: Review all user-facing documentation
- **Release cycles**: Update all affected documentation
- **On-demand**: When issues are reported

### Deprecation Process

When content becomes obsolete:

1. Move to `docs/old/` directory
2. Add deprecation notice to original location
3. Update all cross-references
4. Add to `.gitignore` if appropriate

## Template Library

### Standard Templates

Available in `docs/framework/templates/`:

- `user-guide-template.md`
- `api-reference-template.md`
- `tutorial-template.md`
- `troubleshooting-template.md`
- `architecture-template.md`

### Template Usage

Copy appropriate template and follow embedded guidelines. Templates include:

- Required sections
- Optional sections
- Content guidelines
- Example text

## Implementation Guidelines

### Content Migration

When reorganizing existing documentation:

1. **Audit**: Catalog all existing content
2. **Map**: Assign content to new structure
3. **Migrate**: Move content with redirects
4. **Validate**: Test all links and references
5. **Archive**: Move obsolete content to `old/`

### Team Coordination

- **Content ownership**: Each team owns their module docs
- **Cross-team content**: Coordinate through Documentation Team
- **Style consistency**: Follow this guide for all content
- **Review process**: Peer review for significant changes

## Tools and Automation

### Recommended Tools

- **Markdown editing**: Support for CommonMark specification
- **Link checking**: Automated broken link detection
- **Spell check**: Consistent terminology usage
- **Preview**: WYSIWYG preview capability

### Automation Opportunities

- Automated table of contents generation
- Link validation in CI/CD pipeline
- Style guide compliance checking
- Cross-reference validation

## Feedback and Improvement

This style guide evolves with the documentation needs. Submit feedback through:

- GitHub issues for style guide improvements
- Documentation team reviews
- User feedback analysis
- Regular effectiveness assessments

---

*This style guide ensures our documentation serves our users effectively while remaining maintainable and consistent as the BMAD-CYBER2 platform grows.*