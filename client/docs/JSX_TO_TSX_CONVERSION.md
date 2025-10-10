# JSX to TSX Conversion Best Practices for Reacddit

## TypeScript Configuration
- Target: ES2023
- Strict mode enabled
- Module resolution: bundler
- React JSX transform (jsx: "react-jsx")
- Path aliases configured (@/, @/types/, @/redux/, etc.)

## Component Declaration
```typescript
// ✅ Use function declarations (recommended for clarity and hoisting)
function ComponentName() {
  return <div>Content</div>;
}

// ✅ Arrow functions are also acceptable (both are valid in 2025)
const ComponentName = () => {
  return <div>Content</div>;
};

// ❌ Avoid React.FC (not needed, adds unnecessary complexity)
// React.FC is not deprecated, but it's unnecessary
// With React 18+, it no longer includes children by default
// Function declarations provide clearer intent and better DX
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

// ❌ Avoid inline type definitions for complex props
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

## Redux Integration (Updated for 2025)
```typescript
// ✅ Create typed hooks using .withTypes() (Redux v9.1.0+)
// In src/redux/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/types/redux';

// Use the new .withTypes() method for better type inference
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// ✅ In components - use the pre-typed hooks
import { useAppSelector, useAppDispatch } from '@/redux/hooks';

function MyComponent() {
  // No need to type RootState - it's already inferred
  const data = useAppSelector((state) => state.slice.data);

  // Already knows about thunks and middleware
  const dispatch = useAppDispatch();

  return <div>{data}</div>;
}

// ❌ Avoid typing on every usage (old pattern)
const data = useSelector((state: RootState) => state.slice.data);
const dispatch = useDispatch<AppDispatch>();
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

// ✅ Type guards for narrowing
if (requestState.status === 'success') {
  // TypeScript knows requestState.data exists here
  console.log(requestState.data);
}
```

## Refs
```typescript
// ✅ Typed refs (standard pattern - preferred)
const inputRef = useRef<HTMLInputElement>(null);
const buttonRef = useRef<HTMLButtonElement>(null);
const divRef = useRef<HTMLDivElement>(null);

// Use in component
<input ref={inputRef} />

// Access with null check
if (inputRef.current) {
  inputRef.current.focus();
}

// ✅ Ref callbacks (for advanced cases only)
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
import { useNavigate } from 'react-router';

// 3. Redux imports (use pre-typed hooks)
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { subredditActions } from '@/redux/actions/subreddits';

// 4. Type imports
import type { LinkData, SubredditData } from '@/types/redditApi';

// 5. Relative imports
import { formatNumber } from './utils';
```

## Type Imports
```typescript
// ✅ Use 'import type' for type-only imports
import type { LinkData, CommentData } from '@/types/redditApi';
import type { RootState } from '@/types/redux';

// ✅ Inline type qualifiers (TypeScript 4.5+) when mixing types and values
import { type SomeType, someValue } from './module';

// ✅ Combined imports when needed
import React, { type MouseEvent } from 'react';
```

## Custom Hooks
```typescript
// ✅ Custom hook pattern with explicit return type
function useCustomHook(initialValue: string): { value: string; updateValue: (newValue: string) => void } {
  const [value, setValue] = useState(initialValue);

  const updateValue = (newValue: string) => {
    setValue(newValue);
  };

  return { value, updateValue };
}

// ✅ Or with type inference (preferred for simple cases)
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

interface StrictProps {
  children: React.ReactElement<{ id: string }>; // Specific element type
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

## React 19 New Features
```typescript
// ✅ use() hook for reading promises/context
import { use } from 'react';

interface User {
  name: string;
  email: string;
}

function Component({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  return <div>{user.name}</div>;
}

// ✅ useActionState for form handling
import { useActionState } from 'react';

type FormState = { message: string; success: boolean };

function FormComponent() {
  const [state, formAction] = useActionState(
    async (prevState: FormState, formData: FormData): Promise<FormState> => {
      // Handle form submission
      return { message: 'Submitted', success: true };
    },
    { message: '', success: false }
  );

  return <form action={formAction}>...</form>;
}

// ✅ useFormStatus for form state
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>Submit</button>;
}

// ✅ useOptimistic for optimistic UI updates
import { useOptimistic } from 'react';

function TodoList({ todos }: { todos: string[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: string) => [...state, newTodo]
  );

  return (
    <ul>
      {optimisticTodos.map((todo, i) => (
        <li key={i}>{todo}</li>
      ))}
    </ul>
  );
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

### Generic Components
```typescript
// ✅ Generic component pattern
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Usage
<List<User>
  items={users}
  renderItem={(user) => <span>{user.name}</span>}
/>
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
- Default export for components

## TypeScript Best Practices
```typescript
// ✅ Avoid 'any' - use 'unknown' for truly unknown types
function processData(data: unknown) {
  if (typeof data === 'string') {
    // TypeScript knows data is string here
    return data.toUpperCase();
  }
}

// ✅ Use type guards for runtime checks
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'email' in value
  );
}

// ✅ Use const assertions for literal types
const config = {
  baseUrl: 'https://api.example.com',
  timeout: 5000,
} as const;

// ✅ Use satisfies operator (TypeScript 4.9+)
const colors = {
  primary: '#007bff',
  secondary: '#6c757d',
} satisfies Record<string, string>;
```

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
5. [ ] Replace Redux hooks with pre-typed versions (useAppSelector/useAppDispatch)
6. [ ] Use 'import type' for type-only imports
7. [ ] Remove PropTypes if present
8. [ ] Run `npm run lint` and fix issues
9. [ ] Verify no TypeScript errors

## Key Differences from Previous Versions

### What Changed in 2025
- **Redux hooks**: Use `.withTypes()` method instead of typing on every usage
- **React 19**: New hooks like `use()`, `useActionState()`, `useFormStatus()`, `useOptimistic()`
- **TypeScript 5.6+**: Improved error messages and type inference
- **Import patterns**: Inline type qualifiers with `import { type T, value }`
- **Type safety**: Prefer `unknown` over `any`, use type guards
- **Generic components**: More common pattern for reusable components
