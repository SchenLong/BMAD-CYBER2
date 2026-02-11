# Attribution Chain

**Multi-source threat actor attribution**

## Overview

| Attribute | Value |
|-----------|-------|
| **Classification** | Threat Intelligence |
| **Duration** | 2-3 hours |
| **Steps** | 6 |
| **Primary Agent** | Dossier (Threat Actor Profiler) |
| **Supporting Agents** | Resolver, Probe, Shadow, Echo, Atlas |

## Purpose

Rigorous threat actor attribution using multiple intelligence sources:

- APT attribution
- Criminal actor identification
- Campaign attribution
- False flag detection

## Steps

1. **Indicator Collection** (Dossier) - IOC gathering, TTP documentation
2. **Infrastructure Attribution** (Resolver) - Domain/IP actor correlation
3. **Technical Attribution** (Probe) - Malware and tooling analysis
4. **Underground Attribution** (Shadow) - Dark web persona correlation
5. **SOCMINT Attribution** (Echo) - Social media actor correlation
6. **Attribution Synthesis** (Dossier) - Confidence assessment, final attribution

## Outputs

- Attribution assessment with confidence levels
- Diamond Model analysis
- MITRE ATT&CK mapping
- Alternative hypothesis analysis

## Usage

```
/intel-team:threat-actor-profiler
> Attribution Chain
```

See [workflow.md](workflow.md) for detailed step instructions.
