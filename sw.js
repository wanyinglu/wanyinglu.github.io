// Service Worker 版本控制
const CACHE_NAME = 'scratch-videos-v3';
const VIDEO_URLS = [
    'https://raw.githubusercontent.com/wanyinglu/wanyinglu/refs/heads/main/1%E9%A2%98.mp4',
    'https://raw.githubusercontent.com/wanyinglu/wanyinglu/refs/heads/main/2%E9%A2%98.mp4',
    'https://raw.githubusercontent.com/wanyinglu/wanyinglu/refs/heads/main/3%E9%A2%98.mp4',
    'https://raw.githubusercontent.com/wanyinglu/wanyinglu/refs/heads/main/4%E9%A2%98.mp4',
    'https://raw.githubusercontent.com/wanyinglu/wanyinglu/refs/heads/main/5%E9%A2%98.mp4',
    'https://raw.githubusercontent.com/wanyinglu/wanyinglu/refs/heads/main/6%E9%A2%98.mp4',
    'https://raw.githubusercontent.com/wanyinglu/wanyinglu/refs/heads/main/7%E9%A2%98.mp4',
    'https://raw.githubusercontent.com/wanyinglu/wanyinglu/refs/heads/main/8%E9%A2%98.mp4',
    'https://raw.githubusercontent.com/wanyinglu/wanyinglu/refs/heads/main/9%E9%A2%98.mp4',
    'https://raw.githubusercontent.com/wanyinglu/wanyinglu/refs/heads/main/10%E9%A2%98.mp4',
    'https://raw.githubusercontent.com/wanyinglu/wanyinglu/refs/heads/main/11%E9%A2%98.mp4',
    'https://raw.githubusercontent.com/wanyinglu/wanyinglu/refs/heads/main/12%E9%A2%98.mp4',
    'https://raw.githubusercontent.com/wanyinglu/wanyinglu/refs/heads/main/13%E9%A2%98.mp4',
    'https://raw.githubusercontent.com/wanyinglu/wanyinglu/refs/heads/main/14%E9%A2%98.mp4',
    'https://raw.githubusercontent.com/wanyinglu/wanyinglu/refs/heads/main/15%E9%A2%98.mp4'
];

// 安装阶段 - 预缓存关键资源
self.addEventListener('install', event => {
    event.waitUntil(
        (async () => {
            try {
                const cache = await caches.open(CACHE_NAME);
                // 预缓存前3个视频提升初始体验
                await cache.addAll(VIDEO_URLS.slice(0, 3));
                console.log('预缓存完成');
                return self.skipWaiting();
            } catch (error) {
                console.error('安装失败:', error);
                throw error;
            }
        })()
    );
});

// 激活阶段 - 清理旧缓存
self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            try {
                const keys = await caches.keys();
                await Promise.all(
                    keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
                );
                return self.clients.claim();
            } catch (error) {
                console.error('激活失败:', error);
                throw error;
            }
        })()
    );
});

// 拦截请求的核心逻辑
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // 处理视频请求（包括跨域视频）
    if (isVideoRequest(event.request)) {
        event.respondWith(
            (async () => {
                try {
                    // 尝试从缓存获取
                    const cachedResponse = await caches.match(getCacheKey(event.request));
                    if (cachedResponse) return cachedResponse;
                    
                    // 从网络获取并缓存
                    const networkResponse = await fetch(event.request, { 
                        mode: 'no-cors',
                        credentials: 'omit'
                    });
                    
                    if (networkResponse.ok || networkResponse.type === 'opaque') {
                        const cache = await caches.open(CACHE_NAME);
                        await cache.put(getCacheKey(event.request), networkResponse.clone());
                    }
                    
                    return networkResponse;
                } catch (error) {
                    console.warn('视频加载失败:', error);
                    return createFallbackResponse();
                }
            })()
        );
    }
});

// 后台更新机制
self.addEventListener('message', event => {
    if (event.data.action === 'UPDATE_VIDEOS') {
        event.waitUntil(
            updateAllVideos().then(() => {
                event.ports[0]?.postMessage({ status: 'complete' });
            })
        );
    }
});

// ========== 工具函数 ========== //

// 判断是否为视频请求
function isVideoRequest(request) {
    return VIDEO_URLS.some(videoUrl => 
        request.url.includes(videoUrl) || 
        (request.url.includes('scratch-cw.top') && request.url.includes('.mp4'))
}

// 生成统一的缓存键
function getCacheKey(request) {
    const url = new URL(request.url);
    if (url.hostname === 'www.scratch-cw.top') {
        const videoNum = request.url.match(/(\d+)题\.mp4/)?.[1];
        if (videoNum) {
            return `https://raw.githubusercontent.com/wanyinglu/wanyinglu/refs/heads/main/${videoNum}题.mp4`;
        }
    }
    return request;
}

// 更新所有视频缓存
async function updateAllVideos() {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(
        VIDEO_URLS.map(url => 
            fetch(url, { cache: 'reload' })
                .then(res => res.ok ? cache.put(url, res) : null)
                .catch(e => console.warn(`更新失败 ${url}:`, e))
    );
}

// 创建备用响应
function createFallbackResponse() {
    return new Response(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <rect width="100%" height="100%" fill="#f5f6fa"/>
            <text x="50%" y="50%" font-family="Arial" font-size="10" text-anchor="middle" fill="#6c5ce7">
                视频加载中...
            </text>
        </svg>`,
        { headers: { 'Content-Type': 'image/svg+xml' } }
    );
}
