---

name: 'step-02-smart-contract-review'
description: 'Comprehensive smart contract security analysis'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/blockchain-security-assessment'

# File References

thisStepFile: '{workflow_path}/steps/step-02-smart-contract-review.md'
nextStepFile: '{workflow_path}/steps/step-03-access-control.md'
outputFile: '{output_folder}/security/blockchain-security-assessment-{project_name}.md'

---

# Step 2: Smart Contract Security Review

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus ONLY on smart contract code security
- FORBIDDEN to discuss economic attacks yet
- Review contract code systematically

## STEP GOAL:

To perform comprehensive smart contract security analysis covering common vulnerabilities, code quality, and Solidity/Vyper-specific issues.

## SMART CONTRACT REVIEW SEQUENCE:

### 1. Reentrancy Analysis

"Let's check for reentrancy vulnerabilities:

**Reentrancy Patterns to Check:**

| Pattern | Description | Status |
|---------|-------------|--------|
| Classic Reentrancy | External call before state change | ? |
| Cross-function | Reentrancy across multiple functions | ? |
| Cross-contract | Reentrancy via other contracts | ? |
| Read-only Reentrancy | View function manipulation | ? |

**Functions with External Calls:**
[Identify functions making external calls]

**Checks-Effects-Interactions Pattern:**
- Are state changes made before external calls?
- Is ReentrancyGuard used appropriately?

Do any functions make external calls? Let's analyze them."

### 2. Integer Overflow/Underflow

"Let's check arithmetic safety:

**Arithmetic Security:**

| Check | Solidity Version | Status |
|-------|------------------|--------|
| Compiler version | [Version] | [0.8+/Below] |
| SafeMath usage | Required <0.8 | ? |
| Unchecked blocks | Manual review needed | ? |

**For Solidity <0.8:**
- Is SafeMath used for all arithmetic?
- Any custom arithmetic operations?

**For Solidity >=0.8:**
- Any `unchecked` blocks to review?
- Intentional overflow/underflow?

What Solidity version are the contracts using?"

### 3. Access Control Vulnerabilities

"Let's review basic access control in contract code:

**Function Visibility:**

| Issue | Description | Status |
|-------|-------------|--------|
| Missing modifiers | Unprotected critical functions | ? |
| Public vs External | Incorrect visibility | ? |
| Internal exposure | Internal functions called externally | ? |

**Critical Functions to Check:**
- [ ] Fund withdrawal functions
- [ ] Ownership transfer
- [ ] Parameter updates
- [ ] Pause/unpause mechanisms
- [ ] Upgrade functions

Which functions handle critical operations?"

### 4. Input Validation

"Let's check input validation:

**Input Validation Checks:**

| Check | Description | Status |
|-------|-------------|--------|
| Zero address | Check for address(0) | ? |
| Zero amount | Validate non-zero values | ? |
| Array bounds | Length validation | ? |
| Overflow params | Large number handling | ? |

**Common Missing Validations:**
- `require(to != address(0))`
- `require(amount > 0)`
- `require(array.length <= MAX_LENGTH)`

Are inputs properly validated in critical functions?"

### 5. External Call Safety

"Let's review external call handling:

**External Call Security:**

| Check | Description | Status |
|-------|-------------|--------|
| Return value | Check call success | ? |
| Gas limits | Appropriate gas forwarding | ? |
| Untrusted contracts | Interaction safety | ? |
| Callback risks | Callback handling | ? |

**Low-level Calls:**
- Are return values of `.call()`, `.delegatecall()` checked?
- Is `transfer()` vs `call()` appropriate for the use case?

How does the contract interact with external contracts?"

### 6. State Management

"Let's review state management:

**State Security:**

| Issue | Description | Status |
|-------|-------------|--------|
| Uninitialized storage | Default value risks | ? |
| Storage collisions | Proxy/upgrade patterns | ? |
| Mapping defaults | Zero value assumptions | ? |
| State consistency | Atomic updates | ? |

**State Update Patterns:**
- Are state updates atomic?
- Any race conditions possible?
- Storage layout for upgradeable contracts?

How is critical state managed in the contracts?"

### 7. Gas Optimization & DoS

"Let's check for gas-related issues:

**Gas & DoS Vectors:**

| Issue | Description | Status |
|-------|-------------|--------|
| Unbounded loops | Arrays without limits | ? |
| Block gas limit | Operations exceeding limit | ? |
| Griefing | Attacker-induced failures | ? |
| Pull vs Push | Payment patterns | ? |

**Questions:**
- Any loops over dynamic arrays?
- Could an attacker force gas exhaustion?
- Are payments push or pull pattern?

Are there any loops or batch operations?"

### 8. Document Contract Review

Update Section 2 of {outputFile}:

```markdown
## 2. Smart Contract Security Review

### 2.1 Contracts Analyzed

| Contract | LoC | Complexity | Version |
|----------|-----|------------|---------|
| [User data] | | | |

### 2.2 Reentrancy Analysis

| Function | External Calls | Pattern | Risk |
|----------|----------------|---------|------|
| [User data] | | | |

**Reentrancy Guard Implementation:** [Present/Absent]
**CEI Pattern Followed:** [Yes/Partial/No]

### 2.3 Arithmetic Safety

**Solidity Version:** [Version]
**SafeMath:** [Required/Not Required]

| Finding | Location | Severity |
|---------|----------|----------|
| [User data] | | |

### 2.4 Access Control (Code Level)

| Function | Protection | Finding | Risk |
|----------|------------|---------|------|
| [User data] | | | |

### 2.5 Input Validation

| Function | Validation | Finding | Risk |
|----------|------------|---------|------|
| [User data] | | | |

### 2.6 External Call Safety

| Call Type | Location | Safe Pattern | Risk |
|-----------|----------|--------------|------|
| [User data] | | | |

### 2.7 State Management

| Issue | Location | Impact | Severity |
|-------|----------|--------|----------|
| [User data] | | | |

### 2.8 Gas & DoS Vectors

| Vector | Location | Exploitability | Severity |
|--------|----------|----------------|----------|
| [User data] | | | |

### 2.9 Contract Review Findings Summary

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]
**Informational:** [Count]
```

### 9. Confirmation and Next Step

"**Smart Contract Security Review Complete**

I've analyzed the smart contracts for:
- Reentrancy vulnerabilities
- Arithmetic safety
- Access control at code level
- Input validation
- External call handling
- State management issues
- Gas and DoS vectors

Next, we'll perform detailed access control and privilege analysis.

Ready to proceed to access control analysis?"

## MENU

Display: **Contract Review Complete - Select an Option:** [C] Continue to Access Control Analysis [R] Review/Revise Findings

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1, 2]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 2 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN contract review is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
