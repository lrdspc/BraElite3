// Módulo para registro e atualização do Service Worker, com UX amigável

export function registerServiceWorker({ onUpdate }: { onUpdate?: () => void } = {}) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').then(registration => {
        // Detecta updates do SW
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Novo conteúdo disponível
                  if (onUpdate) onUpdate();
                }
              }
            };
          }
        };
      }).catch(error => {
        // Pode logar em Sentry ou similar
        console.error('Erro ao registrar Service Worker:', error);
      });
    });
  }
}
