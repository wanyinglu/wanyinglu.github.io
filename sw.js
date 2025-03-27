// 极简 Service Worker - 仅测试注册功能
const CACHE_NAME = 'test-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker 安装成功，缓存已初始化');
        return self.skipWaiting(); // 强制激活新 SW
      })
      .catch((err) => {
        console.error('安装失败:', err);
      })
  );
});

// 可选：添加基本的 fetch 事件（仅作测试）
self.addEventListener('fetch', (event) => {
  console.log('拦截请求:', event.request.url);
  // 不实际处理请求，仅作日志记录
  event.respondWith(fetch(event.request));
});
