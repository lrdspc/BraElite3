// Configurações principais do service worker
const APP_VERSION = '1.0.0';
const CACHE_NAME = 'brasilit-vistoria-v1-' + APP_VERSION;
const OFFLINE_URL = '/offline.html';
const DEBUG = false;
// Caches diferentes para diferentes tipos de conteúdo com estratégias específicas
const CACHES = {
  static: `${CACHE_NAME}-static`,  pages: `${CACHE_NAME}-pages`,  images: `${CACHE_NAME}-images`,  fonts: `${CACHE_NAME}-fonts`,  api: `${CACHE_NAME}-api`,  dynamic: `${CACHE_NAME}-dynamic`};

const IDB_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/idb@7/build/iife/index-min.js';

// Assets estáticos que devem ser pré-cacheados durante a instalação
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/brasilit-icon-192.svg',
  '/brasilit-icon-512.svg',
  '/brasilit-icon-192-maskable.svg', // Added maskable icon
  '/brasilit-icon-512-maskable.svg', // Added maskable icon
  '/shortcut-dashboard.svg', // Added shortcut icon
  '/shortcut-inspection.svg', // Added shortcut icon
  '/shortcut-list.svg', // Added shortcut icon
  // Screenshot files are not typically pre-cached as they are for store listings
  IDB_SCRIPT_URL // Cache the idb script
];

// Função helper para logs condicionais
function log(...args) {
  if (DEBUG) {
    console.log('[ServiceWorker]', ...args);
  }
}

// Função aprimorada para gerenciamento de cache
async function clearOldCaches() {
  try {
    const cacheKeys = await caches.keys();
    const oldCacheKeys = cacheKeys.filter(key => 
      key.startsWith('brasilit-vistoria-') && !Object.values(CACHES).includes(key)
    );
    
    log('Limpando caches antigos:', oldCacheKeys);
    
    // Limpar caches antigos
    await Promise.all(oldCacheKeys.map(key => caches.delete(key)));
    
    // Verificar e limpar caches que excedem o limite de armazenamento
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const {usage, quota} = await navigator.storage.estimate();
      const usageRatio = usage / quota;
      
      if (usageRatio > 0.7) { // Limpar se uso > 70%
        log('Uso de armazenamento alto, limpando caches não essenciais...');
        await clearNonEssentialCache();
      }
    }
    
    return true;
  } catch (error) {
    log('Erro ao limpar caches:', error);
    return false;
  }
}

// Função para limpar cache não essencial
async function clearNonEssentialCache() {
  const nonEssentialCaches = [CACHES.images, CACHES.dynamic];
  
  for (const cacheName of nonEssentialCaches) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    // Manter apenas os recursos mais recentes
    const sortedKeys = keys.sort((a, b) => {
      const aDate = a.headers.get('date');
      const bDate = b.headers.get('date');
      return new Date(bDate) - new Date(aDate);
    });
    
    // Manter apenas os 100 recursos mais recentes
    const keysToDelete = sortedKeys.slice(100);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Função aprimorada para detectar o tipo de conteúdo e definir estratégia de cache
function getCacheNameForRequest(request) {
  const url = new URL(request.url);
  
  // Requisições de API com verificação de método
  if (url.pathname.startsWith('/api/')) {
    return request.method === 'GET' ? CACHES.api : null;
  }
  
  // Requisições de imagens com suporte a WebP
  if (
    request.destination === 'image' || 
    url.pathname.match(/\.(png|jpe?g|svg|gif|webp|bmp|ico|avif)$/i)
  ) {
    return CACHES.images;
  }
  
  // Requisições de fontes com prioridade de WOFF2
  if (
    request.destination === 'font' || 
    url.pathname.match(/\.(woff2?|ttf|otf|eot)$/i)
  ) {
    return CACHES.fonts;
  }
  
  // Requisições de HTML (páginas) com verificação de modo
  if (
    request.destination === 'document' || 
    request.mode === 'navigate' ||
    url.pathname.match(/\.(html?)$/i)
  ) {
    return CACHES.pages;
  }
  
  // Recursos estáticos com verificação de extensão
  if (url.pathname.match(/\.(css|js|json|xml)$/i)) {
    return CACHES.static;
  }
  
  // Cache dinâmico para outros recursos
  return CACHES.dynamic;
}

// Função para mostrar indicador de sincronização
async function showSyncIndicator() {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_STATUS',
      payload: { syncing: true }
    });
  });
}

