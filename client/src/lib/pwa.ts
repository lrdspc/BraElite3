import { addToSyncQueue, getSyncQueue, removeFromSyncQueue, updateSyncQueueItem, clearAllData } from './db';

// Re-export isOnline to avoid import errors
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === true;
}

// Re-export clearAllData function
export { clearAllData };

// Badging API implementation
export async function setAppBadge(count: number): Promise<boolean> {
  if ('setAppBadge' in navigator) {
    try {
      await navigator.setAppBadge(count);
      return true;
    } catch (error) {
      console.error('Error setting app badge:', error);
      return false;
    }
  }
  return false;
}

export async function clearAppBadge(): Promise<boolean> {
  if ('clearAppBadge' in navigator) {
    try {
      await navigator.clearAppBadge();
      return true;
    } catch (error) {
      console.error('Error clearing app badge:', error);
      return false;
    }
  }
  return false;
}

// Web Share API implementation
export async function shareContent(data: { 
  title?: string; 
  text?: string; 
  url?: string;
  files?: File[];
}): Promise<boolean> {
  if (!navigator.share) {
    console.warn('Web Share API not supported');
    return false;
  }

  try {
    await navigator.share(data);
    return true;
  } catch (error) {
    // User cancelled or share failed
    if ((error as Error).name !== 'AbortError') {
      console.error('Error sharing content:', error);
    }
    return false;
  }
}

// Check if Web Share API is available
export function canShare(data?: { files?: File[] }): boolean {
  return navigator.share && (!data || navigator.canShare(data));
}

// Windows Widgets API implementation (experimental)
export function registerWidgetProvider(): boolean {
  if ('widgets' in window) {
    try {
      // @ts-ignore - Windows Widgets API is experimental
      window.widgets.register({
        widgetName: 'brasilit-dashboard',
        widgetUrl: '/widgets/dashboard.html',
        widgetDisplayName: 'Brasilit Dashboard',
        widgetDescription: 'Mostra estatísticas de vistorias técnicas',
        widgetKeywords: ['brasilit', 'dashboard', 'vistorias'],
        widgetCategory: 'productivity',
        widgetSizes: [
          { width: 300, height: 200 },
          { width: 300, height: 400 }
        ]
      });
      return true;
    } catch (error) {
      console.error('Error registering widget provider:', error);
      return false;
    }
  }
  return false;
}

// Variables to hold beforeinstallprompt event and install prompt state
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installPromptVisible = false;

// Listen for beforeinstallprompt event and save it
window.addEventListener('beforeinstallprompt', (e: BeforeInstallPromptEvent) => {
  e.preventDefault();
  deferredPrompt = e;
  installPromptVisible = true;
  // Dispatch custom event or use state management to notify UI
  window.dispatchEvent(new CustomEvent('pwa-install-prompt-available'));
});

// Function to trigger the install prompt
export async function promptInstall() {
  if (!deferredPrompt) {
    return false;
  }
  deferredPrompt.prompt();
  const choiceResult = await deferredPrompt.userChoice;
  deferredPrompt = null;
  installPromptVisible = false;
  return choiceResult.outcome === 'accepted';
}

// Function to check if install prompt is available
export function isInstallPromptAvailable() {
  return installPromptVisible;
}

// Register service worker
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      console.log('ServiceWorker registered with scope:', registration.scope);

      // Set up periodic sync if browser supports it
      setupPeriodicSync();

      // Process sync queue when online
      window.addEventListener('online', processSyncQueue);

      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  }
}

// Set up periodic background sync if supported
async function setupPeriodicSync() {
  if ('periodicSync' in navigator.serviceWorker) {
    try {
      const status = await navigator.permissions.query({
        name: 'periodic-background-sync' as any,
      });

      if (status.state === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        if ('periodicSync' in registration) {
          await (registration as any).periodicSync.register('sync-data', {
            minInterval: 15 * 60 * 1000, // 15 minutes
          });
          console.log('Periodic background sync registered');
        }
      }
    } catch (error) {
      console.error('Periodic background sync registration failed:', error);
    }
  }
}

// Process the sync queue when the device goes back online
export async function processSyncQueue() {
  if (!isOnline()) return;

  const queue = await getSyncQueue();
  if (queue.length === 0) return;

  console.log(`Processing ${queue.length} items in sync queue`);

  // Process items in order (oldest first)
  const sortedQueue = [...queue].sort((a, b) => a.timestamp - b.timestamp);

  for (const item of sortedQueue) {
    try {
      // Increment attempt count
      await updateSyncQueueItem(item.id, { attempts: item.attempts + 1 });

      // Make the request
      const response = await fetch(item.url, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          // Include auth headers if needed
        },
        body: item.body ? JSON.stringify(item.body) : undefined,
        credentials: 'include',
      });

      if (response.ok) {
        // If successful, remove from queue
        await removeFromSyncQueue(item.id);
        console.log(`Successfully synced item: ${item.id}`);
      } else {
        // If max attempts reached (5), remove from queue
        if (item.attempts >= 5) {
          await removeFromSyncQueue(item.id);
          console.error(`Max attempts reached for sync item: ${item.id}, removing from queue`);
        } else {
          console.error(`Failed to sync item: ${item.id}, status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error(`Error syncing item: ${item.id}`, error);
    }
  }
}

// Add a fetch request to the sync queue
export async function queueRequest(method: string, url: string, body?: any) {
  await addToSyncQueue(method, url, body);

  // Try to process immediately if online
  if (isOnline()) {
    processSyncQueue();
  }
}

// Check if app needs update
export async function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      newWorker?.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version installed but waiting to activate
          if (confirm('Nova versão disponível! Recarregar para atualizar?')) {
            window.location.reload();
          }
        }
      });
    });
  }
}

// Manually check for service worker updates
export async function checkForServiceWorkerUpdates() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    try {
      await registration.update();
    } catch (error) {
      console.error('Error updating service worker:', error);
    }
  }
}
