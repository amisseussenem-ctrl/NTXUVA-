import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<(event: BeforeInstallPromptEvent | null) => void>();

function notifyPromptListeners(ev: BeforeInstallPromptEvent | null) {
  globalDeferredPrompt = ev;
  promptListeners.forEach((fn) => fn(ev));
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    notifyPromptListeners(e as BeforeInstallPromptEvent);
  });

  window.addEventListener('appinstalled', () => {
    try {
      localStorage.setItem('ntxuva_pwa_instalado', 'true');
    } catch {}
    notifyPromptListeners(null);
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    const salvo = localStorage.getItem('ntxuva_pwa_instalado') === 'true';
    return (
      salvo ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    const listener = (prompt: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(prompt);
      if (!prompt) {
        const salvo = localStorage.getItem('ntxuva_pwa_instalado') === 'true';
        const isStandalone =
          window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as unknown as { standalone?: boolean }).standalone === true;
        setIsInstalled(salvo || isStandalone);
      }
    };
    promptListeners.add(listener);

    // Initial check
    const salvo = localStorage.getItem('ntxuva_pwa_instalado') === 'true';
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(salvo || isStandalone);

    // Detect mobile OS & In-app browsers
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isAndroidDevice = /android/.test(userAgent);
    const inApp = /fban|fbav|instagram|whatsapp|micromessenger|wv|line\//.test(userAgent);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsInAppBrowser(inApp);

    return () => {
      promptListeners.delete(listener);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    const promptEvent = deferredPrompt || globalDeferredPrompt;
    if (!promptEvent) {
      console.warn('[PWA] Prompt nativo não disponível neste navegador/dispositivo.');
      return false;
    }
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        try {
          localStorage.setItem('ntxuva_pwa_instalado', 'true');
        } catch {}
        notifyPromptListeners(null);
        return true;
      }
    } catch (err) {
      console.warn('[PWA] Erro ao disparar instalação:', err);
    }
    return false;
  };

  const marcarComoInstalado = () => {
    setIsInstalled(true);
    try {
      localStorage.setItem('ntxuva_pwa_instalado', 'true');
    } catch {}
  };

  return {
    isInstallable: !!(deferredPrompt || globalDeferredPrompt),
    isInstalled,
    isIOS,
    isAndroid,
    isInAppBrowser,
    install,
    marcarComoInstalado,
  };
}
