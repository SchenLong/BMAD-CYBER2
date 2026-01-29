# BMAD Schemas and Data Structures

Technical reference for the standardized schemas and data structures used for cross-module communication in BMAD-CYBER2.

---

## Overview

BMAD-CYBER2 uses standardized YAML/JSON schemas to enable consistent data exchange between modules. These schemas ensure:

- **Traceability**: All artifacts track their origin and relationships
- **Interoperability**: Modules can consume each other's outputs
- **Validation**: Data can be validated against schemas
- **Auditability**: Complete lineage from source to destination

---

## Schema Registry

| Schema | Purpose | Used By |
|--------|---------|---------|
| `threat-model.schema.yaml` | Threat modeling results | Cybersec-Team -> BMM, Intel-Team, Legal-Team |
| `iocs.schema.yaml` | Indicators of Compromise | Cybersec-Team <-> Intel-Team |
| `compliance-requirements.schema.yaml` | Compliance controls | Legal-Team -> BMM, Cybersec-Team |
| `artifact-metadata.schema.yaml` | Cross-module artifact metadata | All modules |

**Schema Location:** `_bmad/core/schemas/`

---

## Artifact Metadata Schema

All cross-module artifacts should include standardized metadata for traceability.

**Schema ID:** `bmad://schemas/artifact-metadata/1.0`

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `source_workflow` | string | Workflow that created the artifact |
| `source_module` | string | Module that owns the workflow |
| `created_at` | datetime | ISO 8601 timestamp |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `source_agent` | string | Agent that executed the workflow |
| `updated_at` | datetime | Last modification timestamp |
| `expires_at` | datetime | When artifact should be reviewed |
| `project_id` | string | Project identifier |
| `project_phase` | enum | discovery, planning, solutioning, implementation, release |
| `version` | string | Artifact version (default: "1.0") |
| `supersedes` | string | Path to previous version |
| `tags` | array | Tags for categorization and search |
| `status` | enum | draft, review, approved, superseded, archived |
| `confidence` | enum | High, Medium, Low |

### Traceability Links

```yaml
links:
  - relation: "derives_from"      # This artifact is derived from target
    target_artifact: "architecture.md"
  - relation: "implements"        # This artifact implements target
    target_artifact: "prd.md"
  - relation: "validates"         # This artifact validates target
    target_artifact: "threat-model.yaml"
  - relation: "supersedes"        # This artifact replaces target
    target_artifact: "old-architecture.md"
  - relation: "relates_to"        # General relationship
    target_artifact: "related-doc.md"
  - relation: "requires"          # This artifact requires target
    target_artifact: "dependency.md"
  - relation: "informs"           # This artifact provides input to target
    target_artifact: "downstream.md"
  - relation: "extracted_from"    # This artifact was extracted from target
    target_artifact: "source.md"
```

### Example Usage

```yaml
# Include at end of any YAML artifact
_bmad_metadata:
  source_workflow: "stride-threat-model"
  source_module: "cybersec-team"
  source_agent: "threat-analyst"
  created_at: "2025-01-11T14:30:00Z"
  project_id: "proj-001"
  project_phase: "solutioning"
  version: "1.0"
  links:
    - relation: "derives_from"
      target_artifact: "architecture.md"
    - relation: "informs"
      target_artifact: "epics-and-stories.md"
  tags: ["security", "threats", "stride"]
  status: "approved"
  approvals:
    - role: "security-architect"
      agent: "security-architect"
      date: "2025-01-11T15:00:00Z"
```

---

## Threat Model Schema

Standardized format for threat modeling results.

**Schema ID:** `bmad://schemas/threat-model/1.0`

### Structure

