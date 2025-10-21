import { createContext } from 'react';

export const ListingsContextLastExpanded = createContext<
  [string, (value: string) => void] | object
>({});
