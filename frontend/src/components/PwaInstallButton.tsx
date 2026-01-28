import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export const PwaInstallButton = ({ className = "" }: { className?: string }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
    const standalone = window.matchMedia?.("(display-mode: standalone)").matches;
    if (standalone) {
      setIsInstalled(true);
    } else if (isIos && isSafari) {
      setShowIosHint(true);
    }

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (isInstalled) return null;

  const handleClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <div className="pwa-install-wrap">
      {deferredPrompt && (
        <button type="button" className={`pwa-install ${className}`} onClick={handleClick}>
          Installera appen
        </button>
      )}
      {!deferredPrompt && showIosHint && (
        <p className="pwa-install-hint">
          På iPhone/iPad: tryck <strong>Dela</strong> och välj <strong>Lägg till på hemskärmen</strong>.
        </p>
      )}
    </div>
  );
};
