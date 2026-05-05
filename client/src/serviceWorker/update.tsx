import { useState, useEffect } from 'react';
import { useWorkbox } from './WorkboxContext';

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    zIndex: 9999,
    animation: 'fadeIn 0.2s ease-out',
  },
  dialog: {
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
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  description: {
    fontSize: '15px',
    opacity: 0.85,
    margin: 0,
    lineHeight: '1.5',
  },
  buttonContainer: {
    display: 'flex',
    gap: '12px',
  },
  buttonBase: {
    flex: 1,
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'all 0.2s ease',
  },
} as const;

function ServiceWorkerUpdate(): React.ReactNode {
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
        style={styles.backdrop}
        tabIndex={0}
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropClick}
      />

      {/* Update dialog */}
      <div
        aria-describedby="update-dialog-description"
        aria-labelledby="update-dialog-title"
        role="dialog"
        style={styles.dialog}
        tabIndex={-1}
        onClick={handleDialogClick}
        onKeyDown={handleDialogKeyDown}
      >
        <div style={styles.header}>
          <h2 id="update-dialog-title" style={styles.title}>
            Update Available
          </h2>
          <p id="update-dialog-description" style={styles.description}>
            A new version of Reacddit is ready
          </p>
        </div>

        <div style={styles.buttonContainer}>
          <button
            className="sw-update-later-btn"
            disabled={isUpdating}
            style={{
              ...styles.buttonBase,
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.2)',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              opacity: isUpdating ? 0.5 : 1,
              fontWeight: '500',
            }}
            onClick={handleDismiss}
          >
            Later
          </button>
          <button
            className="sw-update-now-btn"
            disabled={isUpdating}
            style={{
              ...styles.buttonBase,
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              opacity: isUpdating ? 0.7 : 1,
              fontWeight: '600',
              boxShadow: '0 4px 14px rgba(66, 153, 225, 0.4)',
            }}
            onClick={handleUpdate}
          >
            {isUpdating ? 'Updating...' : 'Update Now'}
          </button>
        </div>
      </div>

      {/* CSS animations and hover states */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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

        .sw-update-later-btn:not(:disabled):hover {
          background-color: rgba(255,255,255,0.08) !important;
          border-color: rgba(255,255,255,0.3) !important;
        }

        .sw-update-now-btn:not(:disabled):hover {
          background-color: #3182ce !important;
          box-shadow: 0 6px 20px rgba(66, 153, 225, 0.5) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </>
  );
}

export default ServiceWorkerUpdate;
