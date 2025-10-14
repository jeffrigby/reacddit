import type { Workbox } from 'workbox-window';
import { ModalProvider } from '@/contexts/ModalContext';
import { WorkboxProvider } from '@/serviceWorker/WorkboxContext';
import ServiceWorkerUpdate from '@/serviceWorker/update';
import App from './App';

interface RootProps {
  workbox: Workbox | null;
}

function Root({ workbox }: RootProps) {
  return (
    <WorkboxProvider workbox={workbox}>
      <ModalProvider>
        <App />
        <ServiceWorkerUpdate />
      </ModalProvider>
    </WorkboxProvider>
  );
}

export default Root;
