import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { isInstallPromptAvailable, promptInstall } from '../../lib/pwa';

interface InstallPwaButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
}

export function InstallPwaButton({
  className,
  variant = "default",
  size = "default"
}: InstallPwaButtonProps) {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Verificar inicialmente se a instalação é possível
    setCanInstall(isInstallPromptAvailable());

    // Ouvir evento beforeinstallprompt
    const handleBeforeInstallPrompt = () => {
      setCanInstall(true);
    };

    // Ouvir evento appinstalled
    const handleAppInstalled = () => {
      setCanInstall(false);
    };

    window.addEventListener('beforeinstallprompt-available', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt-available', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const success = await promptInstall();
    if (success) {
      setCanInstall(false);
    }
  };

  if (!canInstall) return null;

  return (
    <Button 
      className={className} 
      variant={variant} 
      size={size} 
      onClick={handleInstallClick}
    >
      <Download className="mr-2 h-4 w-4" />
      Instalar App
    </Button>
  );
}
