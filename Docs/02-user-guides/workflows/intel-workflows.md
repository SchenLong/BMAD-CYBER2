# Intel Team Workflows

Professional-grade intelligence operations workflows covering OSINT, HUMINT, SIGINT, threat intelligence, and field operations.

---

## Quick Start

```bash
# Quick 15-minute assessment
/intel-team:workflows:flash-assessment

# Full organizational intelligence campaign
/intel-team:workflows:operation-mosaic

# Start with the intelligence operations director
/intel-team:osint-lead
```

---

## Workflow Categories

### Rapid Response

| Workflow | Command | Steps | Duration | Output |
|----------|---------|-------|----------|--------|
| **Flash Assessment** | `/flash-assessment` | 3 | ~15 min | Quick triage report |

**Flash Assessment** provides rapid OSINT triage for time-critical requirements:

- Immediate OSINT hits and exposure identification
- First-look risk assessment
- Parallel collection across technical, social, dark web, and corporate sources
- Go/no-go decision support

**Input Requirements**:

- At least one target identifier (email, domain, username, phone, IP, or name + context)
- Optional: urgency level, scope limitations, priority concerns

**When to use**:

- Initial target assessment before deeper investigation
- Time-sensitive intelligence requirements
- Quick due diligence checks
- Incident response initial triage

---

### Individual Investigation

| Workflow | Command | Steps | Output |
|----------|---------|-------|--------|
| **Campaign Planner (Person)** | `/campaign-planner-person` | 5 | Full intelligence campaign plan |
| **Doppelganger Hunt** | `/doppelganger-hunt` | 4 | Identity verification report |
| **Digital Necromancy** | `/digital-necromancy` | 4 | Historical digital footprint |
| **Pattern of Life** | `/pattern-of-life` | 4 | Behavioral baseline analysis |

**Campaign Planner (Person)**
Systematic OSINT campaign planning for investigating individuals:

- Collection requirements definition
- Source identification and prioritization
- Operational security planning
- Timeline and resource allocation

**Doppelganger Hunt**
Identify fake accounts, sock puppets, bots, and impersonators:

- Multi-factor authenticity analysis
- Behavioral pattern analysis
- Identity verification techniques
- Coordinated inauthentic behavior detection

**Digital Necromancy**
Recover and reconstruct deleted or hidden digital presence:

- Historical digital footprint recovery
- Timeline reconstruction
- Archive mining and wayback analysis
- Deleted content recovery techniques

**Pattern of Life**
Behavioral analysis and prediction through multi-source pattern analysis:

- Temporal pattern identification
- Spatial behavior mapping
- Behavioral baseline development
- Predictive analysis

---

### Organization Investigation

| Workflow | Command | Steps | Output |
|----------|---------|-------|--------|
| **Campaign Planner (Org)** | `/campaign-planner-org` | 9 | Comprehensive campaign plan |
| **Operation Mosaic** | `/operation-mosaic` | 9 | Full-spectrum assessment |
| **Spider Web** | `/spider-web` | 4 | Network relationship map |

**Campaign Planner (Org)**
Comprehensive OSINT campaign planning for corporate, government, or organizational entities:

- Multi-vector collection planning
- Stakeholder mapping
- Organizational structure analysis
- Strategic intelligence requirements

**Operation Mosaic**
Full spectrum target package using all 11 agents in coordinated intelligence collection:

- Comprehensive organizational assessment
- Multi-INT coordination
- Unified intelligence product
- All-source fusion

**Spider Web**
Network mapping and expansion starting from a single node:

- Relationship mapping
- Affiliation analysis
- Connection discovery
- Network visualization

---

### Technical Intelligence

| Workflow | Command | Steps | Output |
|----------|---------|-------|--------|
| **Infrastructure Genealogy** | `/infrastructure-genealogy` | 5 | Infrastructure history report |
| **Signal Landscape** | `/signal-landscape` | 4 | SIGINT opportunity map |
| **Breach Archaeology** | `/breach-archaeology` | 4 | Exposure assessment |

**Infrastructure Genealogy**
Trace complete history of digital infrastructure:

- Ownership chain analysis
- Hosting migration tracking
- Connection discovery to other assets
- Threat correlation

**Signal Landscape**
SIGINT opportunity mapping:

- Target electronic footprint mapping
- Communications pattern analysis
- Collection opportunity identification
- Technical access points

**Breach Archaeology**
Comprehensive data exposure assessment:

- All breach sources analysis
- Timeline reconstruction
- Risk scoring
- Credential exposure mapping

---

### Threat Intelligence

| Workflow | Command | Steps | Output |
|----------|---------|-------|--------|
| **Attribution Chain** | `/attribution-chain` | 6 | Attribution report |
| **Threat Constellation** | `/threat-constellation` | 5 | Threat actor ecosystem map |

**Attribution Chain**
Build evidence-based attribution from indicators to actor identity:

- Multi-source evidence collection
- Systematic analysis chain
- Confidence assessment
- Attribution documentation

