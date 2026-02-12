---
name: 'step-01-target-setup'
description: 'Validate identifiers, enumerate selectors, set search parameters'
estimated_duration: '5-10 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/breach-archaeology'
thisStepFile: '{workflow_path}/steps/step-01-target-setup.md'
nextStepFile: '{workflow_path}/steps/step-02-exposure-scan.md'

# Agent Configuration
executing_agent: dark-web-analyst
agent_codename: Shadow
---

# Step 1: Target Setup

## STEP GOAL

Validate target identifiers, enumerate all related selectors for comprehensive breach searching, and establish search parameters.

## EXECUTION TIME: ~5-10 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Shadow**, Dark Web Intelligence Analyst
- You lead the Breach Archaeology investigation
- You prepare comprehensive search selectors
- You set appropriate search scope

### Step-Specific Rules

- Enumerate ALL possible identifier variations
- Include historical identifiers if known
- Set realistic time range expectations
- Document any scope limitations

---

## TARGET SETUP SEQUENCE

### 1. Validate Primary Identifier

Confirm the primary search target:

| Type | Validation | Example |
|------|------------|---------|
| Email | Valid format, domain exists | <user@company.com> |
| Username | Platform context if known | johndoe123 |
| Domain | Resolvable, owned by target | company.com |
| Phone | Valid format, carrier type | +1-555-123-4567 |
| Name | Sufficient uniqueness | John Michael Doe |

### 2. Enumerate Related Selectors

Expand from primary identifier to all searchable variations:

#### Email Variations

```
Primary: john.doe@company.com

Derived selectors:
□ john.doe@company.com (primary)
□ johndoe@company.com (no separator)
□ jdoe@company.com (abbreviated)
□ john.d@company.com (initial)
□ j.doe@company.com (first initial)
□ [username]@gmail.com (personal - if known)
□ [username]@outlook.com (personal - if known)

Domain variations:
□ @company.com (all emails at domain)
□ @subdomain.company.com (if applicable)
```

#### Username Variations

```
Primary: johndoe123

Derived selectors:
□ johndoe123 (primary)
□ johndoe (without numbers)
□ john_doe (underscore)
□ john-doe (hyphen)
□ john.doe (period)
□ jdoe123 (abbreviated)
□ johndoe1234 (number variations)
□ johndoe_official (common suffixes)
```

#### Domain Variations

```
Primary: company.com

Derived selectors:
□ company.com (primary)
□ www.company.com
□ mail.company.com
□ *.company.com (all subdomains)
□ company.co (alternate TLD)
□ company.net (alternate TLD)
□ getcompany.com (common patterns)
□ companyapp.com (product domains)
```

### 3. Identify Search Scope

Define search parameters:

```
SEARCH SCOPE CONFIGURATION
==========================

Time Range:
□ All time (comprehensive)
□ Last 5 years (recent focus)
□ Last 1 year (urgent)
□ Custom: [start date] to [end date]

Breach Sources:
□ Major breach databases (HIBP, DeHashed, etc.)
□ Paste sites (Pastebin, etc.)
□ Dark web forums
□ Underground marketplaces
□ Telegram channels
□ Private collections

Data Types of Interest:
□ Credentials (email + password)
□ Personal information (PII)
□ Financial data
□ Health records
□ Corporate data
□ All available
```

### 4. Document Known Context

Record any known information that aids the search:

```markdown
## TARGET CONTEXT

### Known Associations
- Organization: [company name]
- Industry: [sector]
- Geographic location: [region]
- Role/Position: [if known]

### Known Previous Incidents
- [Date]: [Incident description]
- [Date]: [Incident description]

### Historical Identifiers
- Previous email: [address]
- Previous username: [handle]
- Maiden name: [if applicable]

### Specific Concerns
- [Particular breach of concern]
- [Type of data worried about]
```

### 5. Initialize Breach Document

Create the working breach assessment document:

```markdown
# BREACH ARCHAEOLOGY ASSESSMENT

**Primary Target:** [identifier]
**Target Type:** [email/domain/username/etc.]
**Started:** [timestamp]
**Analyst:** Shadow (Intel Team)

---

## SEARCH SELECTORS

### Primary
- [primary identifier]

### Email Variations
- [variation 1]
- [variation 2]

### Username Variations
- [variation 1]
- [variation 2]

### Domain Variations
- [variation 1]
- [variation 2]

---

## SEARCH SCOPE
- **Time Range:** [range]
- **Sources:** [list]
- **Data Focus:** [types]

---

## KNOWN CONTEXT
[Relevant background information]

---

## BREACH FINDINGS

| Breach Name | Date | Selector Hit | Data Types | Severity |
|-------------|------|--------------|------------|----------|
| (To be populated) | | | | |

---
```

---

## COMPLETION CRITERIA

Before proceeding to Step 2:

- [ ] Primary identifier validated
- [ ] All variations enumerated
- [ ] Search scope defined
- [ ] Known context documented
- [ ] Breach document initialized

---

## MENU OPTIONS

**[C] Continue** - Proceed to exposure scan (Step 2)
**[A] Add Selectors** - Add more variations
**[S] Modify Scope** - Adjust search parameters
**[X] Cancel** - Abort workflow

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-02-exposure-scan.md`
