import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from './Button';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPWA({ className }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Fallback for iOS Safari and browsers that don't support the automatic prompt
      alert(
        'To install the app:\n\n' +
        '• iOS Safari: Tap the "Share" icon at the bottom, then select "Add to Home Screen".\n' +
        '• Android/Chrome: Tap the browser menu (⋮) and select "Install App" or "Add to Home screen".'
      );
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      className={`gap-2 ${className || ''}`}
      onClick={handleInstall}
    >
      <Download size={16} /> Install App
    </Button>
  );
}
