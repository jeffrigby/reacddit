# Test Refactoring Guide - Using Global Mocks

This guide shows how to refactor existing tests to use the global mocks that are already available in the codebase.

## Global Mocks Available

The following mocks are available globally via `@/test/globalMocks`:

```typescript
// React Router
export const mockNavigate = vi.fn();
export const mockUseLocation = vi.fn();

// React Device Detect
export const mockDeviceDetect = { isMobile: false };

// Query String
export const mockQueryString = {
  parse: vi.fn(),
  stringify: vi.fn(),
};

// Common Module
export const mockHotkeyStatus = vi.fn();

// Date-fns
export const mockFormatDistanceToNow = vi.fn();

// Redux Actions
export const mockListingsFetchRedditNew = vi.fn();
export const mockSubredditsFetchNewSubredditInfo = vi.fn();
// ... and more
```

## Test Files That Need Refactoring

### 1. **HeaderIntegration.test.tsx**
- Currently re-implements: React Router, React Device Detect, Query String, Common module
- Lines of duplicate mocks: ~40
- Action: Import from global mocks

### 2. **Reload.test.tsx**
- Currently re-implements: React Router, window.scrollTo
- Lines of duplicate mocks: ~15
- Action: Import from global mocks, use `mockWindowScrollTo()` from utils

### 3. **Search.test.tsx** (already has refactored example)
- Currently re-implements: React Router, Query String, Common module, React Device Detect
- Lines of duplicate mocks: ~30
- Action: See `Search.refactored.test.tsx` for example

### 4. **Sort.test.tsx**
- Currently re-implements: React Router, Common module
- Lines of duplicate mocks: ~20
- Action: Import from global mocks

### 5. **ViewMode.test.tsx**
- Currently re-implements: React Router DOM, Common module, window.scrollTo
- Lines of duplicate mocks: ~25
- Action: Import from global mocks

### 6. **NavigationItem.test.tsx** (already has refactored example)
- Currently re-implements: Query String, React Router DOM, date-fns
- Lines of duplicate mocks: ~30
- Action: See `NavigationItem.refactored.test.tsx` for example

### 7. **AutoRefresh.test.tsx**
- Currently re-implements: Common module, window.scrollTo
- Lines of duplicate mocks: ~15
- Action: Import from global mocks

## Refactoring Steps

### Step 1: Remove Local Mock Definitions

Replace this:
```typescript
// Mock React Router hooks
const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

// Mock query-string
vi.mock('query-string', () => ({
  default: {
    parse: vi.fn(),
    stringify: vi.fn(),
  },
  parse: vi.fn(),
  stringify: vi.fn(),
}));
```

### Step 2: Import from Global Mocks

With this:
```typescript
import {
  mockNavigate,
  mockUseLocation,
  mockQueryString,
  mockHotkeyStatus,
} from '@/test/globalMocks';
```

### Step 3: Update Mock Usage

Replace local mock references:
```typescript
// Before
vi.mocked(queryString.parse).mockReturnValue({ q: 'test' });

// After
mockQueryString.parse.mockReturnValue({ q: 'test' });
```

### Step 4: Use Test Utils for Common Patterns

For window.scrollTo:
```typescript
import { mockWindowScrollTo } from '@/test/utils';

// In test
const scrollMock = mockWindowScrollTo();
// ... test code
expect(scrollMock).toHaveBeenCalled();
```

## Benefits

1. **Reduced Code**: ~200+ lines of duplicate mock code removed
2. **Consistency**: All tests use the same mock implementations
3. **Maintainability**: Update mocks in one place
4. **Auto-reset**: Global mocks reset automatically between tests
5. **Type Safety**: TypeScript support for all mocks

## Example: Complete Refactoring

### Before (Search.test.tsx - partial)
```typescript
// 40+ lines of mock setup
const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));
// ... more mocks ...
```

### After (Search.refactored.test.tsx - partial)
```typescript
// 4 lines to import all needed mocks
import {
  mockNavigate,
  mockUseLocation,
  mockQueryString,
  mockHotkeyStatus,
} from '@/test/globalMocks';
```

## Migration Priority

1. **High Priority** (most duplication):
   - HeaderIntegration.test.tsx
   - Search.test.tsx
   - NavigationItem.test.tsx

2. **Medium Priority**:
   - Sort.test.tsx
   - ViewMode.test.tsx
   - Reload.test.tsx

3. **Low Priority** (less duplication):
   - AutoRefresh.test.tsx
   - Other component tests

## Notes

- Global mocks are automatically imported via `src/test/setup.ts`
- Mocks are automatically reset before each test
- You can still override mock behavior per test as needed
- The original test functionality remains unchanged