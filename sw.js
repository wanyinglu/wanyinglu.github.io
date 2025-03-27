const CACHE_NAME = 'scratch-videos-v3';
const VIDEO_URLS = [/* 你的视频URL数组 */];

// 安装阶段 - 仅预缓存
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(VIDEO_URLS.slice(0, 3))) // 只缓存前3个视频
      .then(() => self.skipWaiting())
      .catch(err => console.error('预缓存失败:', err))
  );
});

// 激活阶段 - 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
      ))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // 仅拦截视频请求
  if (VIDEO_URLS.some(videoUrl => url.href.includes(videoUrl))) {
    event.respondWith(
      caches.match(event.request)
        .then(cached => {
          if (cached) {
            console.log('从缓存返回:', event.request.url);
            return cached;
          }
          // 网络请求并缓存
          return fetch(event.request)
            .then(networkRes => {
              const cacheCopy = networkRes.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, cacheCopy));
              return networkRes;
            })
            .catch(() => {
              console.warn('网络请求失败，返回备用响应');
              return new Response('<svg>视频加载中...</svg>', { 
                headers: { 'Content-Type': 'image/svg+xml' } 
              });
            });
        })
    );
  }
  // 非视频请求直接放行
});
