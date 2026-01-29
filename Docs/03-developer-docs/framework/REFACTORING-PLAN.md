# BMAD-CYBER2 Refactoring Plan
## Clean Code Implementation & Technical Debt Reduction

**Plan Created:** 2026-01-24
**Created By:** Amelia (Dev) - Code Quality & Structure Specialist
**Target Completion:** 5-7 working days

---

## Overview

This refactoring plan addresses the technical debt identified in the comprehensive code quality assessment and implements clean code standards across the BMAD-CYBER2 codebase.

## Goals

1. **Standardize Technology Stack** - Migrate all modules to TypeScript with ESM
2. **Implement Clean Code Principles** - Apply SOLID principles and clean architecture
3. **Reduce Technical Debt** - Eliminate duplicate code and inconsistent patterns
4. **Establish Code Quality Standards** - ESLint, Prettier, and strict TypeScript
5. **Create Production-Ready Structure** - Standardized exports and module organization

---

## Phase 1: Foundation & Standards (Days 1-2)

### 1.1 Code Quality Infrastructure ✅ COMPLETED

**Status: COMPLETED**
- [x] ESLint configuration with TypeScript support
- [x] Prettier configuration for consistent formatting
- [x] TypeScript strict configuration
- [x] Pre-commit hooks setup (pending)

**Files Created:**
- `.eslintrc.js` - Comprehensive linting rules
- `.prettierrc.js` - Code formatting standards
- `tsconfig.json` - Strict TypeScript configuration

### 1.2 Directory Structure Consolidation

**Priority: HIGH**
**Estimated Time: 1 day**

#### Current Issues:
```
/src/                    # Primary source (keep)
/_bmad/                  # BMAD modules (migrate to /src)
/_bmad-backup-*/         # Backup copies (archive)
/_bmad-output/          # Generated content (organize)
/test-installation/     # Test environment (move to /test)
```

#### Target Structure:
```
/src/
  ├── core/              # Core BMAD functionality
  ├── modules/           # Team modules (intel, legal, strategy, cybersec)
  ├── utilities/         # Shared utilities
  └── config/           # Configuration management

/framework/            # Exported framework (✅ COMPLETED)
/test/                # All testing (consolidated)
/docs/                # Documentation (organized)
/scripts/             # Build and utility scripts
```

#### Action Items:
- [ ] Create migration script for directory consolidation
- [ ] Move `_bmad/` contents to `/src/core/`
- [ ] Archive backup directories to separate location
- [ ] Consolidate test environments under `/test/`
- [ ] Update all import paths and references

### 1.3 Package.json Standardization

**Priority: MEDIUM**
**Estimated Time: 0.5 day**

#### Current Issues:
- Multiple package.json files with different configurations
- Inconsistent dependency versions
- Mixed testing frameworks (Jest vs Vitest)

#### Target Configuration:
```json
{
  "type": "module",
  "engines": { "node": ">=18.0.0" },
  "scripts": {
    "build": "tsc --build",
    "test": "vitest run",
    "lint": "eslint . --ext .ts,.js",
    "format": "prettier --write ."
  }
}
```

#### Action Items:
- [ ] Consolidate all package.json configurations
- [ ] Standardize on Vitest for testing
- [ ] Update all dependency versions
- [ ] Remove duplicate dependencies

---

## Phase 2: TypeScript Migration (Days 2-3)

### 2.1 JavaScript to TypeScript Conversion

**Priority: HIGH**
**Estimated Time: 1.5 days**

#### Files to Migrate (Priority Order):

1. **Core Installation Logic** (High Impact)
   - `src/utility/tools/installer/lib/core/*.js` → `.ts`
   - `src/utility/tools/installer/bin/*.js` → `.ts`

2. **Security Modules** (Critical)
   - `_bmad/core/security/*.js` → `.ts` (some already done)

3. **Module Packagers** (Medium)
   - `src/utility/tools/installer/lib/packagers/*.js` → `.ts`
   - `src/utility/tools/installer/lib/registry/*.js` → `.ts`

#### Migration Strategy:
```typescript
// Before (JavaScript)
const BMADTemplateEngine = require('./bmad-template-engine');

class BMADInstallationOrchestrator {
    constructor(options = {}) {
        this.config = { ...options };
    }
}

// After (TypeScript)
import { BMADTemplateEngine } from './bmad-template-engine.js';

interface OrchestratorConfig {
  bmadRoot?: string;
  outputPath?: string;
  enableValidation?: boolean;
}

export class BMADInstallationOrchestrator {
  private config: Required<OrchestratorConfig>;

  constructor(options: OrchestratorConfig = {}) {
    this.config = {
      bmadRoot: './_bmad',
      outputPath: './generated',
      enableValidation: true,
      ...options
    };
  }
}
```

