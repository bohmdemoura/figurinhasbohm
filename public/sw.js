const CACHE_NAME = 'figurinhas-bohm-v1.0.6';

const assets = [
    '/',
    '/index.html',
    '/login.html',
    '/app.js',
    '/firebase-config.js',
    '/manifest.json',
    '/Sem nome (480 x 322 px).png'
];

// Instala e armazena arquivos no cache
self.addEventListener('install', event => {
    self.skipWaiting(); // Ativa imediatamente, sem esperar fechar abas antigas
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
    );
});

// Limpa caches antigos ao ativar
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim()) // Assume controle de todas as abas abertas
    );
});

// Estratégia: Network First para HTML/JS (sempre busca versão nova), Cache Fallback para assets
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Requisições ao Firebase nunca passam pelo cache
    if (url.hostname.includes('firebase') || url.hostname.includes('google')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // HTML e JS: tenta rede primeiro, cai no cache só se offline
    if (event.request.destination === 'document' || url.pathname.endsWith('.js')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Atualiza o cache com a versão mais recente
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Outros assets (imagens, etc): cache primeiro
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});