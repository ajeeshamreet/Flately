# Flately — Agent Catalog

28 agent configurations in `.antigravity/agents/` for different development tasks.

## Agent Roles

### Planning & Architecture

| Agent | Description | When to Use |
|-------|-------------|-------------|
| **planner** | Implementation planning specialist | Feature requests, complex changes, refactoring |
| **architect** | System design & scalability | New features, architectural decisions, technical debt |
| **chief-of-staff** | Communication triage (email/Slack/LINE) | Managing multi-channel communications |

### Code Quality

| Agent | Description | When to Use |
|-------|-------------|-------------|
| **code-reviewer** | General code review (quality, security) | After writing or modifying any code |
| **typescript-reviewer** | TypeScript-specific type safety & patterns | All TypeScript/JavaScript changes |
| **security-reviewer** | Security vulnerability scanning | Before merging changes to production |

### Language-Specific Reviewers

| Agent | Description |
|-------|-------------|
| **python-reviewer** | Python code quality |
| **go-reviewer** | Go code patterns |
| **rust-reviewer** | Rust ownership, lifetimes |
| **java-reviewer** | Java patterns & practices |
| **kotlin-reviewer** | Kotlin idioms |
| **cpp-reviewer** | C++ memory safety |
| **flutter-reviewer** | Flutter/Dart patterns |

### Build & Error Resolution

| Agent | Description | When to Use |
|-------|-------------|-------------|
| **build-error-resolver** | Generic build error fixing (minimal diffs) | Build failures, type errors |
| **go-build-resolver** | Go compilation errors | Go build failures |
| **rust-build-resolver** | Rust compilation errors | Rust build failures |
| **java-build-resolver** | Java/Maven/Gradle errors | Java build failures |
| **kotlin-build-resolver** | Kotlin compilation errors | Kotlin build failures |
| **cpp-build-resolver** | C++ compilation errors | C++ build failures |
| **pytorch-build-resolver** | PyTorch/CUDA errors | ML framework build issues |

### Testing & Maintenance

| Agent | Description | When to Use |
|-------|-------------|-------------|
| **e2e-runner** | End-to-end testing (Agent Browser / Playwright) | Testing critical user flows |
| **tdd-guide** | Test-driven development | Writing tests first |
| **doc-updater** | Documentation maintenance | Keeping docs in sync |
| **docs-lookup** | Documentation search & retrieval | Finding relevant docs |
| **refactor-cleaner** | Code cleanup & refactoring | Reducing tech debt |

### Utilities

| Agent | Description |
|-------|-------------|
| **harness-optimizer** | CI/CD harness optimization |
| **loop-operator** | Iterative task execution |

## Recommended Workflows

### New Feature Development
```
planner → architect → (implement) → code-reviewer → typescript-reviewer → e2e-runner
```

### Bug Fix
```
build-error-resolver → code-reviewer → e2e-runner
```

### Refactoring
```
architect → planner → refactor-cleaner → typescript-reviewer → e2e-runner
```
