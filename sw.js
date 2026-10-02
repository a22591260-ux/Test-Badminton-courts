self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // 保持預設網路請求，確保最新版本順暢運作
});
