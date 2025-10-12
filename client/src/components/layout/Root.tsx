import { ModalProvider } from '@/contexts/ModalContext';
import App from './App';

function Root() {
  return (
    <ModalProvider>
      <App />
    </ModalProvider>
  );
}

export default Root;
