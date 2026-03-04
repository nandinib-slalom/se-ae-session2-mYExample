# Testing Guidelines - Outfit Recommendation App

## Overview
These guidelines establish comprehensive testing practices for the weather-based outfit recommender application to ensure code quality, reliability, and maintainability.

## Testing Strategy

### Unit Tests
Use Jest to test individual functions and React components in isolation
- **Naming Convention**: `*.test.js` or `*.test.ts`
- **Backend Location**: `packages/backend/__tests__/` directory
- **Frontend Location**: `packages/frontend/src/__tests__/` directory
- **File Naming**: Match what they're testing (e.g., `app.test.js` for testing `app.js`)

### Integration Tests
Use Jest + Supertest to test backend API endpoints with real HTTP requests
- **Location**: `packages/backend/__tests__/integration/` directory
- **Naming Convention**: `*.test.js` or `*.test.ts`
- **File Naming**: Based on what they test (e.g., `outfit-api.test.js` for outfit API endpoints)

### End-to-End (E2E) Tests
Use Playwright to test complete UI workflows through browser automation
- **Location**: `tests/e2e/` directory
- **Naming Convention**: `*.spec.js` or `*.spec.ts`
- **File Naming**: Based on user journey (e.g., `outfit-workflow.spec.js`)

## Port Configuration
Always use environment variables with sensible defaults for port configuration
- **Backend**: `const PORT = process.env.PORT || 3030;`
- **Frontend**: React's default port is 3000, but can be overridden with `PORT` environment variable
- **CI/CD**: Allows dynamic port detection in deployment pipelines

## E2E Testing Requirements

### Browser Configuration
- **Single Browser**: Playwright tests must use one browser only
- **Recommendation**: Use Chromium for consistency across environments

### Architecture Pattern
- **Page Object Model (POM)**: Required for maintainability
- **Structure**: Separate page objects from test logic
- **Benefits**: Reduces code duplication and improves test readability

### Test Scope
- **Limit Coverage**: 5-8 critical user journeys maximum
- **Focus Areas**: Happy paths and key edge cases
- **Avoid**: Exhaustive coverage that slows development

## Test Isolation & Independence

### Data Management
- **Independent Tests**: Each test sets up its own data
- **No Dependencies**: Tests don't rely on other test results
- **Clean State**: Database reset between tests

### Setup & Teardown
- **Required Hooks**: All test suites need setup and teardown
- **Multiple Runs**: Tests must succeed on repeated execution
- **Resource Cleanup**: Proper cleanup of test data and connections

## Testing Best Practices

### Code Coverage
- **Minimum Threshold**: Aim for 80%+ coverage
- **Focus Areas**: Business logic and critical paths
- **Exceptions**: UI styling and generated code

### Test Maintenance
- **DRY Principle**: Avoid code duplication in tests
- **Descriptive Names**: Clear test names that explain behavior
- **Regular Updates**: Keep tests current with code changes

### CI/CD Integration
- **Automated Runs**: Tests run on every commit
- **Fast Feedback**: Quick failure detection
- **Parallel Execution**: Run tests in parallel when possible

## Feature Development Requirements

### Test-First Approach
- **New Features**: All new features require appropriate tests
- **Test Types**: Choose based on feature scope and complexity
- **Documentation**: Update test documentation as needed

### Code Review Standards
- **Test Coverage**: Review includes test coverage assessment
- **Test Quality**: Evaluate test effectiveness and maintainability
- **Integration**: Ensure tests integrate properly with CI/CD

## Testing Tools & Frameworks

### Backend Testing
- **Jest**: Primary testing framework
- **Supertest**: HTTP endpoint testing
- **better-sqlite3**: In-memory database for tests

### Frontend Testing
- **Jest**: Component and utility testing
- **React Testing Library**: Component behavior testing
- **MSW**: API mocking for isolated testing

### E2E Testing
- **Playwright**: Browser automation
- **Page Object Model**: Test organization pattern
- **Visual Testing**: Screenshot comparison for UI changes

## Performance Testing

### Load Testing
- **API Endpoints**: Test under expected load
- **Database Queries**: Monitor query performance
- **Response Times**: Ensure acceptable latency

### Memory Testing
- **Memory Leaks**: Monitor for memory issues
- **Resource Usage**: Track application resource consumption
- **Cleanup**: Verify proper resource cleanup

## Accessibility Testing

### Automated Checks
- **WCAG Compliance**: Automated accessibility testing
- **Color Contrast**: Verify readable text contrast
- **Keyboard Navigation**: Test keyboard-only usage

### Manual Testing
- **Screen Readers**: Test with assistive technologies
- **User Experience**: Manual verification of accessibility features
- **Cross-Device**: Test on various devices and screen sizes

## Continuous Improvement

### Test Metrics
- **Coverage Reports**: Regular coverage analysis
- **Failure Analysis**: Track and analyze test failures
- **Performance Trends**: Monitor test execution times

### Team Learning
- **Knowledge Sharing**: Regular test review sessions
- **Best Practices**: Update guidelines based on lessons learned
- **Tool Evaluation**: Regularly assess testing tools and frameworks