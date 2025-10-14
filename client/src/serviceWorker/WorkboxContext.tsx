import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { Workbox } from 'workbox-window';

const WorkboxContext = createContext<Workbox | null>(null);

interface WorkboxProviderProps {
  workbox: Workbox | null;
  children: ReactNode;
}

export function WorkboxProvider({ workbox, children }: WorkboxProviderProps) {
  return (
    <WorkboxContext.Provider value={workbox}>
      {children}
    </WorkboxContext.Provider>
  );
}

export function useWorkbox(): Workbox | null {
  return useContext(WorkboxContext);
}
