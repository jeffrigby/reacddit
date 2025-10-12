import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from 'react';

interface ModalContextType {
  showHotkeys: boolean;
  setShowHotkeys: (show: boolean) => void;
  showAutoRefresh: boolean;
  setShowAutoRefresh: (show: boolean) => void;
  showCondenseHelp: boolean;
  setShowCondenseHelp: (show: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [showHotkeys, setShowHotkeys] = useState(false);
  const [showAutoRefresh, setShowAutoRefresh] = useState(false);
  const [showCondenseHelp, setShowCondenseHelp] = useState(false);

  // Optimize with useMemo to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      showHotkeys,
      setShowHotkeys,
      showAutoRefresh,
      setShowAutoRefresh,
      showCondenseHelp,
      setShowCondenseHelp,
    }),
    [showHotkeys, showAutoRefresh, showCondenseHelp]
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
}

/**
 * Custom hook to access modal context
 * @throws Error if used outside ModalProvider
 */
export function useModals() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModals must be used within ModalProvider');
  }
  return context;
}