```yaml
# Metadata
metadata:
  project_id: "proj-001"
  created_by: "threat-analyst"
  created_at: "2025-01-11T14:30:00Z"
  methodology: "STRIDE"           # STRIDE, DREAD, PASTA, LINDDUN, ATTACK_TREES, custom
  version: "1.0"
  status: "draft"                 # draft, review, approved, superseded
  source_artifacts:
    - "architecture.md"
    - "prd.md"

# Scope definition
scope:
  system_name: "My Application"
  components:
    - name: "API Gateway"
      type: "api"                 # service, database, api, frontend, external, user
      data_classification: "confidential"  # public, internal, confidential, restricted
  data_flows:
    - from: "Frontend"
      to: "API Gateway"
      data_type: "User credentials"
      protocol: "HTTPS"

# Threats
threats:
  - id: "T-001"                   # Pattern: T-XXX
    category: "Spoofing"          # STRIDE categories
    title: "Authentication bypass via token manipulation"
    description: "Attacker could forge JWT tokens..."
    affected_components:
      - "API Gateway"
      - "Auth Service"
    attack_vector: "Network-based attack requiring..."
    mitre_attack_techniques:
      - "T1078"                   # Pattern: TXXXX or TXXXX.XXX
      - "T1550.001"
    severity: "High"              # Critical, High, Medium, Low, Informational
    likelihood: "Medium"          # High, Medium, Low
    risk_score: 65                # 0-100
    mitigations:
      - id: "M-001"
        description: "Implement JWT signature validation"
        control_type: "Preventive"  # Preventive, Detective, Corrective, Compensating
        implementation_status: "InProgress"  # NotStarted, InProgress, Complete, NotApplicable
        assigned_to: "STORY-042"

# Summary statistics
summary:
  total_threats: 12
  by_severity:
    critical: 2
    high: 4
    medium: 5
    low: 1
  by_category:
    Spoofing: 3
    Tampering: 2
    InformationDisclosure: 4
    DenialOfService: 2
    ElevationOfPrivilege: 1
  mitigations_complete: 4
  mitigations_pending: 8
```

### STRIDE Categories

| Category | Description |
|----------|-------------|
| Spoofing | Impersonating something or someone else |
| Tampering | Modifying data or code |
| Repudiation | Denying having performed an action |
| InformationDisclosure | Exposing information to unauthorized users |
| DenialOfService | Making a system unavailable |
| ElevationOfPrivilege | Gaining unauthorized capabilities |

---

## IOC (Indicators of Compromise) Schema

Standardized format for threat intelligence exchange.

**Schema ID:** `bmad://schemas/iocs/1.0`

### Structure

```yaml
# Metadata
metadata:
  incident_id: "INC-2025-001"
  created_by: "threat-analyst"
  created_at: "2025-01-11T14:30:00Z"
  classification: "TLP:AMBER"     # TLP:CLEAR, TLP:GREEN, TLP:AMBER, TLP:AMBER+STRICT, TLP:RED
  source_type: "incident"         # incident, threat_hunt, external_feed, osint, malware_analysis
  confidence_baseline: "Medium"   # High, Medium, Low

# Indicators
indicators:
  - type: "ip"                    # See indicator types below
    value: "192.168.1.100"
    first_seen: "2025-01-10T08:00:00Z"
    last_seen: "2025-01-11T12:00:00Z"
    confidence: "High"
    context: "C2 callback observed from compromised host"
    tags: ["c2", "cobalt-strike"]
    mitre_techniques:
      - "T1071.001"
    source: "incident-response workflow"
    defanged: false
    notes: "Associated with APT29"

# Enrichment data
enrichment:
  whois:
    - indicator: "malicious-domain.com"
      registrar: "Example Registrar"
      creation_date: "2025-01-01"
      registrant_org: "Unknown"
  geolocation:
    - indicator: "192.168.1.100"
      country: "RU"
      city: "Moscow"
      asn: "AS12345"
      org: "Example ISP"
  reputation:
    - indicator: "192.168.1.100"
      source: "VirusTotal"
      score: 15
      categories: ["malware", "c2"]

# Summary
summary:
  total_count: 25
  by_type:
    ip: 10
    domain: 8
    hash_sha256: 7
  by_confidence:
    high: 5
    medium: 15
    low: 5
  unique_ips: 10
  unique_domains: 8
  unique_hashes: 7
```

### Indicator Types