// Função para ocultar indicador de sincronização
async function hideSyncIndicator() {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_STATUS',
      payload: { syncing: false }
    });
  });
}

// Função para obter dados da fila de sincronização do IndexedDB
async function getSyncQueue() {
  try {
    const db = await openDB('sync-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sync-queue')) {
          db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
        }
      }
    });
    return await db.getAll('sync-queue');
  } catch (error) {
    log('Erro ao acessar a fila de sincronização:', error);
    return [];
  }
}

// Função para obter item da fila de sincronização do IndexedDB por ID
async function getSyncQueueItem(id) {
  try {
    const db = await openDB('sync-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sync-queue')) {
          db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
        }
      }
    });
    return await db.get('sync-queue', id);
  } catch (error) {
    log('Erro ao acessar item da fila de sincronização:', error);
    return null;
  }
}

// Função para atualizar item na fila de sincronização
async function updateSyncQueueItem(id, data) {
  try {
    const db = await openDB('sync-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sync-queue')) {
          db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
        }
      }
    });
    
    const item = await db.get('sync-queue', id);
    if (item) {
      await db.put('sync-queue', { ...item, ...data });
      return true;
    }
    return false;
  } catch (error) {
    log('Erro ao atualizar item da fila de sincronização:', error);
    return false;
  }
}

// Função para remover item da fila de sincronização
async function removeFromSyncQueueItem(id) {
  try {
    const db = await openDB('sync-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sync-queue')) {
          db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
        }
      }
    });
    
    await db.delete('sync-queue', id);
    return true;
  } catch (error) {
    log('Erro ao remover item da fila de sincronização:', error);
    return false;
  }
}

// Função aprimorada para sincronização de dados com retry e compressão adaptativa
async function syncData() {
  log('Iniciando sincronização de dados...');
  showSyncIndicator();

  try {
    const syncQueue = await getSyncQueue();
    if (syncQueue.length === 0) {
      log('Nenhum dado para sincronizar');
      return;
    }

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSlowConnection = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';

    const sortedQueue = [...syncQueue].sort((a, b) => {
      const typePriority = { urgent: 0, normal: 1, low: 2 };
      const priorityDiff = typePriority[a.priority || 'normal'] - typePriority[b.priority || 'normal'];
      return priorityDiff || a.timestamp - b.timestamp;
    });

    for (const item of sortedQueue) {
      if (isSlowConnection && item.data?.images) {
        // A função compressImages não está definida neste escopo, precisaria ser importada ou definida.
        // Por ora, vou comentar para evitar erros, mas idealmente ela deveria existir.
        // item.data.images = await compressImages(item.data.images, { quality: 0.6, maxWidth: 1024 });
        log('Compressão de imagens pulada pois a função compressImages não está disponível no escopo do service worker.');
      }

      const maxRetries = 5;
      const initialBackoff = 1000; // 1 segundo

      let attempts = item.attempts || 0;
      if (attempts >= maxRetries) {
        log(`Número máximo de tentativas atingido para o item: ${item.id}, removendo da fila`);
        await removeFromSyncQueueItem(item.id);
        continue;
      }

      try {
        // Incrementar contador de tentativas ANTES da tentativa
        attempts++;
        await updateSyncQueueItem(item.id, { attempts: attempts, lastAttemptTimestamp: Date.now() });

        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
            ...(item.headers || {}), // Incluir headers armazenados
          },
          body: item.body ? JSON.stringify(item.body) : undefined,
          credentials: 'include'
        });

        if (response.ok) {
          await removeFromSyncQueueItem(item.id);
          log(`Item sincronizado com sucesso: ${item.url}, ID: ${item.id}`);
        } else {
          log(`Falha na sincronização: ${response.status} ${response.statusText} para item ID: ${item.id}, tentativa ${attempts}`);
          if (attempts >= maxRetries) {
            await removeFromSyncQueueItem(item.id);
            log(`Removido após ${maxRetries} tentativas: ${item.id}`);
          }
          // Não precisa de 'else' aqui, o item permanece na fila para a próxima tentativa de syncData
          // ou para a próxima execução do backoff se implementado diretamente no loop.
        }
      } catch (itemError) {
        log(`Erro de rede ao sincronizar item ${item.url} (ID: ${item.id}, tentativa ${attempts}):`, itemError);
        if (attempts >= maxRetries) {
          await removeFromSyncQueueItem(item.id);
          log(`Removido após ${maxRetries} tentativas devido a erro de rede: ${item.id}`);
        }
        // O item permanece na fila para a próxima tentativa de syncData
      }
    }
    log('Sincronização concluída');
  } catch (error) {
    log('Erro geral na função syncData:', error);
  } finally {
    hideSyncIndicator();
  }
}

