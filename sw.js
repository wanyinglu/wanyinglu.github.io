const CACHE_NAME = 'test-v1';
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(() => console.log('安装成功'))
    );
});
