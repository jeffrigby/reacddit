import { useState, useEffect } from 'react';
import { useWorkbox } from './WorkboxContext';

function ServiceWorkerUpdate() {
  const workbox = useWorkbox();
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [laterButtonHover, setLaterButtonHover] = useState(false);
  const [updateButtonHover, setUpdateButtonHover] = useState(false);

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

  const handleBackdropClick = (
    e: React.KeyboardEvent | React.MouseEvent
  ): void => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ' ') {
      return;
    }
    handleDismiss();
  };

  const handleDialogClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
  };

  const handleDialogKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') {
      handleDismiss();
    }
  };

  return (
    <>
      {/* Modal backdrop overlay */}
      <div
        role="button"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out',
        }}
        tabIndex={0}
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropClick}
      />

      {/* Update dialog */}
      <div
        aria-describedby="update-dialog-description"
        aria-labelledby="update-dialog-title"
        role="dialog"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#2d3748',
          color: 'white',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          zIndex: 10000,
          maxWidth: '90vw',
          width: '420px',
          animation: 'slideUp 0.3s ease-out',
        }}
        tabIndex={-1}
        onClick={handleDialogClick}
        onKeyDown={handleDialogKeyDown}
      >
        <div style={{ marginBottom: '24px' }}>
          <h2
            id="update-dialog-title"
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              margin: '0 0 8px 0',
              letterSpacing: '-0.5px',
            }}
          >
            Update Available
          </h2>
          <p
            id="update-dialog-description"
            style={{
              fontSize: '15px',
              opacity: 0.85,
              margin: 0,
              lineHeight: '1.5',
            }}
          >
            A new version of Reacddit is ready
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            disabled={isUpdating}
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor:
                laterButtonHover && !isUpdating
                  ? 'rgba(255,255,255,0.08)'
                  : 'transparent',
              color: 'white',
              border: `2px solid ${
                laterButtonHover && !isUpdating
                  ? 'rgba(255,255,255,0.3)'
                  : 'rgba(255,255,255,0.2)'
              }`,
              borderRadius: '8px',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              opacity: isUpdating ? 0.5 : 1,
              fontSize: '15px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onClick={handleDismiss}
            onMouseEnter={() => setLaterButtonHover(true)}
            onMouseLeave={() => setLaterButtonHover(false)}
          >
            Later
          </button>
          <button
            disabled={isUpdating}
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor:
                updateButtonHover && !isUpdating ? '#3182ce' : '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              opacity: isUpdating ? 0.7 : 1,
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow:
                updateButtonHover && !isUpdating
                  ? '0 6px 20px rgba(66, 153, 225, 0.5)'
                  : '0 4px 14px rgba(66, 153, 225, 0.4)',
              transform:
                updateButtonHover && !isUpdating
                  ? 'translateY(-1px)'
                  : 'translateY(0)',
            }}
            onClick={handleUpdate}
            onMouseEnter={() => setUpdateButtonHover(true)}
            onMouseLeave={() => setUpdateButtonHover(false)}
          >
            {isUpdating ? 'Updating...' : 'Update Now'}
          </button>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
}

export default ServiceWorkerUpdate;
