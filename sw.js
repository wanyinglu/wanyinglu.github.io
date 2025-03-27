const CACHE_NAME = 'jiao-jiao-cache-v1';
const CACHE_RESOURCES = [
    '/',
    'index.html',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap',
    'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js',
    'https://www.scratch-cw.top/projects/4347/embed'
];

// 安装阶段 - 缓存关键资源
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('缓存关键资源');
                return cache.addAll(CACHE_RESOURCES);
            })
    );
});

// 激活阶段 - 清理旧缓存
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 拦截请求 - 缓存优先策略
self.addEventListener('fetch', event => {
    // 不缓存视频请求，使用分段加载
    if (event.request.url.includes('.mp4')) {
        return fetch(event.request);
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 如果缓存中有，返回缓存
                if (response) {
                    return response;
                }
                
                // 否则从网络获取
                return fetch(event.request).then(
                    response => {
                        // 检查是否有效的响应
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // 克隆响应以缓存
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    }
                );
            })
    );
});