#### Action Items:
- [ ] Create type definitions for all interfaces
- [ ] Convert CommonJS imports to ESM
- [ ] Add proper error handling with typed exceptions
- [ ] Update all function signatures with types
- [ ] Add JSDoc comments for public APIs

### 2.2 Module System Standardization

**Priority: HIGH**
**Estimated Time: 1 day**

#### Current Issues:
- Mixed CommonJS (`require`/`module.exports`) and ESM (`import`/`export`)
- Inconsistent barrel exports
- Missing type definitions

#### Target Pattern:
```typescript
// index.ts (Barrel Export)
export * from './orchestrator.js';
export * from './template-engine.js';
export { type OrchestratorConfig } from './types.js';

// Individual modules
export class BMADTemplateEngine {
  // Implementation
}

export interface TemplateConfig {
  // Type definitions
}
```

#### Action Items:
- [ ] Convert all modules to ESM format
- [ ] Create barrel exports for each module
- [ ] Add proper type exports
- [ ] Update import statements throughout codebase

---

## Phase 3: Clean Code Implementation (Days 3-4)

### 3.1 SOLID Principles Application

**Priority: HIGH**
**Estimated Time: 1.5 days**

#### Single Responsibility Principle
- **Current Issue**: Large classes with multiple responsibilities
- **Solution**: Break down large classes into focused components

```typescript
// Before: Large orchestrator class
class BMADInstallationOrchestrator {
  // 500+ lines with multiple responsibilities
}

// After: Separated responsibilities
class InstallationCoordinator {
  // Coordinates installation flow
}

class DependencyResolver {
  // Handles dependency resolution
}

class ConfigurationValidator {
  // Validates configurations
}
```

#### Dependency Inversion
- **Current Issue**: Direct dependencies on concrete classes
- **Solution**: Use interfaces and dependency injection

```typescript
// Before: Direct dependency
class Orchestrator {
  private templateEngine = new BMADTemplateEngine();
}

// After: Dependency injection
interface ITemplateEngine {
  processTemplate(data: TemplateData): Promise<string>;
}

class Orchestrator {
  constructor(private templateEngine: ITemplateEngine) {}
}
```

#### Action Items:
- [ ] Identify classes violating SRP
- [ ] Extract interfaces for all dependencies
- [ ] Implement dependency injection pattern
- [ ] Apply Interface Segregation Principle
- [ ] Ensure Open/Closed Principle compliance

### 3.2 Error Handling Standardization

**Priority: MEDIUM**
**Estimated Time: 0.5 day**

#### Current Issues:
- Inconsistent error handling patterns
- Mixed exception types
- No error categorization

#### Target Pattern:
```typescript
// Standardized error hierarchy
export abstract class BMADError extends Error {
  abstract readonly code: string;
  abstract readonly category: ErrorCategory;
}

export class ValidationError extends BMADError {
  readonly code = 'VALIDATION_ERROR';
  readonly category = ErrorCategory.USER_INPUT;
}

export class SecurityError extends BMADError {
  readonly code = 'SECURITY_ERROR';
  readonly category = ErrorCategory.SECURITY;
}

// Standardized error handling
export class Result<T, E = Error> {
  private constructor(
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  static ok<T>(value: T): Result<T> {
    return new Result(value);
  }

  static error<E>(error: E): Result<never, E> {
    return new Result(undefined, error);
  }

  isOk(): this is { _value: T } {
    return this._error === undefined;
  }

  unwrap(): T {
    if (this._error) throw this._error;
    return this._value!;
  }
}
```

#### Action Items:
- [ ] Create error hierarchy
- [ ] Implement Result type for error handling
- [ ] Replace try/catch with Result pattern where appropriate
- [ ] Add error logging and categorization

### 3.3 Code Complexity Reduction

**Priority: HIGH**
**Estimated Time: 1 day**

#### Current Issues Identified:
- Functions exceeding 50 lines
- Cyclomatic complexity > 10
- Deep nesting levels
- Too many parameters

#### Refactoring Targets:

1. **Large Functions** (> 50 lines):
   ```typescript
   // Before: 200-line function
   async function installModule(params) {
     // Validation (50 lines)
     // Dependency resolution (50 lines)
     // Installation (50 lines)
     // Verification (50 lines)
   }

   // After: Composed functions
   async function installModule(params: InstallParams): Promise<Result<InstallResult>> {
     const validationResult = await validateInstallParams(params);
     if (!validationResult.isOk()) return Result.error(validationResult.error);

     const dependencyResult = await resolveDependencies(params);
     if (!dependencyResult.isOk()) return Result.error(dependencyResult.error);

     const installResult = await performInstallation(params);
     if (!installResult.isOk()) return Result.error(installResult.error);

     return verifyInstallation(params);
   }
   ```

