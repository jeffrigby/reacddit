# Test Mock Migration Guide

This guide helps migrate test files to use the new global mocks system, reducing duplication and improving test maintainability.

## Overview

Common mocks have been centralized in `/src/test/globalMocks.tsx` and are automatically imported via the test setup file. This eliminates the need to duplicate mock code across test files.

## Available Global Mocks

### React Router
```typescript
import { mockNavigate, mockUseLocation } from '@/test/globalMocks';

// Usage:
mockNavigate.mockClear(); // Reset between tests
mockUseLocation.mockReturnValue({ pathname: '/custom/path', ... });
```

### React Device Detect
```typescript
import { mockDeviceDetect } from '@/test/globalMocks';

// Usage:
mockDeviceDetect.isMobile = true; // Change device type
```

### Date-fns
```typescript
// Automatically mocked with sensible defaults
// formatDistanceToNow, format, parseISO, isValid
```

### Query String
```typescript
import { mockQueryString } from '@/test/globalMocks';

// Usage:
mockQueryString.parse.mockReturnValue({ q: 'search term' });
```

### Common Module
```typescript
import { mockHotkeyStatus } from '@/test/globalMocks';

// Usage:
mockHotkeyStatus.mockReturnValue(false); // Disable hotkeys
```

### Redux Actions
```typescript
import { mockSiteSettingsAction } from '@/test/globalMocks';

// Usage:
expect(mockSiteSettingsAction).toHaveBeenCalledWith({ view: 'condensed' });
```

## Migration Steps

### 1. Remove Local Mock Definitions

**Before:**
```typescript
// Mock React Router hooks
const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

// Mock react-device-detect
vi.mock('react-device-detect', () => ({
  isMobile: false,
}));

// Mock the common module
const mockHotkeyStatus = vi.fn();
vi.mock('@/common', () => ({
  hotkeyStatus: () => mockHotkeyStatus(),
}));
```

**After:**
```typescript
import {
  mockNavigate,
  mockUseLocation,
  mockHotkeyStatus,
} from '@/test/globalMocks';
```

### 2. Update Mock Usage

**Before:**
```typescript
beforeEach(() => {
  vi.clearAllMocks();
  mockHotkeyStatus.mockReturnValue(true);
  vi.mocked(queryString.parse).mockReturnValue({});
});
```

**After:**
```typescript
beforeEach(() => {
  // Global mocks are automatically reset
  // Add only test-specific setup here
});
```

### 3. Handle Test-Specific Mock Behavior

For test-specific mock behavior, update the global mock within your test:

```typescript
it('handles disabled hotkeys', () => {
  mockHotkeyStatus.mockReturnValue(false);
  // ... rest of test
});

it('handles mobile view', () => {
  mockDeviceDetect.isMobile = true;
  // ... rest of test
});
```

### 4. Clean Up Imports

Remove unused imports:
- Remove `vi` import if only used for mocking
- Remove direct mock library imports (e.g., `query-string`)

## Common Patterns

### Location Mocking
```typescript
const renderWithLocation = (pathname = '/') => {
  mockUseLocation.mockReturnValue({
    pathname,
    search: '',
    hash: '',
    state: null,
    key: 'test',
  });
  
  return renderWithProviders(<MyComponent />);
};
```

### Query String Mocking
```typescript
const renderWithQueryParams = (params = {}) => {
  mockQueryString.parse.mockReturnValue(params);
  return renderWithProviders(<MyComponent />);
};
```

### Combined Helper
```typescript
const renderComponent = (
  locationOverrides = {},
  queryParams = {},
  stateOverrides = {}
) => {
  mockUseLocation.mockReturnValue({
    pathname: '/',
    search: '',
    ...locationOverrides,
  });
  
  mockQueryString.parse.mockReturnValue(queryParams);
  
  return renderWithProviders(<MyComponent />, {
    preloadedState: stateOverrides,
  });
};
```

## Benefits

1. **Reduced Duplication**: No need to copy mock setup across files
2. **Consistency**: All tests use the same mock implementations
3. **Maintainability**: Update mocks in one place
4. **Auto-Reset**: Mocks automatically reset between tests
5. **Type Safety**: Centralized mocks maintain proper TypeScript types

## Troubleshooting

### Mock Not Working
- Ensure `/src/test/setup.ts` imports `./globalMocks`
- Check that you're importing from `@/test/globalMocks`
- Verify the mock is being used before the component imports

### Mock State Bleeding Between Tests
- Global mocks auto-reset via `beforeEach`
- For custom reset logic, use `resetAllGlobalMocks()`

### Need a New Global Mock
1. Add the mock to `/src/test/globalMocks.tsx`
2. Export any control functions needed
3. Add reset logic to `resetAllGlobalMocks()`
4. Document in this guide

## Example Migration

See `/src/components/header/Search.test.refactored.tsx` for a complete example of a migrated test file.