| Type | Description | Example |
|------|-------------|---------|
| `ip` | IPv4 address | 192.168.1.1 |
| `ipv6` | IPv6 address | 2001:db8::1 |
| `domain` | Domain name | malicious.com |
| `url` | Full URL | https://malicious.com/payload |
| `email` | Email address | attacker@malicious.com |
| `hash_md5` | MD5 hash | d41d8cd98f00b204e9800998ecf8427e |
| `hash_sha1` | SHA-1 hash | da39a3ee5e6b4b0d3255bfef95601890afd80709 |
| `hash_sha256` | SHA-256 hash | e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 |
| `file_path` | File system path | /tmp/malware.exe |
| `file_name` | File name | malware.exe |
| `registry_key` | Windows registry key | HKLM\Software\Malware |
| `mutex` | Mutex name | Global\MalwareMutex |
| `user_agent` | HTTP user agent | Mozilla/5.0 (Malware) |
| `certificate_hash` | Certificate fingerprint | SHA256 of cert |
| `asn` | Autonomous System Number | AS12345 |
| `cidr` | IP range in CIDR notation | 192.168.1.0/24 |

### Traffic Light Protocol (TLP)

| Classification | Sharing |
|----------------|---------|
| `TLP:CLEAR` | Unlimited sharing |
| `TLP:GREEN` | Community-wide sharing |
| `TLP:AMBER` | Limited sharing within organization |
| `TLP:AMBER+STRICT` | Limited sharing, need-to-know |
| `TLP:RED` | No sharing outside specific recipients |

---

## Compliance Requirements Schema

Standardized format for compliance controls and requirements.

**Schema ID:** `bmad://schemas/compliance-requirements/1.0`

### Structure

```yaml
# Metadata
metadata:
  project_id: "proj-001"
  created_by: "compliance-guardian"
  created_at: "2025-01-11T14:30:00Z"
  version: "1.0"
  status: "approved"
  review_date: "2025-07-11"

# Applicable frameworks
frameworks:
  - id: "GDPR"                    # Standard framework IDs
    name: "General Data Protection Regulation"
    version: "2016/679"
    applicability: "Processing EU citizen personal data"
    certification_required: false
    audit_frequency: "annual"

# Data classification
data_classification:
  categories:
    - name: "PII"
      description: "Personally Identifiable Information"
      sensitivity: "Confidential"
      examples:
        - "Names"
        - "Email addresses"
        - "Phone numbers"
      applicable_frameworks:
        - "GDPR"
        - "CCPA"
      retention_period: "7 years after last activity"
      deletion_requirements: "Secure deletion within 30 days of request"

# Controls
controls:
  - id: "C-001"
    framework: "GDPR"
    framework_control_id: "Art. 17"
    requirement: "Right to erasure (right to be forgotten)"
    description: "Data subjects can request deletion of personal data"
    applies_to:
      - "User data"
      - "Analytics data"
    priority: "Mandatory"         # Mandatory, Recommended, Optional
    control_type: "Technical"     # Technical, Administrative, Physical
    implementation_guidance: "Implement data deletion API..."
    evidence_needed: "Deletion logs, API documentation"
    testing_approach: "Submit deletion request, verify removal"
    implementation_status: "Implemented"
    story_reference: "STORY-123"
    verification_date: "2025-01-10"

# Notification requirements
notification_requirements:
  authorities:
    - framework: "GDPR"
      authority: "Supervisory Authority"
      deadline: "72 hours"
      method: "Official notification form"
      template_available: true
  data_subjects:
    - framework: "GDPR"
      requirement: "Notify affected individuals"
      deadline: "Without undue delay"
      exceptions:
        - "Data encrypted and key not compromised"
        - "Risk mitigated by subsequent measures"

# Audit requirements
audit_requirements:
  internal_audit:
    frequency: "quarterly"
    scope: "All data processing activities"
    responsible_team: "Compliance"
  external_audit:
    required: true
    frequency: "annual"
    auditor_requirements: "ISO 27001 certified auditor"
  evidence_retention: "7 years"

# Summary
summary:
  total_controls: 45
  by_priority:
    mandatory: 30
    recommended: 12
    optional: 3
  by_status:
    not_started: 5
    in_progress: 10
    implemented: 25
    verified: 5
  frameworks_count: 3
  next_audit_date: "2025-06-15"
```

