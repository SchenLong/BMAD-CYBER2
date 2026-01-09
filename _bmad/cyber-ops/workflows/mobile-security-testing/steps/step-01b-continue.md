---

name: 'step-01b-continue'
description: 'Handle continuation of existing mobile security testing'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/mobile-security-testing'

# File References

thisStepFile: '{workflow_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/security/mobile-security-testing-{project_name}.md'

---

# Step 1b: Continue Existing Assessment

## CONTINUATION SEQUENCE:

### 1. Parse Existing Document

Read {outputFile} and extract progress from frontmatter.

### 2. Display Progress Summary

"**Existing Mobile Security Test Found**

**App:** {project_name}
**Platform:** {platform}
**Status:** {status}
**Last Updated:** {last_updated}

**Steps Completed:** {stepsCompleted}

| Step | Description | Status |
|------|-------------|--------|
| 1 | Testing Initialization | ✅/⬜ |
| 2 | Static Analysis | ✅/⬜ |
| 3 | Dynamic Analysis | ✅/⬜ |
| 4 | Data Storage Security | ✅/⬜ |
| 5 | Network Security | ✅/⬜ |
| 6 | Authentication & Session | ✅/⬜ |
| 7 | Platform-Specific Issues | ✅/⬜ |
| 8 | Findings & Remediation | ✅/⬜ |

Would you like to continue from where you left off?"

## MENU

Display: **Select How to Continue:**
[C] Continue from last completed step
[J] Jump to specific step
[V] View current findings
[R] Restart testing (new document)

---

**Master Rule:** Maintain document integrity and user progress at all times.
