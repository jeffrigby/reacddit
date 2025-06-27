# Vitest Testing Guide for Reacddit

This guide provides comprehensive best practices and patterns for writing tests in the Reacddit project using Vitest and React Testing Library.

## Table of Contents
1. [Testing Philosophy](#testing-philosophy)
2. [Test File Structure](#test-file-structure)
3. [Component Testing Patterns](#component-testing-patterns)
4. [Redux Integration Testing](#redux-integration-testing)
5. [Mocking Strategies](#mocking-strategies)
6. [Async Testing](#async-testing)
7. [Accessibility Testing](#accessibility-testing)
8. [Performance Considerations](#performance-considerations)
9. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
10. [Vitest-Specific Best Practices](#vitest-specific-best-practices)

## Testing Philosophy

### Core Principles
1. **Test User Behavior, Not Implementation**: Focus on how users interact with components
2. **Integration Over Isolation**: Prefer testing components with their dependencies
3. **Maintainability First**: Write tests that are easy to understand and maintain
4. **Use Testing Library Queries**: Prioritize accessible queries that mirror how users find elements

### Query Priority (Most to Least Preferred)
1. `getByRole` - Queries by ARIA role
2. `getByLabelText` - For form elements
3. `getByPlaceholderText` - For inputs without labels
4. `getByText` - For non-interactive elements
5. `getByDisplayValue` - For form element values
6. `getByAltText` - For images
7. `getByTitle` - For title attributes
8. `getByTestId` - Last resort, avoid when possible

## Test File Structure

### Standard Test Organization
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RootState } from '@/types/redux';
import { renderWithProviders, createTestStore } from '@/test/utils';
import ComponentName from './ComponentName';

// Mock external dependencies
vi.mock('@/common', () => ({
  hotkeyStatus: vi.fn(),
}));

describe('ComponentName', () => {
  const user = userEvent.setup();
  
  // Helper function for consistent rendering
  const renderComponent = (
    props: Partial<ComponentProps> = {},
    preloadedState: Partial<RootState> = {}
  ) => {
    const defaultState: Partial<RootState> = {
      siteSettings: {
        theme: 'auto',
        view: 'expanded',
        stream: false,
        debugMode: false,
        autoRefresh: false,
      },
      ...preloadedState,
    };
    
    return renderWithProviders(
      <ComponentName {...props} />,
      { preloadedState: defaultState }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders with default props', () => {
      renderComponent();
      // assertions
    });

    it('renders with custom props', () => {
      renderComponent({ customProp: 'value' });
      // assertions
    });
  });

  describe('User Interactions', () => {
    it('handles click events', async () => {
      renderComponent();
      
      const button = screen.getByRole('button', { name: /click me/i });
      await user.click(button);
      
      // assertions
    });

    it('handles keyboard navigation', async () => {
      renderComponent();
      
      const element = screen.getByRole('textbox');
      element.focus();
      await user.keyboard('{ArrowDown}');
      
      // assertions
    });
  });

  describe('State Management', () => {
    it('updates Redux state correctly', () => {
      const store = createTestStore();
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      
      renderWithProviders(<ComponentName />, { store });
      
      // trigger state change
      // assertions on dispatchSpy
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderComponent();
      
      const element = screen.getByRole('button');
      expect(element).toHaveAttribute('aria-label', 'Expected Label');
    });

    it('supports keyboard navigation', async () => {
      renderComponent();
      
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('handles error states', () => {
      renderComponent({}, {
        someState: { error: 'Error message' }
      });
      
      expect(screen.getByText(/error message/i)).toBeInTheDocument();
    });

    it('handles loading states', () => {
      renderComponent({}, {
        someState: { loading: true }
      });
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});
```

## Component Testing Patterns

### Testing Redux-Connected Components
```typescript
describe('Redux-Connected Component', () => {
  it('dispatches actions correctly', () => {
    const store = createTestStore({
      siteSettings: { theme: 'light' }
    });
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    
    renderWithProviders(<ThemeToggle />, { store });
    
    const button = screen.getByRole('button', { name: /dark mode/i });
    fireEvent.click(button);
    
    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'siteSettings/setSiteSettings',
      payload: { theme: 'dark' }
    });
  });
});
```

### Testing Components with Router
```typescript
describe('Component with Router', () => {
  const mockNavigate = vi.fn();
  
  beforeEach(() => {
    vi.mock('react-router-dom', async (importOriginal) => {
      const actual = await importOriginal<typeof import('react-router-dom')>();
      return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({
          pathname: '/test',
          search: '',
          state: null,
          key: 'test-key',
          hash: '',
        }),
      };
    });
  });

  it('navigates on click', async () => {
    renderWithProviders(<NavigationComponent />);
    
    const link = screen.getByRole('link', { name: /go to page/i });
    await user.click(link);
    
    expect(mockNavigate).toHaveBeenCalledWith('/target-page');
  });
});
```

### Testing Form Components
```typescript
describe('Form Component', () => {
  it('handles form submission', async () => {
    const onSubmit = vi.fn();
    renderComponent({ onSubmit });
    
    const input = screen.getByRole('textbox', { name: /username/i });
    const submitButton = screen.getByRole('button', { name: /submit/i });
    
    await user.type(input, 'testuser');
    await user.click(submitButton);
    
    expect(onSubmit).toHaveBeenCalledWith({
      username: 'testuser'
    });
  });

  it('validates input', async () => {
    renderComponent();
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
  });
});
```

## Redux Integration Testing

### Testing with Real Redux Store
```typescript
describe('Redux Integration', () => {
  it('updates multiple slices correctly', async () => {
    const store = createTestStore();
    
    renderWithProviders(<App />, { store });
    
    // Perform actions that update multiple slices
    const themeButton = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(themeButton);
    
    // Check state updates
    const state = store.getState();
    expect(state.siteSettings.theme).toBe('dark');
    expect(state.history.lastAction).toBe('theme_toggled');
  });
});
```

### Testing Async Redux Actions
```typescript
describe('Async Redux Actions', () => {
  it('handles async data fetching', async () => {
    const mockData = { posts: [{ id: 1, title: 'Test' }] };
    const mockFetch = vi.fn().mockResolvedValue(mockData);
    
    vi.mock('@/redux/actions/listings', () => ({
      fetchListings: () => mockFetch
    }));
    
    renderWithProviders(<ListingsComponent />);
    
    const loadButton = screen.getByRole('button', { name: /load posts/i });
    await user.click(loadButton);
    
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });
});
```

## Mocking Strategies

### Module Mocking with vi.hoisted
```typescript
// Use vi.hoisted for proper mock hoisting
const mocks = vi.hoisted(() => ({
  axiosGet: vi.fn(),
  axiosPost: vi.fn(),
  cookiesGet: vi.fn(),
}));

vi.mock('axios', async (importActual) => {
  const actual = await importActual<typeof import('axios')>();
  return {
    default: {
      ...actual.default,
      get: mocks.axiosGet,
      post: mocks.axiosPost,
    },
  };
});
```

### Mocking React Hooks
```typescript
// Mock custom hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '123', name: 'Test User' },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));
```

### Mocking Window APIs
```typescript
describe('Window API Mocking', () => {
  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000',
        reload: vi.fn(),
      },
      writable: true,
    });

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
      writable: true,
    });
  });
});
```

## Async Testing

### Testing with waitFor
```typescript
it('waits for async operations', async () => {
  renderComponent();
  
  const button = screen.getByRole('button', { name: /load data/i });
  await user.click(button);
  
  // Wait for async operation to complete
  await waitFor(() => {
    expect(screen.getByText(/data loaded/i)).toBeInTheDocument();
  }, {
    timeout: 3000, // Custom timeout if needed
  });
});
```

### Testing Loading States
```typescript
it('shows loading state during async operation', async () => {
  const mockFetch = vi.fn().mockImplementation(() => 
    new Promise(resolve => setTimeout(resolve, 100))
  );
  
  renderComponent({ onFetch: mockFetch });
  
  const button = screen.getByRole('button', { name: /fetch/i });
  await user.click(button);
  
  // Check loading state appears
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});
```

## Accessibility Testing

### Testing Keyboard Navigation
```typescript
describe('Keyboard Navigation', () => {
  it('supports full keyboard navigation', async () => {
    renderComponent();
    
    // Tab through elements
    await user.tab();
    expect(screen.getByRole('button', { name: /first/i })).toHaveFocus();
    
    await user.tab();
    expect(screen.getByRole('button', { name: /second/i })).toHaveFocus();
    
    // Activate with keyboard
    await user.keyboard('{Enter}');
    expect(mockAction).toHaveBeenCalled();
  });

  it('handles arrow key navigation', async () => {
    renderComponent();
    
    const list = screen.getByRole('list');
    list.focus();
    
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: /first item/i })).toHaveAttribute('aria-selected', 'true');
    
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: /second item/i })).toHaveAttribute('aria-selected', 'true');
  });
});
```

### Testing ARIA Attributes
```typescript
describe('ARIA Compliance', () => {
  it('has proper ARIA labels and descriptions', () => {
    renderComponent();
    
    const button = screen.getByRole('button', { name: /submit form/i });
    expect(button).toHaveAttribute('aria-label', 'Submit form');
    expect(button).toHaveAttribute('aria-describedby', 'submit-help-text');
    
    const helpText = screen.getByText(/click to submit the form/i);
    expect(helpText).toHaveAttribute('id', 'submit-help-text');
  });

  it('announces live regions correctly', async () => {
    renderComponent();
    
    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    
    // Trigger status update
    await user.click(screen.getByRole('button'));
    
    expect(statusRegion).toHaveTextContent('Operation completed');
  });
});
```

## Performance Considerations

### Optimizing Test Setup
```typescript
describe('Performance Optimized Tests', () => {
  // Create reusable test data
  const testData = {
    users: Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
    })),
  };

  // Reuse store instance when possible
  let store: ReturnType<typeof createTestStore>;
  
  beforeAll(() => {
    store = createTestStore({ data: testData });
  });

  it('renders large lists efficiently', () => {
    const { container } = renderWithProviders(<UserList />, { store });
    
    // Use container queries sparingly
    const items = container.querySelectorAll('[data-testid="user-item"]');
    expect(items).toHaveLength(100);
  });
});
```

### Avoiding Unnecessary Re-renders in Tests
```typescript
it('memoizes expensive computations', () => {
  const expensiveComputation = vi.fn();
  
  const { rerender } = renderComponent({
    onCompute: expensiveComputation,
    data: [1, 2, 3],
  });
  
  expect(expensiveComputation).toHaveBeenCalledTimes(1);
  
  // Re-render with same props
  rerender(<Component onCompute={expensiveComputation} data={[1, 2, 3]} />);
  
  // Should not recompute
  expect(expensiveComputation).toHaveBeenCalledTimes(1);
});
```

## Common Pitfalls & Solutions

### Pitfall 1: Not Cleaning Up Between Tests
```typescript
// ❌ Bad - No cleanup
describe('Component', () => {
  it('test 1', () => {
    vi.spyOn(console, 'log');
    // test code
  });
  
  it('test 2', () => {
    // console.log is still spied on!
  });
});

