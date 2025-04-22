// Helpers para fallback offline em PWAs

/**
 * Detecta se o app está offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Escuta mudanças de status online/offline
 */
export function onNetworkChange(cb: (online: boolean) => void): () => void {
  const handler = () => cb(navigator.onLine);
  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);
  return () => {
    window.removeEventListener('online', handler);
    window.removeEventListener('offline', handler);
  };
}

/**
 * Exibe uma página offline amigável (pode ser customizada)
 */
export function showOfflineFallback() {
  // Exemplo: redireciona para offline.html
  window.location.href = '/offline.html';
}
