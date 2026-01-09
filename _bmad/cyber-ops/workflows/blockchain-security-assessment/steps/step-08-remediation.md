---

name: 'step-08-remediation'
description: 'Create remediation roadmap and final report'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/blockchain-security-assessment'

# File References

thisStepFile: '{workflow_path}/steps/step-08-remediation.md'
outputFile: '{output_folder}/security/blockchain-security-assessment-{project_name}.md'

---

# Step 8: Remediation Roadmap

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus on creating actionable remediation guidance
- This is the FINAL step - ensure comprehensive coverage
- Provide code examples where applicable

## STEP GOAL:

To create a prioritized remediation roadmap with specific fixes, code examples, and timeline recommendations.

## REMEDIATION SEQUENCE:

### 1. Priority Categorization

"Let's prioritize remediation:

**Priority Framework:**

| Priority | Timeframe | Criteria |
|----------|-----------|----------|
| P0 - Emergency | Before deployment | Critical findings, fund risk |
| P1 - Urgent | Within 1 week | High findings, exploitable |
| P2 - Standard | Within 1 month | Medium findings |
| P3 - Improvement | Within quarter | Low, informational |

Let's assign priorities to all findings."

### 2. Critical Finding Remediations

"Let's detail fixes for CRITICAL findings:

**For each critical finding:**
- Specific code changes required
- Testing requirements
- Deployment considerations
- Verification criteria

Which critical findings should we address first?"

### 3. Code Fix Examples

"Let's provide remediation code:

**Common Fix Patterns:**

**Reentrancy Fix:**
```solidity
// Before: Vulnerable
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);
    (bool success, ) = msg.sender.call{value: amount}("");
    balances[msg.sender] -= amount;
}

// After: Fixed with CEI pattern
function withdraw(uint256 amount) external nonReentrant {
    require(balances[msg.sender] >= amount);
    balances[msg.sender] -= amount;
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}
```

**Access Control Fix:**
```solidity
// Add proper access control
import "@openzeppelin/contracts/access/AccessControl.sol";

bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

function criticalFunction() external onlyRole(ADMIN_ROLE) {
    // Protected logic
}
```

Would you like specific code fixes for your findings?"

### 4. Deployment Recommendations

"Let's plan secure deployment:

**Pre-deployment Checklist:**
- [ ] All critical/high findings fixed
- [ ] Fixes reviewed by second auditor
- [ ] Comprehensive test coverage
- [ ] Testnet deployment verified
- [ ] Monitoring configured
- [ ] Incident response ready
- [ ] Bug bounty prepared

**Deployment Strategy:**
- Phased rollout recommended
- TVL caps for initial period
- Emergency pause mechanism ready

What's your deployment timeline?"

### 5. Ongoing Security

"Let's establish ongoing security practices:

**Recommended Practices:**

| Practice | Frequency | Tool/Process |
|----------|-----------|--------------|
| Dependency updates | Weekly | Dependabot |
| Re-audit | Major changes | External auditor |
| Bug bounty | Continuous | Immunefi/HackerOne |
| Monitoring | 24/7 | Forta/OpenZeppelin Defender |
| Incident drills | Quarterly | Tabletop exercises |

What security practices will you implement?"

### 6. Document Remediation Roadmap

Update Section 8 of {outputFile}:

