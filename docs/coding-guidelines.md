# Coding Guidelines

This document outlines the coding standards and best practices for the Outfit Recommendation App project. Following these guidelines ensures consistent, maintainable, and high-quality code across the entire codebase.

## General Principles

### Code Quality
- **DRY (Don't Repeat Yourself)**: Avoid code duplication. Extract common functionality into reusable functions, components, or utilities.
- **Single Responsibility**: Each function, class, or component should have one clear purpose.
- **KISS (Keep It Simple, Stupid)**: Write simple, straightforward code that is easy to understand and maintain.
- **YAGNI (You Aren't Gonna Need It)**: Don't implement features or abstractions until they're actually needed.

### Naming Conventions
- **Variables and Functions**: Use `camelCase` for variables, functions, and methods.
- **Classes and Types**: Use `PascalCase` for class names, interfaces, and type definitions.
- **Constants**: Use `UPPER_SNAKE_CASE` for constants.
- **Files**: Use `PascalCase` for React components (e.g., `WeatherCard.tsx`) and `kebab-case` for utility files (e.g., `api-client.ts`).
- **Descriptive Names**: Choose meaningful, descriptive names that clearly indicate purpose.

### Code Organization
- **Logical Grouping**: Group related code together. Keep functions that work together in the same file or module.
- **File Size**: Keep files under 300 lines when possible. Split large files into smaller, focused modules.
- **Directory Structure**: Organize files by feature or domain rather than by type.

## TypeScript Guidelines

### Type Safety
- **Explicit Types**: Use explicit type annotations for function parameters, return types, and complex variables.
- **Avoid `any`**: Minimize use of the `any` type. Use specific types or union types instead.
- **Interface vs Type**: Use `interface` for object shapes that may be extended, `type` for unions and primitives.
- **Optional Properties**: Use `?` for optional properties instead of union types with `undefined`.

### Import Organization
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import axios from 'axios';
import { format } from 'date-fns';

// 3. Local imports - absolute paths
import { WeatherData } from '../../types/weather';
import { formatTemperature } from '../../utils/temperature';

// 4. Relative imports (only when necessary)
import { Button } from './Button';
```

### Error Handling
- **Try-Catch Blocks**: Use try-catch for operations that may fail (API calls, file operations).
- **Custom Error Types**: Create specific error classes for different error scenarios.
- **Graceful Degradation**: Handle errors gracefully without crashing the application.

## React Guidelines

### Component Structure
- **Functional Components**: Prefer functional components with hooks over class components.
- **Custom Hooks**: Extract complex logic into custom hooks for reusability.
- **Props Interface**: Define clear interfaces for component props.
- **Default Props**: Use default parameters instead of `defaultProps`.

### State Management
- **Local State**: Use `useState` for component-specific state.
- **Lifting State**: Lift state up to the lowest common ancestor when multiple components need it.
- **Context**: Use React Context for global state that doesn't change frequently.
- **Avoid Over-State**: Only store state that directly affects rendering.

### Performance
- **Memoization**: Use `React.memo`, `useMemo`, and `useCallback` appropriately to prevent unnecessary re-renders.
- **Keys**: Always provide stable, unique keys for list items.
- **Lazy Loading**: Use `React.lazy` and `Suspense` for code splitting.

## Backend Guidelines

### API Design
- **RESTful Conventions**: Follow REST principles for API endpoints.
- **Consistent Response Format**: Use consistent JSON response structures.
- **Error Responses**: Return appropriate HTTP status codes with descriptive error messages.
- **Input Validation**: Validate all inputs on both client and server side.

### Database Operations
- **Prepared Statements**: Use parameterized queries to prevent SQL injection.
- **Connection Management**: Properly manage database connections and handle connection errors.
- **Migrations**: Use version-controlled database migrations for schema changes.

## Formatting and Style

### Code Formatting
- **Consistent Indentation**: Use 2 spaces for indentation (configured in Prettier).
- **Line Length**: Keep lines under 100 characters when possible.
- **Semicolons**: Always use semicolons.
- **Quotes**: Use single quotes for strings, double quotes for JSX attributes.

### Linting
- **ESLint**: Use ESLint to enforce code quality and style rules.
- **Prettier**: Use Prettier for automatic code formatting.
- **Pre-commit Hooks**: Run linters and formatters in pre-commit hooks.

### Comments
- **Purposeful Comments**: Write comments that explain why, not what.
- **JSDoc**: Use JSDoc comments for public APIs and complex functions.
- **TODO Comments**: Use TODO comments for temporary code that needs attention.

## Testing Guidelines

### Test Coverage
- **Unit Tests**: Test individual functions and components in isolation.
- **Integration Tests**: Test interactions between components and API endpoints.
- **E2E Tests**: Test complete user workflows through the browser.

### Test Structure
- **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification phases.
- **Descriptive Names**: Write test names that describe the expected behavior.
- **Mock External Dependencies**: Mock API calls, database operations, and external services.

## Best Practices

### Security
- **Input Sanitization**: Sanitize all user inputs to prevent XSS and injection attacks.
- **Authentication**: Implement proper authentication and authorization.
- **HTTPS**: Always use HTTPS in production.
- **Secrets Management**: Never commit secrets to version control.

### Performance
- **Bundle Analysis**: Regularly analyze bundle sizes and optimize imports.
- **Image Optimization**: Compress and optimize images for web delivery.
- **Caching**: Implement appropriate caching strategies for static assets and API responses.

### Accessibility
- **Semantic HTML**: Use semantic HTML elements appropriately.
- **ARIA Labels**: Provide ARIA labels for screen readers.
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible.
- **Color Contrast**: Maintain sufficient color contrast ratios.

### Documentation
- **README Files**: Keep README files up-to-date with setup and usage instructions.
- **Code Comments**: Document complex logic and business rules.
- **API Documentation**: Document API endpoints and their usage.

## Tools and Configuration

### Development Tools
- **TypeScript**: For type safety and better developer experience.
- **ESLint**: For code quality and consistency.
- **Prettier**: For automatic code formatting.
- **Husky**: For git hooks to run linters and tests.

### IDE Configuration
- **EditorConfig**: For consistent editor settings across different IDEs.
- **TypeScript Config**: Properly configured `tsconfig.json` for the project.
- **ESLint Config**: Project-specific ESLint rules.

## Code Review Process

### Pull Request Guidelines
- **Small Changes**: Keep pull requests focused on a single feature or fix.
- **Descriptive Titles**: Write clear, descriptive pull request titles.
- **Detailed Descriptions**: Explain what changes were made and why.

### Review Checklist
- [ ] Code follows the established coding guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No linting errors
- [ ] Performance impact is considered
- [ ] Security implications are addressed

By following these guidelines, we ensure that our codebase remains maintainable, scalable, and easy to work with for all contributors.