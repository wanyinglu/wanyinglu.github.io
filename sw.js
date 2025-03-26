const CACHE_NAME = 'scratch-videos-v2';
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

// 更高效的缓存策略 - 仅缓存视频
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // 只缓存前3个视频立即使用，其余按需缓存
                return cache.addAll(VIDEO_URLS.slice(0, 3));
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => 
            Promise.all(
                keys.map(key => 
                    key !== CACHE_NAME ? caches.delete(key) : null
                )
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // 只处理视频请求
    if (VIDEO_URLS.some(videoUrl => url.href.includes(videoUrl))) {
        event.respondWith(
            caches.match(event.request)
                .then(cached => cached || 
                    fetch(event.request)
                        .then(response => {
                            // 异步缓存不影响响应
                            if (response.ok) {
                                caches.open(CACHE_NAME)
                                    .then(cache => cache.put(event.request, response.clone()));
                            }
                            return response;
                        })
                        .catch(() => {
                            // 返回备用内容或错误提示
                            return new Response(
                                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><text x="10" y="50" font-size="10">视频加载失败</text></svg>',
                                { headers: { 'Content-Type': 'image/svg+xml' } }
                            );
                        })
                )
        );
    }
});

// 后台更新机制
self.addEventListener('message', event => {
    if (event.data.action === 'UPDATE_VIDEOS') {
        event.waitUntil(
            updateVideos().then(() => {
                event.ports[0].postMessage({ status: 'complete' });
            })
        );
    }
});

async function updateVideos() {
    const cache = await caches.open(CACHE_NAME);
    for (const url of VIDEO_URLS) {
        try {
            const fresh = await fetch(url, { cache: 'reload' });
            if (fresh.ok) await cache.put(url, fresh);
        } catch (e) {
            console.warn(`无法更新 ${url}:`, e);
        }
    }
}