### Supported Frameworks

| ID | Name |
|----|------|
| `GDPR` | General Data Protection Regulation (EU) |
| `HIPAA` | Health Insurance Portability and Accountability Act |
| `PCI-DSS` | Payment Card Industry Data Security Standard |
| `SOC2` | Service Organization Control 2 |
| `ISO27001` | Information Security Management System |
| `CCPA` | California Consumer Privacy Act |
| `SOX` | Sarbanes-Oxley Act |
| `NIST-CSF` | NIST Cybersecurity Framework |
| `FedRAMP` | Federal Risk and Authorization Management Program |

---

## Common Data Patterns

### Severity Levels

Used consistently across schemas:

| Level | Description | Action Required |
|-------|-------------|-----------------|
| `Critical` | Immediate risk | Immediate remediation |
| `High` | Significant risk | Priority remediation |
| `Medium` | Moderate risk | Planned remediation |
| `Low` | Minor risk | Address as resources allow |
| `Informational` | No immediate risk | Document and monitor |

### Status Values

| Status | Description |
|--------|-------------|
| `draft` | Initial creation, not reviewed |
| `review` | Under review |
| `approved` | Reviewed and approved |
| `superseded` | Replaced by newer version |
| `archived` | No longer active |

### Implementation Status

| Status | Description |
|--------|-------------|
| `NotStarted` | Work not yet begun |
| `InProgress` | Currently being implemented |
| `Complete` / `Implemented` | Implementation finished |
| `Verified` | Implementation tested and verified |
| `NotApplicable` | Does not apply to this context |

---

## Schema Validation

### Using JSON Schema Validation

Schemas are defined using JSON Schema Draft 2020-12 format and can be validated using standard tools.

```bash
# Example using ajv-cli
npx ajv validate -s _bmad/core/schemas/threat-model.schema.yaml -d my-threat-model.yaml

# Example using Python jsonschema
python -c "
import yaml
import jsonschema
schema = yaml.safe_load(open('_bmad/core/schemas/threat-model.schema.yaml'))
data = yaml.safe_load(open('my-threat-model.yaml'))
jsonschema.validate(data, schema)
"
```

### Schema ID Format

All BMAD schemas use the following ID format:

```
bmad://schemas/{schema-name}/{version}
```

Example: `bmad://schemas/threat-model/1.0`

---

## Cross-Module Data Flow

### Typical Flow Example

```
1. BMM (architect) creates architecture.md
   ↓
2. Cybersec-Team (threat-analyst) creates threat-model.yaml
   - derives_from: architecture.md
   ↓
3. BMM (dev) creates stories implementing mitigations
   - implements: threat-model.yaml (specific threats)
   ↓
4. Cybersec-Team (penetration-tester) validates controls
   - validates: threat-model.yaml
   ↓
5. Legal-Team (counsel) confirms compliance
   - validates: compliance-requirements.yaml
```

### Linking Artifacts

When creating artifacts, always include links to source and downstream artifacts:

```yaml
_bmad_metadata:
  source_workflow: "security-architecture-review"
  source_module: "cybersec-team"
  links:
    # Inputs
    - relation: "derives_from"
      target_artifact: "architecture.md"
      description: "Architecture document reviewed"
    # Outputs
    - relation: "informs"
      target_artifact: "threat-model.yaml"
      description: "Findings inform threat model"
```

---

## Related Documentation

- [CONFIGURATION-GUIDE.md](../UserGuide/CONFIGURATION-GUIDE.md) - Configuration file formats
- [DECISION-FRAMEWORKS.md](DECISION-FRAMEWORKS.md) - Cross-module decision templates
- [MODULES-OVERVIEW.md](../UserGuide/MODULES-OVERVIEW.md) - Module descriptions
- [WORKFLOWS-REFERENCE.md](../UserGuide/WORKFLOWS-REFERENCE.md) - Workflow reference