// Função de utilidade para atraso (delay)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Modificando o loop de sincronização para incluir backoff exponencial dentro do processamento de cada item.
// Esta é uma abordagem alternativa à modificação direta de syncData,
// focando em como o 'sync' event listener lida com as tentativas.
// Para manter a simplicidade da modificação atual, o backoff será gerenciado
// pelo intervalo entre chamadas de 'syncData' (pelo 'periodicsync' ou 'sync' events)
// e o contador de tentativas. A lógica de backoff *dentro* do loop de `syncData`
// para cada item individualmente pode tornar o processo de sincronização muito longo
// se houver muitos itens na fila. A estratégia atual tenta todos os itens pendentes
// e se alguns falharem, eles serão retentados na próxima vez que `syncData` for chamado.

// Evento de instalação - pré-cachear ativos estáticos
self.addEventListener('install', (event) => {
  log('Instalando Service Worker versão:', APP_VERSION);
  
  event.waitUntil((async () => {
    // Pré-cachear ativos estáticos
    const staticCache = await caches.open(CACHES.static);
    log('Pré-cacheando recursos estáticos');
    await staticCache.addAll(STATIC_ASSETS);
    
    // Força a ativação imediata
    await self.skipWaiting();
    log('Service Worker instalado');
  })());
});

// Função para abrir IndexedDB usando idb
importScripts('https://cdn.jsdelivr.net/npm/idb@7/build/iife/index-min.js');

async function openDB(name, version, { upgrade }) {
  return idb.openDB(name, version, { upgrade });
}

// Função para adicionar item na fila de sincronização
async function addToSyncQueue(item) {
  const db = await openDB('sync-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('sync-queue')) {
        db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
      }
    }
  });
  const tx = db.transaction('sync-queue', 'readwrite');
  await tx.store.add(item);
  await tx.done;
}

// Evento de ativação - limpar caches antigos
self.addEventListener('activate', (event) => {
  log('Ativando Service Worker versão:', APP_VERSION);
  
  event.waitUntil((async () => {
    // Limpar caches antigos
    await clearOldCaches();
    
    // Tomar controle de todas as páginas imediatamente
    await self.clients.claim();
    
    // Notificar sobre a atualização
    await notifyAppUpdate();
    
    log('Service Worker ativado e no controle');
  })());
});

