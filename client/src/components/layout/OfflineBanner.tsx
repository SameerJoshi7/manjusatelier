import { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      setDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && !dismissed && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-red-500 px-4 py-2 text-sm text-white shadow-md"
        >
          <div className="flex items-center gap-2">
            <WifiOff size={16} />
            <span>You are currently offline. Some features may not be available.</span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-full p-1 transition-colors hover:bg-white/20"
            aria-label="Dismiss offline banner"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
