const CACHE_NAME = 'scratch-videos-v3';
const VIDEO_URLS = [
  'https://raw.githubusercontent.com/wanyinglu/wanyinglu/main/1题.mp4',
  // ...其他视频URL...
];

// 安装阶段 - 预缓存
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(VIDEO_URLS.slice(0, 3)))
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

// 工具函数
function createFallbackResponse() {
  return new Response('<svg>视频加载中...</svg>', {
    headers: {'Content-Type': 'image/svg+xml'}
  });
}

// 请求拦截
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // 动态替换 scratch-cw.top 的视频请求
  if (url.includes('scratch-cw.top/video')) {
    const videoNum = url.match(/video\/(\d+)\.mp4/)?.[1];
    if (videoNum) {
      const realUrl = `https://raw.githubusercontent.com/wanyinglu/wanyinglu/main/${videoNum}题.mp4`;
      event.respondWith(
        fetch(realUrl, { mode: 'no-cors' })
          .then(res => {
            if (res.ok || res.type === 'opaque') {
              const cacheCopy = res.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, cacheCopy));
            }
            return res;
          })
          .catch(() => createFallbackResponse())
      );
      return;
    }
  }

  // 处理其他视频请求
  if (VIDEO_URLS.some(videoUrl => url.includes(videoUrl))) {
    event.respondWith(
      caches.match(event.request)
        .then(cached => cached || fetch(event.request))
        .catch(() => createFallbackResponse())
    );
  }
});
