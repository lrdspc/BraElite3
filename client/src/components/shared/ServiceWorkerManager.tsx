import { useEffect, useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { RefreshCcw } from 'lucide-react';

interface ServiceWorkerManagerProps {
  showUpdates?: boolean;
}

export function ServiceWorkerManager({ showUpdates = true }: ServiceWorkerManagerProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'idle' | 'error'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    // Ouvir mensagens do Service Worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const messageHandler = (event: MessageEvent) => {
        const data = event.data;
        
        // Atualização do app disponível
        if (data.type === 'APP_UPDATE') {
          setUpdateAvailable(true);
        }
        
        // Status de sincronização
        if (data.type === 'SYNC_STATUS') {
          setSyncStatus(data.payload.syncing ? 'syncing' : 'idle');
        }
      };

      navigator.serviceWorker.addEventListener('message', messageHandler);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', messageHandler);
      };
    }
  }, []);

  // Atualizar a página para obter a nova versão do Service Worker
  const handleUpdate = () => {
    window.location.reload();
  };

  return (
    <>
      {showUpdates && updateAvailable && (
        <Alert className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
          <AlertTitle>Nova versão disponível</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Uma nova versão do aplicativo está disponível.</span>
            <Button 
              size="sm" 
              onClick={handleUpdate}
              className="ml-2"
            >
              <RefreshCcw className="mr-1 h-4 w-4" />
              Atualizar
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {syncStatus === 'syncing' && (
        <div className="fixed bottom-4 right-4 bg-primary text-white px-3 py-2 rounded-full text-sm flex items-center animate-pulse">
          <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Sincronizando...
        </div>
      )}
    </>
  );
}