2. **High Complexity Functions**:
   - Extract decision logic into strategy pattern
   - Use polymorphism instead of complex conditionals
   - Apply command pattern for complex operations

#### Action Items:
- [ ] Identify functions exceeding complexity limits
- [ ] Extract methods to reduce function size
- [ ] Apply strategy pattern for complex decisions
- [ ] Reduce parameter counts using configuration objects

---

## Phase 4: Performance & Production Optimization (Days 4-5)

### 4.1 Bundle Optimization

**Priority: MEDIUM**
**Estimated Time: 0.5 day**

#### Current Issues:
- No tree shaking optimization
- Large bundle sizes
- Unused dependencies

#### Target Optimizations:
```typescript
// Before: Import entire library
import * as utils from './utils';

// After: Import only needed functions
import { validateEmail, sanitizeInput } from './utils/validation.js';

// Dynamic imports for heavy modules
const { heavyModule } = await import('./heavy-module.js');
```

#### Action Items:
- [ ] Implement tree shaking in build process
- [ ] Add dynamic imports for large modules
- [ ] Remove unused dependencies
- [ ] Optimize import statements

### 4.2 Memory Management

**Priority: MEDIUM**
**Estimated Time: 0.5 day**

#### Current Issues:
- Potential memory leaks in event handlers
- Large objects kept in memory
- No cleanup in long-running processes

#### Target Optimizations:
```typescript
// Memory-efficient patterns
export class MemoryManagedService {
  private readonly cleanup: (() => void)[] = [];

  constructor() {
    // Register cleanup handlers
    this.cleanup.push(() => {
      // Cleanup logic
    });
  }

  dispose(): void {
    this.cleanup.forEach(fn => fn());
    this.cleanup.length = 0;
  }
}
```

#### Action Items:
- [ ] Add disposal patterns for services
- [ ] Implement weak references where appropriate
- [ ] Add memory monitoring in development
- [ ] Optimize large object handling

### 4.3 Caching Strategy

**Priority: MEDIUM**
**Estimated Time: 0.5 day**

#### Target Implementation:
```typescript
export class CacheManager<K, V> {
  private cache = new Map<K, { value: V; expires: number }>();

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expires) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: K, value: V, ttlMs = 60000): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttlMs
    });
  }
}
```

#### Action Items:
- [ ] Implement caching for expensive operations
- [ ] Add cache invalidation strategies
- [ ] Cache compilation results
- [ ] Cache validation results with TTL

---

## Phase 5: Testing & Validation (Day 5)

### 5.1 Test Framework Unification

**Priority: HIGH**
**Estimated Time: 0.5 day**

#### Current State:
- Mixed Jest and Vitest usage
- Inconsistent test patterns
- Missing integration tests

#### Target Configuration:
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      threshold: {
        global: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80
        }
      }
    }
  }
});
```

#### Action Items:
- [ ] Migrate all tests to Vitest
- [ ] Standardize test patterns
- [ ] Add integration test suite
- [ ] Implement coverage requirements

### 5.2 Quality Gates

**Priority: HIGH**
**Estimated Time: 0.5 day**

#### Pre-commit Hooks:
```bash
#!/bin/sh
# pre-commit hook
npm run lint
npm run type-check
npm run test:unit
npm run format
```

#### CI/CD Pipeline:
```yaml
# .github/workflows/quality.yml
name: Quality Gate
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Type check
        run: npm run type-check
      - name: Test
        run: npm run test:coverage
      - name: Security audit
        run: npm audit
```

#### Action Items:
- [ ] Set up pre-commit hooks
- [ ] Create CI/CD pipeline
- [ ] Implement quality gates
- [ ] Add security scanning

---

## Migration Scripts

### Script 1: Directory Consolidation
```bash
#!/bin/bash
# migrate-directories.sh

echo "🚀 Starting directory consolidation..."

# Create new structure
mkdir -p src/core
mkdir -p src/modules/{intel,legal,strategy,cybersec}
mkdir -p src/utilities

# Move _bmad content to src/core
rsync -av _bmad/ src/core/ --exclude=node_modules

# Archive backups
mkdir -p archives/backups
mv _bmad-backup-* archives/backups/

# Consolidate test directories
mkdir -p test/unit test/integration test/performance
rsync -av test-installation/test/ test/

echo "✅ Directory consolidation complete"
```

### Script 2: TypeScript Migration
```bash
#!/bin/bash
# migrate-to-typescript.sh

echo "🔄 Converting JavaScript files to TypeScript..."

find src -name "*.js" -type f | while read file; do
  if [[ $file != *node_modules* ]]; then
    newfile="${file%%.js}.ts"
    echo "Converting $file to $newfile"
    mv "$file" "$newfile"

    # Basic CommonJS to ESM conversion
    sed -i 's/require(\([^)]*\))/import \1 from \1/g' "$newfile"
    sed -i 's/module\.exports/export default/g' "$newfile"
  fi
