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
