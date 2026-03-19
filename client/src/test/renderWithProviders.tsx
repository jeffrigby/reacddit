import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import type { RootState } from '@/redux/configureStore';
import { ModalProvider } from '@/contexts/ModalContext';
import { WorkboxProvider } from '@/serviceWorker/WorkboxContext';
import { makeStore } from '@/redux/configureStore';

interface WrapperProps {
  children: ReactNode;
}

interface RenderOptions {
  preloadedState?: Partial<RootState>;
}

/**
 * Creates a wrapper component that provides all app-level context providers.
 * Uses makeStore directly to avoid mutating the module-level store singleton
 * and skips setupListeners to prevent leaking event handlers between tests.
 */
export function createWrapper(
  options: RenderOptions = {}
): (props: WrapperProps) => ReactNode {
  const { preloadedState } = options;
  const store = makeStore(preloadedState);

  function Wrapper({ children }: WrapperProps) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <WorkboxProvider workbox={null}>
            <ModalProvider>{children}</ModalProvider>
          </WorkboxProvider>
        </BrowserRouter>
      </Provider>
    );
  }

  return Wrapper;
}