// ✅ Good - Proper cleanup
describe('Component', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('test 1', () => {
    vi.spyOn(console, 'log');
    // test code
  });
  
  it('test 2', () => {
    // console.log is restored
  });
});
```

### Pitfall 2: Testing Implementation Details
```typescript
// ❌ Bad - Testing implementation
it('calls setState', () => {
  const setStateSpy = vi.spyOn(React, 'useState');
  renderComponent();
  expect(setStateSpy).toHaveBeenCalled();
});

// ✅ Good - Testing behavior
it('updates displayed value', async () => {
  renderComponent();
  
  const input = screen.getByRole('textbox');
  await user.type(input, 'new value');
  
  expect(screen.getByText('new value')).toBeInTheDocument();
});
```

### Pitfall 3: Using Wrong Queries
```typescript
// ❌ Bad - Using test IDs unnecessarily
const button = screen.getByTestId('submit-button');

// ✅ Good - Using accessible queries
const button = screen.getByRole('button', { name: /submit/i });
```

### Pitfall 4: Not Waiting for Async Operations
```typescript
// ❌ Bad - Not waiting
it('loads data', () => {
  renderComponent();
  fireEvent.click(screen.getByRole('button'));
  // This will fail - data hasn't loaded yet!
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});

// ✅ Good - Properly waiting
it('loads data', async () => {
  renderComponent();
  await user.click(screen.getByRole('button'));
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

## Vitest-Specific Best Practices

### Using Vitest's Built-in Features
```typescript
// Use vi.fn() for mocks
const mockFn = vi.fn();

// Use vi.spyOn() for spying
const spy = vi.spyOn(object, 'method');

// Use vi.mocked() for type-safe mocks
const mockedFunction = vi.mocked(someFunction);

// Use test.concurrent for parallel tests
test.concurrent('parallel test 1', async () => {
  // test code
});

test.concurrent('parallel test 2', async () => {
  // test code
});
```

### Snapshot Testing
```typescript
it('renders complex UI correctly', () => {
  const { container } = renderComponent();
  
  // For inline snapshots
  expect(container.firstChild).toMatchInlineSnapshot(`
    <div class="component">
      <h1>Title</h1>
      <p>Content</p>
    </div>
  `);
  
  // For file snapshots
  expect(container.firstChild).toMatchSnapshot();
});
```

### Using test.each for Parameterized Tests
```typescript
describe('Parameterized Tests', () => {
  test.each([
    { input: 'hello', expected: 'HELLO' },
    { input: 'world', expected: 'WORLD' },
    { input: '123', expected: '123' },
  ])('transforms $input to $expected', ({ input, expected }) => {
    expect(transform(input)).toBe(expected);
  });
});
```

### Custom Matchers
```typescript
// In test/setup.ts
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Usage
it('generates random number within range', () => {
  const num = generateRandom();
  expect(num).toBeWithinRange(1, 10);
});
```

## Running and Debugging Tests

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- ForceRefresh.test.tsx

# Run tests matching pattern
npm test -- --grep "keyboard"

# Run tests with UI
npm run test:ui
```

### Debugging Tests
```typescript
// Debug specific elements
screen.debug(); // Shows entire DOM
screen.debug(element); // Shows specific element

// Get testing playground URL
screen.logTestingPlaygroundURL();

// Use console logs
console.log('State:', store.getState());

// Use Vitest's --inspect flag
// npm test -- --inspect
```

## Test Organization Best Practices

1. **Co-locate tests with components**: Keep `.test.tsx` files next to the components they test
2. **Use descriptive test names**: Test names should clearly describe what is being tested
3. **Group related tests**: Use `describe` blocks to organize related tests
4. **Keep tests focused**: Each test should verify one specific behavior
5. **Avoid test interdependence**: Tests should be able to run in any order
6. **Use helper functions**: Extract common setup into helper functions
7. **Mock at the right level**: Mock external dependencies, not internal implementation

## Conclusion

This guide covers the essential patterns and best practices for testing in the Reacddit project. Following these guidelines will help maintain a robust, maintainable test suite that provides confidence in the application's behavior while being easy to work with.

Remember:
- Test from the user's perspective
- Keep tests simple and focused
- Use the right tools for the job
- Maintain good test hygiene with proper setup and cleanup
- Continuously refactor tests as the application evolves

For more information, refer to:
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)