```markdown
## 8. Remediation Roadmap

### 8.1 Priority Matrix

| Priority | Findings | Timeline |
|----------|----------|----------|
| P0 - Emergency | [List] | Before deployment |
| P1 - Urgent | [List] | Within 1 week |
| P2 - Standard | [List] | Within 1 month |
| P3 - Improvement | [List] | Within quarter |

### 8.2 Critical Finding Remediations

**C-01: [Finding Title]**

| Aspect | Detail |
|--------|--------|
| Current Issue | [Description] |
| Fix Required | [Specific fix] |
| Code Location | [Contract:Line] |
| Testing Required | [Test cases] |
| Verification | [How to verify fixed] |

**Code Fix:**
```solidity
// Remediation code
[Fixed code example]
```

### 8.3 High Finding Remediations

**H-01: [Finding Title]**
- **Fix:** [Specific remediation]
- **Code:** [If applicable]
- **Testing:** [Requirements]

### 8.4 Medium/Low Remediations

| ID | Fix Summary | Effort |
|----|-------------|--------|
| M-01 | [Fix] | [Low/Med/High] |
| L-01 | [Fix] | [Low/Med/High] |

### 8.5 Deployment Recommendations

**Pre-deployment Requirements:**
- [ ] All P0 findings fixed
- [ ] All P1 findings fixed or mitigated
- [ ] Test coverage >95%
- [ ] External re-audit of critical fixes

**Deployment Strategy:**
| Phase | Action | TVL Limit | Duration |
|-------|--------|-----------|----------|
| 1 | Initial launch | [Cap] | [Time] |
| 2 | Expand limits | [Cap] | [Time] |
| 3 | Full deployment | Uncapped | Ongoing |

### 8.6 Ongoing Security Recommendations

| Practice | Implementation | Owner |
|----------|----------------|-------|
| Bug Bounty | [Platform, Budget] | [Team] |
| Monitoring | [Tools] | [Team] |
| Re-audits | [Trigger criteria] | [Team] |
| Dependencies | [Update process] | [Team] |

### 8.7 Fix Verification Checklist

| Finding ID | Fixed | Tested | Reviewed | Deployed |
|------------|-------|--------|----------|----------|
| C-01 | ⬜ | ⬜ | ⬜ | ⬜ |
| H-01 | ⬜ | ⬜ | ⬜ | ⬜ |
```

### 7. Appendices

Update Section 9 of {outputFile}:

```markdown
## 9. Appendices

### Appendix A: Methodology

**Assessment Approach:**
- Manual code review
- Automated analysis (Slither, Mythril)
- Economic attack modeling
- Fuzzing (if applicable)

**Tools Used:**
- [List of tools]

### Appendix B: Scope

**Contracts Reviewed:**
| Contract | Commit Hash | LoC |
|----------|-------------|-----|
| [User data] | | |

### Appendix C: References

- OWASP Smart Contract Top 10
- SWC Registry
- Rekt Leaderboard
- [Protocol-specific references]

### Appendix D: Disclaimer

This assessment represents a point-in-time review. Blockchain security is an evolving field, and new vulnerabilities may be discovered. This report does not guarantee the security of the protocol.
```

### 8. Workflow Complete

"**Blockchain Security Assessment Complete!**

I've prepared your comprehensive security assessment including:

**Report Sections:**
1. Assessment Overview
2. Smart Contract Security Review
3. Access Control Analysis
4. Economic Security Assessment
5. DeFi-Specific Vulnerabilities
6. Infrastructure & Frontend Security
7. Findings Summary
8. Remediation Roadmap
9. Appendices

**Summary Statistics:**
- Total findings: [X]
- Critical/High requiring immediate action: [X]
- Overall risk rating: [Rating]

**Next Steps:**
1. Review and prioritize fixes
2. Implement P0/P1 remediations
3. Schedule re-audit for critical fixes
4. Set up monitoring and bug bounty

Your complete assessment is saved at:
`{outputFile}`

Would you like to review any section or export the report?"

## FINAL MENU

Display: **Assessment Complete - Select an Option:** [E] Export/Review Final Report [Q] Ask Questions [D] Done - Conclude Workflow

#### Menu Handling Logic:

- IF E: Display complete document sections or export guidance
- IF Q: Answer questions about any finding or recommendation
- IF D: Mark workflow complete, update frontmatter with `workflowComplete: true` and `stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]`

---

## CRITICAL STEP COMPLETION NOTE

This is the FINAL step. When user selects 'D' (Done):
1. Update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]`
2. Add `workflowComplete: true` to frontmatter
3. Add `completedDate: [current date]` to frontmatter
4. Congratulate user on completing the blockchain security assessment

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
