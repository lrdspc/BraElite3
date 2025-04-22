// Hook React para detectar atualização do Service Worker e avisar o usuário
import { useEffect, useState } from 'react';
import { registerServiceWorker } from './registerSW';

export function useSWUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    registerServiceWorker({
      onUpdate: () => setUpdateAvailable(true),
    });
  }, []);

  return updateAvailable;
}
