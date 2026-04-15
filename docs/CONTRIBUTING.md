# Contributing to Pasha Tracker

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/pasha-tracker.git`
3. Install dependencies: `npm install`
4. Copy environment file: `cp .env.example .env`
5. Start development: `npm run dev`

## Development Workflow

### Branch Naming

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages

Follow conventional commits:
```
feat: Add new tracing algorithm
fix: Resolve rate limiting issue
docs: Update API documentation
refactor: Improve Solana client performance
test: Add tests for bundle detection
```

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules (`npm run lint`)
- Format with Prettier
- Write meaningful variable names
- Add JSDoc comments for public functions

### Testing

All contributions must include tests:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- transaction-tracer.test.ts
```

### Pull Request Process

1. Update documentation for any changed functionality
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Submit PR with clear description

## Code Review Criteria

- Functionality works as described
- Tests cover new code
- Documentation is updated
- No security vulnerabilities
- Performance considerations addressed

## Security

- Never commit API keys or secrets
- Report security issues privately
- Follow secure coding practices
- Validate all inputs

## Questions?

Open an issue or join our Discord community.

Thank you for contributing!
