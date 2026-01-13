# Testing Logs

This directory contains all testing artifacts, validation reports, and benchmark results for the BMAD-CYBERSEC framework.

## Directory Structure

```
TestingLogs/
├── validation/           # Framework validation logs by date
│   ├── 2026-01-11/       # Initial validation (modules, security, compliance)
│   └── 2026-01-12/       # Pre-publication validation
│
├── compliance/           # Compliance remediation plans and reports
│   └── 2026-01-12/       # BMAD framework compliance audit
│
├── workflow-tests/       # QA workflow test reports by module
│   ├── intel-team/
│   ├── cybersec-team/
│   ├── legal-team/
│   └── strategy-team/
│
├── benchmarks/           # LLM provider benchmark results
│   ├── strategy-team/    # Executive advisors benchmarks
│   │   ├── claude/
│   │   ├── ollama/
│   │   ├── lmstudio/
│   │   ├── lmstudio-gptoss/
│   │   └── lmstudio-qwen3vl/
│   │
│   └── intel-team/       # Intelligence agents benchmarks
│       ├── claude/
│       ├── ollama/
│       ├── lmstudio-gptoss/
│       ├── lmstudio-qwen3vl/
│       └── lmstudio-qwen32abl/
│
└── mock-data/            # Test mock data files by module
    ├── intel-team/
    ├── cybersec-team/
    ├── legal-team/
    └── strategy-team/
```

## Contents

### Validation Logs

Framework validation reports documenting module integrity, security rules, and compliance checks.

| Date | Files | Description |
|------|-------|-------------|
| 2026-01-11 | 9 files | Initial module validations, prompt injection tests, LLM provider isolation |
| 2026-01-12 | 3 files | Pre-publication validation, compliance report, command stub fixes |

### Compliance Reports

BMAD framework compliance audits and remediation plans.

| Report | Description |
|--------|-------------|
| bmad-framework-compliance-report | Full compliance audit results |
| compliance-remediation-plan | Issues identified and fixes planned |
| compliance-fix-execution-plan | Execution steps for compliance fixes |
| compliance-remediation-plan-step-file-modules | Step file module compliance |

### Workflow Tests

QA test reports for each module's workflows, including execution tests and workflow validation.

| Module | Reports |
|--------|---------|
| intel-team | Workflow test + Execution test |
| cybersec-team | Workflow test + Execution test |
| legal-team | Workflow test + Execution test |
| strategy-team | Workflow test + Execution test |

### Benchmarks

LLM provider performance benchmarks comparing Claude, Ollama, and LM Studio with various models.

| Module | Providers Tested | Key Reports |
|--------|------------------|-------------|
| strategy-team | Claude, Ollama, LM Studio (3 models) | BENCHMARK-REPORT-FINAL.md, StrategicMod-PerfMetrics.md |
| intel-team | Claude, Ollama, LM Studio (3 models) | IntelMod-BENCHMARK-REPORT.md, IntelMod-PerfMetrics.md |

### Mock Data

JSON test data files used for workflow and benchmark testing.

| Module | Files |
|--------|-------|
| intel-team | mock-test-data.json, intel-crisis-mock-data.json |
| cybersec-team | cybersec-mock-test-data.json |
| legal-team | legal-mock-test-data.json |
| strategy-team | strategy-mock-test-data.json, strategy-crisis-mock-*.json |

---

*Last updated: 2026-01-13*
