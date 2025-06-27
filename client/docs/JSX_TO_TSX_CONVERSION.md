# JSX to TSX Conversion Best Practices for Reacddit

## TypeScript Configuration
- Target: ES2023
- Strict mode enabled
- Module resolution: bundler
- React JSX transform (jsx: "react-jsx")
- Path aliases configured (@/, @/types/, @/redux/, etc.)

## Component Declaration
```typescript
// ✅ Use function declarations, NOT arrow functions
function ComponentName() {
  return <div>Content</div>;
}

// ❌ Avoid
const ComponentName = () => {
  return <div>Content</div>;
};

// ❌ Never use React.FC
const ComponentName: React.FC = () => {
  return <div>Content</div>;
};
```

## Props Definition
```typescript
// ✅ Use interfaces for props
interface ComponentNameProps {
  title: string;
  count: number;
  optional?: boolean;
  children?: React.ReactNode;
}

function ComponentName({ title, count, optional = false }: ComponentNameProps) {
  return <div>{title}</div>;
}

// ❌ Avoid inline type definitions
function ComponentName({ title }: { title: string }) {
  return <div>{title}</div>;
}
```

## Event Handlers
```typescript
// ✅ Properly typed event handlers
function MyComponent() {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.currentTarget.value);
  };
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // handle enter
    }
  };
  
  return (
    <div>
      <input onChange={handleChange} onKeyDown={handleKeyDown} />
      <button onClick={handleClick}>Click</button>
    </div>
  );
}

// ✅ For native DOM events (addEventListener)
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // handle event
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

## Redux Integration
```typescript
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/types/redux';

function MyComponent() {
  // ✅ Typed useSelector
  const data = useSelector((state: RootState) => state.slice.data);
  
  // ✅ Typed useDispatch
  const dispatch = useDispatch<AppDispatch>();
  
  return <div>{data}</div>;
}
```

## State Management
```typescript
// ✅ Type inference (preferred)
const [enabled, setEnabled] = useState(false);
const [count, setCount] = useState(0);

// ✅ Explicit types for complex state
type Status = 'idle' | 'loading' | 'success' | 'error';
const [status, setStatus] = useState<Status>('idle');

// ✅ Discriminated unions for complex objects
type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: LinkData[] }
  | { status: 'error'; error: Error };

const [requestState, setRequestState] = useState<RequestState>({ status: 'idle' });
```

## Refs
```typescript
// ✅ Typed refs
const inputRef = useRef<HTMLInputElement>(null);
const buttonRef = useRef<HTMLButtonElement>(null);
const divRef = useRef<HTMLDivElement>(null);

// ✅ Ref callbacks with explicit block bodies
<div ref={current => {
  instance = current;
}} />
```

## Context
```typescript
// ✅ Typed context
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ✅ Custom hook with runtime check
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

## Import Organization
```typescript
// 1. React imports
import { useState, useEffect, useRef } from 'react';

// 2. External libraries
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

// 3. Internal imports with @ alias
import { subredditActions } from '@/redux/actions/subreddits';
import type { RootState, AppDispatch } from '@/types/redux';
import type { LinkData, SubredditData } from '@/types/redditApi';

// 4. Relative imports
import { formatNumber } from './utils';
```

## Type Imports
```typescript
// ✅ Use 'import type' for type-only imports
import type { LinkData, CommentData } from '@/types/redditApi';
import type { RootState } from '@/types/redux';

// ✅ Combined imports when needed
import React, { type MouseEvent } from 'react';
```

## Custom Hooks
```typescript
// ✅ Custom hook pattern
function useCustomHook(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  
  const updateValue = (newValue: string) => {
    setValue(newValue);
  };
  
  return { value, updateValue };
}
```

## Children Props
```typescript
// ✅ Always explicitly define children when needed
interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

// ✅ For more restrictive children types
interface CardProps {
  children: React.ReactElement; // Only JSX elements
}
```

## Return Types
```typescript
// ✅ Let TypeScript infer return types for components
function MyComponent() {
  return <div>Content</div>;
}

// ✅ Explicit return types when needed
function renderItems(): React.ReactElement[] | null {
  if (!items) return null;
  return items.map(item => <Item key={item.id} {...item} />);
}
```

## Common Patterns

### Conditional Rendering
```typescript
// ✅ Logical && for simple conditions
{isLoading && <Spinner />}

// ✅ Ternary for either/or
{error ? <ErrorMessage error={error} /> : <Content />}

// ✅ Early returns
function Component({ data }: Props) {
  if (!data) return null;
  return <div>{data.title}</div>;
}
```

### Memoization
```typescript
// ✅ useMemo for expensive computations
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// ✅ useCallback for stable references
const handleSubmit = useCallback((data: FormData) => {
  dispatch(submitForm(data));
}, [dispatch]);
```

## Reddit API Types
```typescript
// ✅ Use types from @/types/redditApi
import type { LinkData, CommentData, SubredditData } from '@/types/redditApi';

// Example usage
interface PostProps {
  post: LinkData;
  onVote: (id: string, dir: -1 | 0 | 1) => void;
}
```

## File Naming & Organization
- Components: PascalCase.tsx (e.g., `Search.tsx`, `Settings.tsx`)
- Single component per file
- Test files alongside components: `ComponentName.test.tsx`
- Default export for components

## ESLint Compliance
Always run `npm run lint` after conversion to ensure:
- No unused imports
- Consistent formatting (Prettier)
- Type safety
- React hooks rules compliance

## Migration Checklist
1. [ ] Rename .js/.jsx to .tsx
2. [ ] Add Props interface
3. [ ] Type all event handlers
4. [ ] Type useState/useRef calls
5. [ ] Type Redux hooks (useSelector/useDispatch)
6. [ ] Use 'import type' for type-only imports
7. [ ] Remove PropTypes if present
8. [ ] Run `npm run lint` and fix issues
9. [ ] Verify no TypeScript errors