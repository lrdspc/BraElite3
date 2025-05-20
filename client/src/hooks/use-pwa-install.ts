import { useState, useEffect } from 'react';
import { isInstallPromptAvailable, promptInstall } from '@/lib/pwa';

export function usePwaInstall() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    setIsAvailable(isInstallPromptAvailable());

    const handleBeforeInstallPrompt = () => {
      setIsAvailable(true);
    };

    const handleAppInstalled = () => {
      setIsAvailable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    try {
      setIsInstalling(true);
      await promptInstall();
      setIsAvailable(false);
    } catch (error) {
      console.error('Erro ao instalar o PWA:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  return {
    isAvailable,
    isInstalling,
    install
  };
}
