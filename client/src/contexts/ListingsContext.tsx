import { createContext } from 'react';

// Listings contexts
export const ListingsContextLastExpanded = createContext<
  [string, (value: string) => void] | object
>({});