**Threat Constellation**
Map complete threat actor ecosystem:

- Relationship mapping
- Shared infrastructure identification
- Tool reuse analysis
- Evolution tracking over time

---

### Field Operations

| Workflow | Command | Steps | Output |
|----------|---------|-------|--------|
| **Ground Truth** | `/ground-truth` | 5 | Field operation prep package |
| **Counter-Intel Audit** | `/counter-intel-audit` | 6 | Vulnerability assessment |
| **Approach Vector** | `/approach-vector` | 4 | Target approach plan |

**Ground Truth**
Complete preparation for physical/field operations:

- Site reconnaissance planning
- Environmental assessment
- Cover story development
- Operational security protocols

**Counter-Intel Audit**
Turn intelligence capabilities inward to assess own exposure:

- Organizational vulnerability assessment
- Operational security gaps
- Information leakage identification
- Defensive recommendations

**Approach Vector**
HUMINT operation planning:

- Target vulnerability identification
- Social entry point mapping
- Physical access assessment
- Cover story development

---

### Intelligence Fusion

| Workflow | Command | Steps | Output |
|----------|---------|-------|--------|
| **The Synthesis** | `/the-synthesis` | 4 | Fused intelligence product |
| **Campaign AI** | `/campaign-ai` | 4 | AI-augmented analysis |

**The Synthesis**
Multi-source intelligence fusion:

- Correlation across all INTs
- Conflict resolution
- Confidence assessment
- Unified intelligence product

**Campaign AI**
OSINT campaign planning for AI systems, models, companies, and entities:

- AI-specific intelligence requirements
- Model and company analysis
- Technology assessment
- Risk identification

---

### Continuous Monitoring

| Workflow | Command | Steps | Output |
|----------|---------|-------|--------|
| **Tripwire** | `/tripwire` | 5 | Monitoring configuration |

**Tripwire**
Configure comprehensive monitoring with alerting:

- Target change detection
- Alerting threshold configuration
- Notification rule setup
- Continuous monitoring protocols

---

## Available Agents

The intel-team module includes 11 specialized agents:

| Agent | Codename | INT Discipline | Specialty |
|-------|----------|----------------|-----------|
| **osint-lead** | Vector | All-Source | Intelligence coordination, fusion |
| **domain-intel-specialist** | Resolver | TECHINT | DNS archaeology, infrastructure mapping |
| **social-media-analyst** | Echo | SOCMINT | Platform analysis, influence detection |
| **dark-web-analyst** | Shadow | DARKINT | Tor/I2P, cryptocurrency tracing |
| **technical-researcher** | Probe | TECHINT | Technology fingerprinting, API recon |
| **threat-actor-profiler** | Dossier | THREATINT | Adversary attribution, MITRE ATT&CK |
| **corporate-intel-specialist** | Proxy | CORPINT | Business registries, entity verification |
| **humint-specialist** | Viper | HUMINT | Elicitation, source recruitment |
| **geospatial-analyst** | Atlas | GEOINT | Imagery analysis, geolocation |
| **sigint-specialist** | Sigil | SIGINT | RF analysis, communications patterns |
| **field-operative** | Specter | FIELDINT | Surveillance, counter-surveillance |

---

## Workflow Execution

### Parallel vs Sequential

Many intel workflows support **parallel agent execution**:

- Flash Assessment dispatches 4 agents simultaneously for rapid collection
- Operation Mosaic coordinates all 11 agents for comprehensive coverage

### Collection Management

Workflows enforce:

- Source documentation and confidence levels
- Chain of custody for evidence
- Classification handling
- Operational security protocols

### Output Artifacts

Intelligence products include:

- Assessment reports with executive summaries
- Source-cited findings with confidence levels
- Visual relationship maps
- Actionable intelligence recommendations
- Monitoring configurations

---

## Common Use Cases

### Due Diligence Investigation

1. Start with **Flash Assessment** for quick triage
2. Follow up with **Campaign Planner (Person/Org)** based on target type
3. Use **Breach Archaeology** for exposure assessment
4. Apply **Pattern of Life** for behavioral analysis

### Threat Actor Investigation

1. Begin with **Attribution Chain** for evidence-based attribution
2. Map the ecosystem with **Threat Constellation**
3. Track infrastructure with **Infrastructure Genealogy**

### Security Assessment

1. Run **Counter-Intel Audit** on your own organization
2. Identify exposure with **Breach Archaeology**
3. Configure ongoing monitoring with **Tripwire**

### Corporate Intelligence

1. Map organizational structure with **Spider Web**
2. Full assessment with **Operation Mosaic**
3. Detailed planning with **Campaign Planner (Org)**

---

## Operational Considerations

### Legal and Ethical

- All workflows operate within legal OSINT collection boundaries
- Users are responsible for ensuring authorization and jurisdiction compliance
- Workflows include operational security guidance

### Classification Handling

- Configurable classification levels
- Source protection protocols
- Secure output handling recommendations