// Evento de fetch principal - gerenciar recursos em cache ou buscar na rede
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const cacheName = getCacheNameForRequest(request);

  log(`[SW] Fetching: ${request.url}`);

  if (request.method === 'GET') {
    if (request.mode === 'navigate') {
      event.respondWith(navigationStrategy(request));
    } else if (cacheName === CACHES.api) {
      event.respondWith(apiStrategy(request, cacheName));
    } else if (cacheName === CACHES.fonts) { // Adicionando estratégia para fontes
      event.respondWith(staleWhileRevalidateStrategy(request, cacheName));
    } else if (cacheName) {
      // Para outros caches (static, images, dynamic), usar CacheFirst com fallback para network.
      // A implementação original já faz algo similar a CacheFirst.
      event.respondWith(
        caches.open(cacheName).then((cache) => {
          return cache.match(request).then((response) => {
            if (response) {
              log(`[SW] Cache hit for: ${request.url}`);
              return response;
            }
            log(`[SW] Cache miss for: ${request.url}, fetching from network.`);
            return fetch(request).then((networkResponse) => {
              if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            }).catch(err => {
              log(`[SW] Network fetch failed for ${request.url}:`, err);
              // Para imagens, poderia retornar um placeholder como na cacheFirstStrategy
              if (request.destination === 'image') {
                const svgPlaceholder = `
                  <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Imagem indisponível">
                    <rect width="400" height="300" fill="#EEE" />
                    <text x="200" y="150" font-size="20" text-anchor="middle" fill="#AAA" dy=".3em">Imagem indisponível</text>
                  </svg>
                `;
                return new Response(svgPlaceholder, { headers: { 'Content-Type': 'image/svg+xml' } });
              }
              // Para outros, re-throw ou retornar uma resposta de erro genérica
              throw err;
            });
          });
        })
      );
    } else {
      // Fallback for GET requests not matching any specific strategy
      event.respondWith(fetch(request));
    }
  } else if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    // For non-GET requests, try network first. If offline, queue it.
    event.respondWith(
      fetch(request.clone()).catch(async () => {
        log(`[SW] Network request failed for ${request.method} ${request.url}. Queuing.`);
        // Ensure request.clone() is used if the body needs to be read multiple times
        // However, for queuing, we might need to read the body once to store it.
        const clonedRequest = request.clone();
        let body = null;
        try {
          // Attempt to read body as JSON, fallback to text, then null
          const contentType = clonedRequest.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
            body = await clonedRequest.json();
          } else {
            body = await clonedRequest.text();
          }
        } catch (e) {
          log('[SW] Could not parse body for queuing:', e);
        }
        
        await addToSyncQueue({
          url: clonedRequest.url,
          method: clonedRequest.method,
          body: body,
          headers: Object.fromEntries(clonedRequest.headers.entries()),
          timestamp: Date.now(),
          attempts: 0
        });
        // Return a synthetic response indicating the request is queued
        return new Response(JSON.stringify({ message: 'Request queued for background sync' }), {
          status: 202, // Accepted
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
  } else {
    // For other methods, just fetch
    event.respondWith(fetch(request));
  }
});

// Estratégia para API: Network first, fallback to cache
async function apiStrategy(request, cacheName) {
  log('API strategy for:', request.url);
  
  try {
    // Tentar obter da rede
    const networkResponse = await fetch(request);
    
    // Clonar a resposta para armazenar no cache
    const responseToCache = networkResponse.clone();
    
    // Armazenar no cache em segundo plano
    caches.open(cacheName).then(cache => {
      cache.put(request, responseToCache);
    });
    
    return networkResponse;
  } catch (error) {
    log('Network request failed, falling back to cache:', error);
    
    // Tentar obter do cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se falhar também no cache, retornar resposta genérica
    return new Response(
      JSON.stringify({ 
        error: 'Você está offline e este conteúdo não está disponível no cache' 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Estratégia para navegação: Network first com fallback para offline page
async function navigationStrategy(request) {
  log('Navigation strategy for:', request.url);
  
  try {
    // Tentar obter da rede
    const networkResponse = await fetch(request);
    
    // Armazenar no cache de páginas
    const responseToCache = networkResponse.clone();
    const pagesCache = await caches.open(CACHES.pages);
    pagesCache.put(request, responseToCache);
    
    return networkResponse;
  } catch (error) {
    log('Navigation failed, falling back to cached version or offline page');
    
    // Tentar obter do cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não estiver em cache, mostrar página offline
    const offlineResponse = await caches.match(OFFLINE_URL);
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Se até mesmo a página offline não estiver disponível
    return new Response(
      '<html><body><h1>Você está offline</h1><p>E a página offline não está disponível.</p></body></html>',
      {
        status: 503,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

 // Estratégia Cache First: Tenta o cache primeiro, depois a rede
async function cacheFirstStrategy(request, cacheName) {
  log('Cache-first strategy for:', request.url);
  
  // Verificar no cache primeiro
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Atualização em segundo plano
    fetch(request)
      .then(networkResponse => {
        caches.open(cacheName).then(cache => {
          cache.put(request, networkResponse);
        });
      })
      .catch(error => log('Background fetch failed:', error));
      
    return cachedResponse;
  }
  
  // Se não estiver em cache, buscar na rede
  try {
    const networkResponse = await fetch(request);
    
    // Armazenar no cache para uso futuro
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    log('Network and cache fetch failed for:', request.url);
    
    // Para imagens, retornar um placeholder SVG simples
    if (request.destination === 'image') {
      const svgPlaceholder = `
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Imagem indisponível">
          <rect width="400" height="300" fill="#EEE" />
          <text x="200" y="150" font-size="20" text-anchor="middle" fill="#AAA" dy=".3em">Imagem indisponível</text>
        </svg>
      `;
      return new Response(svgPlaceholder, { headers: { 'Content-Type': 'image/svg+xml' } });
    }
    
    // Para outros recursos, retornar erro
    throw error;
  }
}

// Estratégia Stale-While-Revalidate: Usa cache e atualiza em segundo plano
async function staleWhileRevalidateStrategy(request, cacheName) {
  log('Stale-while-revalidate strategy for:', request.url);
  
  // Buscar do cache e da rede em paralelo
  const cachedResponsePromise = caches.match(request);
  const networkResponsePromise = fetch(request);
  
  // Usar cache enquanto atualiza em segundo plano
  try {
    // Retornar imediatamente o que estiver em cache
    const cachedResponse = await cachedResponsePromise;
    
    // Em segundo plano, atualizar o cache
    networkResponsePromise
      .then(networkResponse => {
        caches.open(cacheName).then(cache => {
          cache.put(request, networkResponse.clone());
        });
      })
      .catch(error => log('Background fetch failed:', error));
      
    // Se tiver no cache, usar isso primeiro
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não estiver em cache, esperar pela resposta da rede
    return await networkResponsePromise;
    
  } catch (error) {
    log('Both cache and network failed for:', request.url);
    
    // Se ambos falharem, verificar se temos resposta em cache
    const cachedResponse = await cachedResponsePromise.catch(() => null);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se tudo falhar, gerar erro
    throw error;
  }
}

// Evento de background sync para sincronizar dados offline
self.addEventListener('sync', (event) => {
  log('Background sync event:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Evento de periodic background sync para sincronização periódica
self.addEventListener('periodicsync', (event) => {
  log('Periodic background sync event:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Evento de push para notificações push
self.addEventListener('push', (event) => {
  log('Push notification received:', event);
  
  // Garantir que sempre tenhamos dados
  const data = event.data?.json() || {
    title: 'Brasilit Vistorias',
    body: 'Nova notificação',
    icon: '/brasilit-icon-192.svg'
  };
  
  const options = {
    body: data.body,
    icon: data.icon || '/brasilit-icon-192.svg',
    badge: '/brasilit-icon-192.svg',
    data: data.url ? { url: data.url } : null,
    vibrate: [100, 50, 100]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Evento de click na notificação
self.addEventListener('notificationclick', (event) => {
  log('Notification click:', event);
  
  event.notification.close();
  
  // Abrir URL associada ou página padrão
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Evento de mensagem para comunicação com páginas
self.addEventListener('message', (event) => {
  log('Message received from client:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'SYNC_NOW') {
    syncData();
  }
});

// Indica que o service worker foi carregado corretamente
log('Service Worker carregado com sucesso - versão:', APP_VERSION);
