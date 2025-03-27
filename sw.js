const CACHE_NAME = 'scratch-cw-videos';

// 监听 Scratch CW 的特殊视频请求
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // 情况1：拦截 Scratch CW 的 blob 视频请求
  if (url.startsWith('blob:https://www.scratch-cw.top')) {
    event.respondWith(
      handleScratchVideo(event.request)
    );
    return;
  }

  // 情况2：拦截 GitHub 原始视频
  if (url.includes('githubusercontent.com') && url.includes('.mp4')) {
    event.respondWith(
      caches.match(url)
        .then(cached => cached || fetch(event.request))
    );
  }
});

// 处理 Scratch CW 的特殊视频请求
async function handleScratchVideo(request) {
  // 从 Scratch CW 的 blob URL 中提取视频ID
  const videoId = request.url.match(/video\/(\d+)/)?.[1];
  if (!videoId) return fetch(request);

  // 映射到 GitHub 的真实视频地址
  const realUrl = `https://raw.githubusercontent.com/wanyinglu/wanyinglu/main/${videoId}题.mp4`;

  try {
    // 尝试从缓存获取
    const cached = await caches.match(realUrl);
    if (cached) return cached;

    // 从网络加载并缓存
    const res = await fetch(realUrl, { mode: 'no-cors' });
    if (res.ok || res.type === 'opaque') {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(realUrl, res.clone());
    }
    return res;
  } catch {
    return new Response('', { status: 200 }); // 返回空响应避免WebGL报错
  }
}
