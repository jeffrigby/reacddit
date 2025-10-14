import { useState, useEffect } from 'react';
import { useWorkbox } from './WorkboxContext';

function ServiceWorkerUpdate() {
  const workbox = useWorkbox();
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!workbox) {
      return;
    }

    // Listen for waiting service worker
    const handleWaiting = () => {
      setShowUpdatePrompt(true);
    };

    // Listen for controlling service worker (update activated)
    const handleControlling = () => {
      window.location.reload();
    };

    workbox.addEventListener('waiting', handleWaiting);
    workbox.addEventListener('controlling', handleControlling);

    // Check if there's already a waiting SW (workbox already registered in index.tsx)
    // We just check the existing registration, not register again
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          setShowUpdatePrompt(true);
        }
      });
    }

    return () => {
      workbox.removeEventListener('waiting', handleWaiting);
      workbox.removeEventListener('controlling', handleControlling);
    };
  }, [workbox]);

  const handleUpdate = async () => {
    if (!workbox) {
      return;
    }

    setIsUpdating(true);

    // Send SKIP_WAITING message to the waiting service worker
    workbox.messageSkipWaiting();
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#343a40',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        maxWidth: '90vw',
      }}
    >
      <div style={{ flex: 1 }}>
        <strong>Update Available</strong>
        <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>
          A new version of Reacddit is ready
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          disabled={isUpdating}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '4px',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            opacity: isUpdating ? 0.5 : 1,
          }}
          onClick={handleDismiss}
        >
          Later
        </button>
        <button
          disabled={isUpdating}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            opacity: isUpdating ? 0.7 : 1,
          }}
          onClick={handleUpdate}
        >
          {isUpdating ? 'Updating...' : 'Update Now'}
        </button>
      </div>
    </div>
  );
}

export default ServiceWorkerUpdate;
