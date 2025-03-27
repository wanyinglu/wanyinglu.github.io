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

self.addEventListener('fetch', event => {
  const url = event.request.url;

  // 1. 仅处理视频请求（根据你的实际需求调整条件）
  if (url.includes('.mp4') || event.request.headers.get('accept')?.includes('video')) {
    event.respondWith(
      handleVideoRequest(event.request)
    );
    return;
  }

  // 其他类型请求的处理...
});

// 专门处理视频请求的函数
async function handleVideoRequest(request) {
  // 忽略查询参数和hash的纯净URL
  const cleanUrl = request.url.split(/[?#]/)[0];
  
  try {
    // 1. 先尝试从缓存获取
    const cached = await caches.match(cleanUrl);
    if (cached) return cached;

    // 2. 网络请求
    const networkRes = await fetch(request);
    
    // 3. 处理206分片响应
    if (networkRes.status === 206) {
      return await mergePartialResponse(networkRes);
    }

    // 4. 缓存并返回正常响应
    const cache = await caches.open(CACHE_NAME);
    await cache.put(cleanUrl, networkRes.clone());
    return networkRes;

  } catch (err) {
    console.warn('视频请求失败:', request.url, err);
    return createFallbackResponse();
  }
}

// 合并206分片响应
async function mergePartialResponse(response) {
  const fullBuffer = await response.arrayBuffer();
  const headers = new Headers(response.headers);
  
  // 移除分片相关头
  headers.delete('content-range');
  headers.set('content-length', fullBuffer.byteLength);
  
  return new Response(fullBuffer, {
    status: 200,  // 改为完整状态码
    headers
  });
}

// 备用响应
function createFallbackResponse() {
  return new Response('<svg>视频加载中...</svg>', {
    headers: { 'Content-Type': 'image/svg+xml' }
  });
}
