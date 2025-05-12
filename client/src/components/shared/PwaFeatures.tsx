import React, { useState } from 'react';
import ShareButton from './ShareButton';
import NotificationBadge from './NotificationBadge';
import { InstallPwaButton } from './InstallPwaButton';
import { ServiceWorkerManager } from './ServiceWorkerManager';
import { Button } from '@/components/ui/button';
import { Bell, Plus, Minus, RefreshCw } from 'lucide-react';
import { registerWidgetProvider, isOnline, processSyncQueue } from '@/lib/pwa';

/**
 * PwaFeatures component that demonstrates the PWA features
 * - Web Share API
 * - Badging API
 * - Windows Widgets API
 * - App Installation
 * - Service Worker updates
 */
const PwaFeatures: React.FC = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const incrementNotifications = () => {
    setNotificationCount(prev => prev + 1);
  };

  const decrementNotifications = () => {
    setNotificationCount(prev => Math.max(0, prev - 1));
  };

  const clearNotifications = () => {
    setNotificationCount(0);
  };

  const registerWidget = () => {
    const success = registerWidgetProvider();
    if (success) {
      alert('Widget registrado com sucesso! Verifique o painel de widgets do seu sistema operacional.');
    } else {
      alert('Seu navegador não suporta widgets ou ocorreu um erro ao registrar o widget.');
    }
  };

  const handleSync = async () => {
    if (!isOnline()) {
      alert('Você está offline. Verifique sua conexão e tente novamente.');
      return;
    }
    
    setIsSyncing(true);
    try {
      await processSyncQueue();
      alert('Sincronização concluída com sucesso!');
    } catch (error) {
      console.error('Erro durante sincronização:', error);
      alert('Ocorreu um erro durante a sincronização. Tente novamente mais tarde.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm">
      <ServiceWorkerManager showUpdates={true} />

      <div>
        <h3 className="text-lg font-medium mb-2">Instalação do App</h3>
        <p className="text-sm text-gray-500 mb-3">
          Instale o aplicativo em seu dispositivo para uma experiência aprimorada.
        </p>
        <InstallPwaButton />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Sincronização</h3>
        <p className="text-sm text-gray-500 mb-3">
          Sincronize dados manualmente enquanto estiver online.
        </p>
        <Button onClick={handleSync} disabled={isSyncing || !isOnline()}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
        </Button>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Compartilhamento</h3>
        <p className="text-sm text-gray-500 mb-3">
          Compartilhe conteúdo usando a Web Share API ou copie o link para a área de transferência.
        </p>
        <div className="flex flex-wrap gap-2">
          <ShareButton 
            title="Brasilit Vistorias Técnicas" 
            text="Confira esta ferramenta incrível para vistorias técnicas da Brasilit!"
          />
          
          <ShareButton 
            title="Relatório de Vistoria" 
            text="Veja os detalhes deste relatório de vistoria técnica"
            url={`${window.location.origin}/report/example`}
            variant="default"
          >
            Compartilhar Relatório
          </ShareButton>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Notificações</h3>
        <p className="text-sm text-gray-500 mb-3">
          Demonstração do Badging API para exibir contadores de notificação no ícone do aplicativo.
        </p>
        <div className="flex items-center gap-3">
          <NotificationBadge count={notificationCount}>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
          </NotificationBadge>
          
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={decrementNotifications}>
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={incrementNotifications}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={clearNotifications}>
              Limpar
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            Contagem atual: {notificationCount}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Widgets</h3>
        <p className="text-sm text-gray-500 mb-3">
          Adicione widgets do Brasilit ao painel de widgets do seu sistema operacional.
        </p>
        <Button onClick={registerWidget}>
          Registrar Widget
        </Button>
      </div>
    </div>
  );
};

export default PwaFeatures;