const CACHE_NAME = 'veggie-badminton-v4-offline';

// 需要快取離線使用的檔案清單（請確認你的主檔名是 index.html）
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png'
];

// 1. 安裝階段：將網頁與圖示預先快取到手機本機
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // 立即啟用新版 Service Worker
});

// 2. 啟用階段：清除舊版本快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. 攔截請求：有網路時優先抓最新並更新快取；飛航模式（離線）時直接讀取本機快取
self.addEventListener('fetch', (event) => {
  // 只處理 GET 請求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // 連線成功時，順便把最新版存進快取
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => {
        // 飛航模式 / 無網路時，從快取取出網頁（ignoreSearch 避免網址帶參數找不到）
        return caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // 若是頁面導航請求，直接回傳快取的 index.html
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
