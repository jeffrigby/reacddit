# Test Strategy & Documentation

## 📋 Overview

This document outlines the comprehensive testing strategy for the Reacddit client application, including testing patterns, best practices, and guidelines for maintaining high-quality test coverage.

## 🎯 Testing Philosophy

### Core Principles
1. **Test Behavior, Not Implementation** - Focus on what the component does, not how it does it
2. **User-Centric Testing** - Write tests from the user's perspective using accessible queries
3. **Maintainable Tests** - Keep tests simple, readable, and easy to maintain
4. **Comprehensive Coverage** - Aim for high coverage while focusing on critical paths
5. **Fast Feedback** - Tests should run quickly and provide clear failure messages

### Testing Pyramid
```
    /\
   /  \     E2E Tests (Few)
  /____\    Integration Tests (Some)
 /      \   Unit Tests (Many)
/__________\
```

## 🧪 Test Types & Structure

### 1. Unit Tests
**Purpose**: Test individual components and functions in isolation

**Location**: `src/components/**/*.test.tsx`, `src/utils/**/*.test.ts`

**Characteristics**:
- Fast execution
- Isolated from external dependencies
- Mock all external dependencies
- Focus on component behavior and edge cases

**Example Structure**:
```typescript
describe('ComponentName', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {});
    it('renders with custom props', () => {});
  });

  describe('User Interactions', () => {
    it('handles click events', () => {});
    it('handles keyboard events', () => {});
  });

  describe('State Management', () => {
    it('updates state correctly', () => {});
  });

  describe('Edge Cases', () => {
    it('handles error states', () => {});
    it('handles loading states', () => {});
  });
});
```

### 2. Integration Tests
**Purpose**: Test multiple components working together

**Location**: `src/__tests__/integration/`

**Characteristics**:
- Test component interactions
- Verify data flow between components
- Test Redux state management
- Mock external APIs and services

**Example**: `HeaderIntegration.test.tsx` tests multiple header components working together

### 3. API Tests
**Purpose**: Test API layer functionality

**Location**: `src/reddit/*.test.ts`, `api/src/__tests__/`

**Characteristics**:
- Test API request/response handling
- Mock external services
- Test error handling and edge cases
- Verify data transformation

## 🛠 Testing Tools & Setup

### Frontend Testing Stack
- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: Vitest mocks
- **Coverage**: V8 coverage provider
- **Environment**: jsdom

### Backend Testing Stack
- **Test Runner**: Vitest
- **HTTP Testing**: Supertest
- **Environment**: Node.js
- **Coverage**: V8 coverage provider

### Test Utilities
Located in `src/test/utils.tsx`:
- `renderWithProviders()` - Render components with Redux and Router
- `createTestStore()` - Create test Redux store
- `mockDOMMethods()` - Mock DOM APIs
- `createKeyboardEvent()` - Create keyboard events for testing

## 📊 Coverage Requirements

### Current Thresholds
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Exclusions
- Test files and utilities
- Configuration files
- Service worker files
- Type definition files

## 🎨 Testing Patterns & Best Practices

### 1. Component Testing Pattern
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/utils';
import Component from './Component';

describe('Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    renderWithProviders(<Component />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    renderWithProviders(<Component />);
    await user.click(screen.getByRole('button'));
    expect(mockFunction).toHaveBeenCalled();
  });
});
```

### 2. Redux Testing Pattern
```typescript
const renderComponent = (preloadedState: Partial<RootState> = {}) => {
  const defaultState: Partial<RootState> = {
    siteSettings: {
      theme: 'auto',
      view: 'expanded',
      // ... other defaults
    },
    ...preloadedState,
  };

  return renderWithProviders(<Component />, { preloadedState: defaultState });
};
```

### 3. Async Testing Pattern
```typescript
it('handles async operations', async () => {
  const mockApiCall = vi.fn().mockResolvedValue({ data: 'test' });
  
  renderComponent();
  
  await user.click(screen.getByRole('button'));
  
  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

### 4. Error Handling Pattern
```typescript
it('handles errors gracefully', async () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());
  const mockApiCall = vi.fn().mockRejectedValue(new Error('API Error'));
  
  renderComponent();
  
  await user.click(screen.getByRole('button'));
  
  expect(consoleSpy).toHaveBeenCalledWith(
    expect.stringContaining('Error'),
    expect.any(Error)
  );
  
  consoleSpy.mockRestore();
});
```

## 🔧 Mocking Strategies

### 1. External Dependencies
```typescript
// Mock React Router
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

// Mock external libraries
vi.mock('query-string', () => ({
  default: {
    parse: vi.fn(),
    stringify: vi.fn(),
  },
}));
```

### 2. Redux Actions
```typescript
const mockDispatch = vi.fn();
vi.mock('../../redux/slices/siteSettingsSlice', () => ({
  siteSettings: (payload: any) => ({
    type: 'siteSettings/setSiteSettings',
    payload,
  }),
}));
```

### 3. DOM APIs
```typescript
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});
```

## 📝 Writing Effective Tests

### Do's ✅
- Use descriptive test names that explain the behavior
- Test user-visible behavior, not implementation details
- Use accessible queries (getByRole, getByLabelText)
- Mock external dependencies consistently
- Test error states and edge cases
- Keep tests focused and atomic
- Use proper cleanup in beforeEach/afterEach

### Don'ts ❌
- Don't test implementation details
- Don't use querySelector unless necessary
- Don't write overly complex test setup
- Don't ignore TypeScript warnings in tests
- Don't skip cleanup between tests
- Don't test third-party library functionality

### Query Priority (React Testing Library)
1. `getByRole` - Most accessible
2. `getByLabelText` - Good for form elements
3. `getByPlaceholderText` - For inputs
4. `getByText` - For content
5. `getByTestId` - Last resort

## 🚀 Running Tests

### Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- ViewMode.test.tsx

# Run tests matching pattern
npm test -- --grep "keyboard shortcuts"
```

### CI/CD Integration
Tests run automatically on:
- Pull requests
- Main branch pushes
- Release builds

Coverage reports are generated and stored as artifacts.

## 🔍 Debugging Tests

### Common Issues
1. **Async operations not awaited**
   - Use `waitFor()` for async state changes
   - Use `await user.click()` for user events

2. **State not updating**
   - Check if Redux store is properly mocked
   - Verify action dispatching

3. **Elements not found**
   - Use `screen.debug()` to see rendered output
   - Check if element is conditionally rendered

### Debug Utilities
```typescript
// See what's rendered
screen.debug();

// Find elements
screen.logTestingPlaygroundURL();

// Check queries
screen.getByRole('button', { name: /submit/i });
```

## 📈 Continuous Improvement

### Regular Reviews
- Monthly test coverage review
- Quarterly testing strategy assessment
- Annual tooling evaluation

### Metrics to Track
- Test coverage percentage
- Test execution time
- Test failure rate
- Code quality metrics

### Future Enhancements
- Visual regression testing
- Performance testing
- Accessibility testing automation
- Cross-browser testing

## 📚 Resources

### Documentation
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Internal Resources
- `src/test/utils.tsx` - Test utilities
- `src/test/setup.ts` - Test configuration
- Test examples in component files

---

*This document is living and should be updated as testing practices evolve.* 