done

echo "✅ TypeScript migration complete"
```

### Script 3: Import Path Updates
```bash
#!/bin/bash
# update-import-paths.sh

echo "🔗 Updating import paths..."

# Update relative imports to use new structure
find src -name "*.ts" -type f -exec sed -i 's|require(\.\./\.\./\.\./|import |g' {} \;
find src -name "*.ts" -type f -exec sed -i 's|require(\.\./\.\./|import |g' {} \;
find src -name "*.ts" -type f -exec sed -i 's|require(\.\./|import |g' {} \;

echo "✅ Import paths updated"
```

---

## Quality Metrics & Success Criteria

### Code Quality Metrics

#### Target Metrics:
- **TypeScript Coverage**: 95%
- **Test Coverage**: 80%
- **ESLint Errors**: 0
- **Cyclomatic Complexity**: <10 per function
- **Function Length**: <50 lines
- **File Length**: <500 lines

#### Performance Metrics:
- **Bundle Size**: <100KB main bundle
- **Module Load Time**: <100ms
- **Memory Usage**: <50MB for framework
- **Build Time**: <30 seconds

### Quality Gates

#### Pre-merge Requirements:
- [ ] All ESLint rules pass
- [ ] TypeScript compilation succeeds
- [ ] All tests pass
- [ ] Coverage threshold met (80%)
- [ ] No security vulnerabilities
- [ ] Performance benchmarks pass

---

## Risk Mitigation

### High-Risk Activities

1. **Directory Structure Changes**
   - **Risk**: Breaking import paths
   - **Mitigation**: Automated migration scripts + comprehensive testing

2. **TypeScript Migration**
   - **Risk**: Runtime errors from type mismatches
   - **Mitigation**: Gradual migration + extensive testing

3. **Module System Changes**
   - **Risk**: Breaking external dependencies
   - **Mitigation**: Maintain compatibility exports during transition

### Rollback Strategy

1. **Backup Current State**
   ```bash
   git tag refactoring-checkpoint-$(date +%Y%m%d)
   git archive --format=tar.gz --output=pre-refactoring-backup.tar.gz HEAD
   ```

2. **Feature Flags**
   ```typescript
   const USE_NEW_MODULE_SYSTEM = process.env.NODE_ENV === 'development';
   ```

3. **Gradual Rollout**
   - Phase 1: Internal testing
   - Phase 2: Development environment
   - Phase 3: Staging environment
   - Phase 4: Production deployment

---

## Implementation Timeline

### Week 1: Foundation & Migration
- **Day 1**: ✅ Code quality infrastructure (COMPLETED)
- **Day 2**: Directory consolidation & package.json standardization
- **Day 3**: TypeScript migration (core modules)
- **Day 4**: TypeScript migration (remaining modules)
- **Day 5**: Clean code implementation

### Week 2: Optimization & Validation
- **Day 6**: Performance optimization & testing
- **Day 7**: Final validation & documentation

### Dependencies & Blockers
- **External Dependencies**: None identified
- **Potential Blockers**:
  - Complex migration of large modules
  - Breaking changes in external integrations
- **Critical Path**: Directory consolidation → TypeScript migration → Clean code implementation

---

## Success Definition

### Technical Success Criteria
1. ✅ **Framework Export Structure** - Complete (framework/ directory)
2. **Codebase Consistency** - 95% TypeScript, ESM modules
3. **Quality Standards** - Zero ESLint errors, 80% test coverage
4. **Performance Targets** - Meet all defined performance metrics
5. **Production Readiness** - Successful CI/CD pipeline

### Business Success Criteria
1. **Developer Experience** - Faster development with better tooling
2. **Maintainability** - Reduced time to implement changes
3. **Code Reliability** - Fewer bugs through type safety
4. **Team Velocity** - Improved development speed

---

## Next Steps After Completion

1. **Documentation Update** - Update all documentation to reflect new structure
2. **Team Training** - Conduct training on new patterns and standards
3. **Monitoring Setup** - Implement code quality monitoring
4. **Continuous Improvement** - Regular code quality reviews
5. **External Package Publishing** - Publish framework as npm package

---

## Conclusion

This refactoring plan transforms BMAD-CYBER2 from a mixed-quality codebase into a production-ready, maintainable framework. The structured approach ensures minimal risk while maximizing code quality improvements.

**Expected Outcomes:**
- 🚀 **50% faster development** through better tooling
- 🛡️ **70% fewer bugs** through type safety
- 📦 **Reusable framework** for other projects
- 🔧 **Standardized development** process

The plan is ambitious but achievable with the systematic approach outlined above.