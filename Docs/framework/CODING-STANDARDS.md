# BMAD-CYBER2 Coding Standards & Conventions
## Production-Ready Development Guidelines

**Version:** 2.0.0
**Last Updated:** 2026-01-24
**Approved By:** Amelia (Dev) - Code Quality & Structure Specialist

---

## Table of Contents

1. [General Principles](#general-principles)
2. [TypeScript Standards](#typescript-standards)
3. [Code Organization](#code-organization)
4. [Error Handling](#error-handling)
5. [Testing Standards](#testing-standards)
6. [Documentation Requirements](#documentation-requirements)
7. [Performance Guidelines](#performance-guidelines)
8. [Security Practices](#security-practices)
9. [Code Review Process](#code-review-process)
10. [Examples](#examples)

---

## General Principles

### 1. SOLID Principles

#### Single Responsibility Principle (SRP)
- Each class/module should have one reason to change
- Break large classes into focused components
- Use composition over inheritance

```typescript
// ❌ BAD: Multiple responsibilities
class UserManager {
  validateUser(user: User): boolean { /* validation logic */ }
  saveUser(user: User): Promise<void> { /* persistence logic */ }
  sendWelcomeEmail(user: User): Promise<void> { /* email logic */ }
}

// ✅ GOOD: Separated responsibilities
class UserValidator {
  validate(user: User): ValidationResult { /* validation logic */ }
}

class UserRepository {
  save(user: User): Promise<void> { /* persistence logic */ }
}

class EmailService {
  sendWelcomeEmail(user: User): Promise<void> { /* email logic */ }
}
```

#### Open/Closed Principle (OCP)
- Open for extension, closed for modification
- Use interfaces and dependency injection

```typescript
// ✅ GOOD: Extensible through interfaces
interface INotificationService {
  send(message: string, recipient: string): Promise<void>;
}

class EmailNotificationService implements INotificationService {
  async send(message: string, recipient: string): Promise<void> {
    // Email implementation
  }
}

class SMSNotificationService implements INotificationService {
  async send(message: string, recipient: string): Promise<void> {
    // SMS implementation
  }
}
```

#### Liskov Substitution Principle (LSP)
- Subtypes must be substitutable for their base types
- Maintain behavioral contracts

#### Interface Segregation Principle (ISP)
- Many specific interfaces are better than one general-purpose interface
- Clients should not depend on interfaces they don't use

#### Dependency Inversion Principle (DIP)
- Depend on abstractions, not concretions
- Use dependency injection

### 2. Clean Code Principles

#### Meaningful Names
```typescript
// ❌ BAD
const d = new Date();
const u = users.filter(u => u.a);
function calc(x, y) { return x * 0.1 + y; }

// ✅ GOOD
const currentDate = new Date();
const activeUsers = users.filter(user => user.isActive);
function calculateTotalWithTax(subtotal: number, taxRate: number): number {
  return subtotal * taxRate + subtotal;
}
```

#### Small Functions
- Functions should be small (< 20 lines)
- Do one thing well
- Use descriptive names

```typescript
// ❌ BAD: Large function doing multiple things
function processUser(userData: any) {
  // 50+ lines of validation, transformation, saving, and notification
}

// ✅ GOOD: Small, focused functions
function validateUserData(userData: UserInput): ValidationResult {
  // 5-10 lines of validation
}

function transformUserData(userData: UserInput): User {
  // 5-10 lines of transformation
}

function saveUser(user: User): Promise<void> {
  // 5-10 lines of persistence
}
```

#### No Comments (Self-Documenting Code)
```typescript
// ❌ BAD: Comments explaining what
// Check if user is over 18
if (user.age >= 18) {
  // Allow access
  allowAccess = true;
}

// ✅ GOOD: Self-documenting code
if (user.isAdult()) {
  user.grantAccess();
}
```

---

## TypeScript Standards

### 1. Strict Mode Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 2. Type Definitions

#### Interface Design
```typescript
// ✅ GOOD: Well-defined interfaces
interface UserConfig {
  readonly id: string;
  name: string;
  email: string;
  roles: readonly Role[];
  preferences?: UserPreferences;
  metadata?: Record<string, unknown>;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: NotificationSettings;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}
```

#### Generic Types
```typescript
// ✅ GOOD: Reusable generic types
interface Result<T, E = Error> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: E;
}

interface Repository<T, K = string> {
  findById(id: K): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: K): Promise<boolean>;
}

class UserRepository implements Repository<User> {
  async findById(id: string): Promise<User | null> {
    // Implementation
  }

  async save(user: User): Promise<void> {
    // Implementation
  }

  async delete(id: string): Promise<boolean> {
    // Implementation
  }
}
```

#### Utility Types
```typescript
// ✅ GOOD: Leverage TypeScript utility types
type PartialUser = Partial<User>;
type RequiredUserConfig = Required<UserConfig>;
type UserEmail = Pick<User, 'email'>;
type UserWithoutId = Omit<User, 'id'>;

// Custom utility types
type NonNullable<T> = T extends null | undefined ? never : T;
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
```

### 3. Error Handling with Types

```typescript
// ✅ GOOD: Type-safe error handling
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, public readonly field: string) {
    super(message, 'VALIDATION_ERROR', { field });
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 'NOT_FOUND', { resource, id });
  }
}

// Result pattern for error handling
export async function createUser(userData: UserInput): Promise<Result<User, ValidationError>> {
  const validation = validateUserInput(userData);
  if (!validation.isValid) {
    return Result.error(new ValidationError(validation.message, validation.field));
  }

  const user = new User(userData);
  await userRepository.save(user);
  return Result.ok(user);
}
```

---

## Code Organization

### 1. Directory Structure

```
src/
├── core/                 # Core domain logic
│   ├── entities/         # Domain entities
│   ├── services/         # Domain services
│   ├── repositories/     # Repository interfaces
│   └── errors/           # Domain errors
├── infrastructure/       # Infrastructure layer
│   ├── database/         # Database implementations
│   ├── external/         # External service clients
│   └── logging/          # Logging implementations
├── application/          # Application layer
│   ├── use-cases/        # Application use cases
│   ├── dto/              # Data transfer objects
│   └── mappers/          # Entity/DTO mappers
├── interfaces/           # Interface layer
│   ├── http/             # HTTP controllers
│   ├── cli/              # CLI commands
│   └── events/           # Event handlers
└── shared/               # Shared utilities
    ├── types/            # Shared types
    ├── utils/            # Utility functions
    └── constants/        # Application constants
```

### 2. Barrel Exports

```typescript
// src/core/entities/index.ts
export { User } from './user.js';
export { Role } from './role.js';
export { Permission } from './permission.js';
export type { UserProps, RoleProps, PermissionProps } from './types.js';

// src/core/index.ts
export * from './entities/index.js';
export * from './services/index.js';
export * from './repositories/index.js';
export * from './errors/index.js';
```

### 3. Module Dependencies

```typescript
// ✅ GOOD: Clear dependency flow
// Domain layer (no dependencies)
class User {
  // Pure domain logic
}

// Application layer (depends on domain)
class UserService {
  constructor(private userRepository: IUserRepository) {}
}

// Infrastructure layer (implements domain interfaces)
class DatabaseUserRepository implements IUserRepository {
  // Database-specific implementation
}

// Interface layer (depends on application)
class UserController {
  constructor(private userService: UserService) {}
}
```

---

## Error Handling

### 1. Error Hierarchy

```typescript
// Base application error
export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;

  constructor(
    message: string,
    public readonly metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Domain errors
export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly httpStatus = 400;
}

export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  readonly httpStatus = 404;
}

export class UnauthorizedError extends AppError {
  readonly code = 'UNAUTHORIZED';
  readonly httpStatus = 401;
}

// Infrastructure errors
export class DatabaseError extends AppError {
  readonly code = 'DATABASE_ERROR';
  readonly httpStatus = 500;
}

export class ExternalServiceError extends AppError {
  readonly code = 'EXTERNAL_SERVICE_ERROR';
  readonly httpStatus = 502;
}
```

### 2. Result Pattern

```typescript
export class Result<T, E = AppError> {
  private constructor(
    private readonly _value?: T,
    private readonly _error?: E,
    private readonly _success: boolean = true
  ) {}

  static success<T>(value: T): Result<T, never> {
    return new Result(value, undefined, true);
  }

  static failure<E extends AppError>(error: E): Result<never, E> {
    return new Result(undefined, error, false);
  }

  get isSuccess(): boolean {
    return this._success;
  }

  get isFailure(): boolean {
    return !this._success;
  }

  get value(): T {
    if (this._error) {
      throw new Error('Cannot access value of failed result');
    }
    return this._value!;
  }

  get error(): E {
    if (!this._error) {
      throw new Error('Cannot access error of successful result');
    }
    return this._error;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return this.isSuccess
      ? Result.success(fn(this.value))
      : Result.failure(this.error);
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.isSuccess ? fn(this.value) : Result.failure(this.error);
  }

  mapError<F extends AppError>(fn: (error: E) => F): Result<T, F> {
    return this.isFailure
      ? Result.failure(fn(this.error))
      : Result.success(this.value);
  }

  match<U>(
    onSuccess: (value: T) => U,
    onFailure: (error: E) => U
  ): U {
    return this.isSuccess ? onSuccess(this.value) : onFailure(this.error);
  }
}
```

### 3. Error Handling in Async Operations

```typescript
// ✅ GOOD: Consistent async error handling
export async function getUserById(id: string): Promise<Result<User, NotFoundError | DatabaseError>> {
  try {
    const user = await userRepository.findById(id);
    if (!user) {
      return Result.failure(new NotFoundError('User', id));
    }
    return Result.success(user);
  } catch (error) {
    return Result.failure(new DatabaseError('Failed to fetch user', { id, originalError: error }));
  }
}

// Usage
const userResult = await getUserById('123');
userResult.match(
  user => console.log('User:', user.name),
  error => console.error('Error:', error.message)
);
```

---

## Testing Standards

### 1. Test Structure

```typescript
// user.service.test.ts
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { UserService } from './user.service.js';
import type { IUserRepository } from './user.repository.js';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: IUserRepository;

  beforeEach(() => {
    mockUserRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn()
    };
    userService = new UserService(mockUserRepository);
  });

  describe('createUser', () => {
    test('should create user successfully with valid data', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };
      vi.mocked(mockUserRepository.save).mockResolvedValue(undefined);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value.name).toBe('John Doe');
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'John Doe' })
      );
    });

    test('should fail when email is invalid', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'invalid-email'
      };

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });
});
```

### 2. Test Categories

#### Unit Tests
- Test individual functions/classes in isolation
- Mock all dependencies
- Focus on business logic

#### Integration Tests
- Test component interactions
- Use real implementations where possible
- Test error scenarios

#### End-to-End Tests
- Test complete user workflows
- Use real database and external services
- Test performance requirements

### 3. Testing Patterns

```typescript
// Test builders for complex objects
class UserTestBuilder {
  private userData: Partial<UserInput> = {
    name: 'Test User',
    email: 'test@example.com'
  };

  withName(name: string): this {
    this.userData.name = name;
    return this;
  }

  withEmail(email: string): this {
    this.userData.email = email;
    return this;
  }

  build(): UserInput {
    return this.userData as UserInput;
  }
}

// Usage in tests
const userData = new UserTestBuilder()
  .withName('John Doe')
  .withEmail('john@example.com')
  .build();
```

---

## Documentation Requirements

### 1. Code Documentation

```typescript
/**
 * Service for managing user operations
 *
 * Provides functionality for creating, updating, and managing users
 * within the BMAD system. Handles validation, persistence, and
 * business rule enforcement.
 *
 * @example
 * ```typescript
 * const userService = new UserService(userRepository);
 * const result = await userService.createUser({ name: 'John', email: 'john@example.com' });
 * if (result.isSuccess) {
 *   console.log('User created:', result.value.id);
 * }
 * ```
 */
export class UserService {
  /**
   * Creates a new user with validation
   *
   * @param userData - User data to create the user
   * @returns Promise resolving to Result with created user or error
   * @throws Never - Uses Result pattern instead of throwing
   *
   * @example
   * ```typescript
   * const result = await userService.createUser({
   *   name: 'Jane Doe',
   *   email: 'jane@example.com'
   * });
   * ```
   */
  async createUser(userData: UserInput): Promise<Result<User, ValidationError>> {
    // Implementation
  }
}
```

### 2. API Documentation

```typescript
/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user with validation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Validation error
 */
```

---

## Performance Guidelines

### 1. Async/Await Best Practices

```typescript
// ✅ GOOD: Parallel async operations
async function getUserData(userId: string): Promise<UserData> {
  const [user, preferences, activities] = await Promise.all([
    userRepository.findById(userId),
    preferencesRepository.findByUserId(userId),
    activityRepository.getRecentByUserId(userId)
  ]);

  return new UserData(user, preferences, activities);
}

// ❌ BAD: Sequential async operations
async function getUserDataSlow(userId: string): Promise<UserData> {
  const user = await userRepository.findById(userId);
  const preferences = await preferencesRepository.findByUserId(userId);
  const activities = await activityRepository.getRecentByUserId(userId);

  return new UserData(user, preferences, activities);
}
```

### 2. Memory Management

```typescript
// ✅ GOOD: Efficient data processing
async function processLargeDataset(data: AsyncIterable<Item>): Promise<ProcessResult> {
  const results = [];

  for await (const item of data) {
    const processed = await processItem(item);
    results.push(processed);

    // Prevent memory leaks in large datasets
    if (results.length % 1000 === 0) {
      await flushToStorage(results.splice(0, 1000));
    }
  }

  if (results.length > 0) {
    await flushToStorage(results);
  }

  return new ProcessResult();
}
```

### 3. Caching Strategies

```typescript
// ✅ GOOD: Simple LRU cache with TTL
export class CacheManager<K, V> {
  private cache = new Map<K, { value: V; expires: number }>();
  private readonly maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expires) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: K, value: V, ttlMs = 300000): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expires: Date.now() + ttlMs
    });
  }
}
```

---

## Security Practices

### 1. Input Validation

```typescript
// ✅ GOOD: Comprehensive input validation
import { z } from 'zod';

const UserInputSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().toLowerCase(),
  age: z.number().int().min(0).max(120),
  roles: z.array(z.enum(['user', 'admin', 'moderator'])).optional()
});

export function validateUserInput(input: unknown): Result<UserInput, ValidationError> {
  try {
    const validated = UserInputSchema.parse(input);
    return Result.success(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return Result.failure(new ValidationError(message));
    }
    return Result.failure(new ValidationError('Invalid input'));
  }
}
```

### 2. Sanitization

```typescript
// ✅ GOOD: Data sanitization
import DOMPurify from 'isomorphic-dompurify';
import { escape } from 'html-escaper';

export function sanitizeUserContent(content: string): string {
  // Remove HTML tags and scripts
  const cleaned = DOMPurify.sanitize(content, { USE_PROFILES: { html: true } });
  // Escape any remaining HTML entities
  return escape(cleaned);
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-z0-9.-]/gi, '_') // Replace invalid characters
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
}
```

### 3. Secrets Management

```typescript
// ✅ GOOD: Secure configuration management
export class ConfigManager {
  private static instance: ConfigManager;
  private config: Map<string, string> = new Map();

  private constructor() {
    this.loadConfig();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): void {
    // Load from environment variables only
    const requiredVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'API_KEY'
    ];

    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (!value) {
        throw new Error(`Required environment variable ${varName} is not set`);
      }
      this.config.set(varName, value);
    }
  }

  get(key: string): string {
    const value = this.config.get(key);
    if (!value) {
      throw new Error(`Configuration key ${key} not found`);
    }
    return value;
  }

  // Never log or expose secrets
  toJSON(): Record<string, string> {
    return Object.fromEntries(
      Array.from(this.config.entries()).map(([key, value]) => [
        key,
        key.includes('SECRET') || key.includes('PASSWORD') ? '[REDACTED]' : value
      ])
    );
  }
}
```

---

## Code Review Process

### 1. Review Checklist

#### Functionality
- [ ] Code implements requirements correctly
- [ ] Edge cases are handled
- [ ] Error conditions are properly managed
- [ ] Performance considerations are addressed

#### Code Quality
- [ ] Code follows established patterns
- [ ] Functions are small and focused
- [ ] Names are descriptive and clear
- [ ] No code duplication
- [ ] SOLID principles are followed

#### TypeScript
- [ ] Proper type annotations
- [ ] No `any` types (unless absolutely necessary)
- [ ] Interfaces are well-defined
- [ ] Generic types are used appropriately

#### Testing
- [ ] Adequate test coverage (>80%)
- [ ] Tests are meaningful and focused
- [ ] Edge cases are tested
- [ ] Integration tests for complex interactions

#### Security
- [ ] Input validation is implemented
- [ ] No hardcoded secrets
- [ ] Proper error handling (no information leakage)
- [ ] Authentication/authorization where needed

#### Documentation
- [ ] Public APIs are documented
- [ ] Complex logic is explained
- [ ] Examples are provided where helpful
- [ ] README is updated if needed

### 2. Review Guidelines

#### For Authors
1. **Self-review first** - Review your own code before requesting review
2. **Small PRs** - Keep changes focused and small (< 400 lines)
3. **Clear description** - Explain what and why, not just how
4. **Add tests** - Ensure your changes are tested
5. **Update docs** - Keep documentation current

#### For Reviewers
1. **Be constructive** - Suggest improvements, don't just criticize
2. **Focus on important issues** - Don't nitpick formatting (use automated tools)
3. **Ask questions** - If something is unclear, ask for clarification
4. **Consider alternatives** - Suggest different approaches when appropriate
5. **Approve when ready** - Don't block on minor issues

---

## Examples

### 1. Complete Feature Implementation

```typescript
// domain/entities/user.ts
export class User {
  constructor(
    public readonly id: UserId,
    public readonly email: Email,
    public readonly name: string,
    public readonly createdAt: Date
  ) {}

  static create(name: string, email: string): Result<User, ValidationError> {
    const emailResult = Email.create(email);
    if (emailResult.isFailure) {
      return Result.failure(emailResult.error);
    }

    return Result.success(new User(
      UserId.generate(),
      emailResult.value,
      name,
      new Date()
    ));
  }

  changeName(newName: string): Result<User, ValidationError> {
    if (!newName || newName.trim().length === 0) {
      return Result.failure(new ValidationError('Name cannot be empty'));
    }

    return Result.success(new User(
      this.id,
      this.email,
      newName.trim(),
      this.createdAt
    ));
  }
}

// application/use-cases/create-user.use-case.ts
export class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService
  ) {}

  async execute(command: CreateUserCommand): Promise<Result<User, ValidationError | DatabaseError>> {
    // Create user entity
    const userResult = User.create(command.name, command.email);
    if (userResult.isFailure) {
      return Result.failure(userResult.error);
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      return Result.failure(new ValidationError('User with this email already exists'));
    }

    // Save user
    const user = userResult.value;
    try {
      await this.userRepository.save(user);
    } catch (error) {
      return Result.failure(new DatabaseError('Failed to save user'));
    }

    // Send welcome email (async, don't wait)
    this.emailService.sendWelcomeEmail(user.email.value, user.name)
      .catch(error => console.error('Failed to send welcome email:', error));

    return Result.success(user);
  }
}

// interfaces/http/user.controller.ts
export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  async createUser(req: Request, res: Response): Promise<void> {
    const command = new CreateUserCommand(req.body.name, req.body.email);

    const result = await this.createUserUseCase.execute(command);

    result.match(
      user => res.status(201).json({
        id: user.id.value,
        name: user.name,
        email: user.email.value,
        createdAt: user.createdAt.toISOString()
      }),
      error => res.status(error.httpStatus).json({
        error: error.code,
        message: error.message
      })
    );
  }
}
```

---

## Enforcement

### 1. Automated Checks

#### Pre-commit Hooks
```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run linting
npm run lint
if [ $? -ne 0 ]; then
  echo "Linting failed. Please fix the issues before committing."
  exit 1
fi

# Run type checking
npm run type-check
if [ $? -ne 0 ]; then
  echo "Type checking failed. Please fix the issues before committing."
  exit 1
fi

# Run unit tests
npm run test:unit
if [ $? -ne 0 ]; then
  echo "Tests failed. Please fix the tests before committing."
  exit 1
fi
```

#### CI/CD Pipeline
```yaml
# .github/workflows/quality.yml
name: Code Quality
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
      - run: npm run build

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm audit
      - run: npm run security-scan
```

### 2. Metrics and Monitoring

#### Code Quality Metrics
- **Test Coverage**: Minimum 80%
- **Type Coverage**: Minimum 95%
- **Cyclomatic Complexity**: Maximum 10 per function
- **Function Length**: Maximum 20 lines
- **File Length**: Maximum 300 lines

#### Performance Metrics
- **Bundle Size**: Maximum 100KB (gzipped)
- **Build Time**: Maximum 60 seconds
- **Test Execution**: Maximum 30 seconds

---

This coding standards document serves as the definitive guide for all BMAD-CYBER2 development. It ensures consistency, maintainability, and production readiness across the entire codebase.