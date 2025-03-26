// scripts/cache-handler.js
class CacheHandler {
    constructor() {
        this.VIDEO_URLS = [
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
    }

    async checkCacheStatus() {
        if (!navigator.serviceWorker) return;
        try {
            const cache = await caches.open('scratch-videos-v2');
            const requests = await cache.keys();
            return {
                cachedCount: requests.length,
                totalCount: this.VIDEO_URLS.length
            };
        } catch (error) {
            console.error('检查缓存状态失败:', error);
            return null;
        }
    }

    async updateCache() {
        if (!navigator.serviceWorker) return false;
        try {
            const reg = await navigator.serviceWorker.ready;
            return new Promise((resolve) => {
                const channel = new MessageChannel();
                channel.port1.onmessage = (e) => {
                    if (e.data.status === 'complete') {
                        resolve(true);
                    }
                };
                reg.active.postMessage(
                    { action: 'UPDATE_VIDEOS' },
                    [channel.port2]
                );
            });
        } catch (error) {
            console.error('缓存更新失败:', error);
            return false;
        }
    }

    async clearCache() {
        try {
            return await caches.delete('scratch-videos-v2');
        } catch (error) {
            console.error('清除缓存失败:', error);
            return false;
        }
    }
}

// 导出单例实例
export const cacheHandler = new CacheHandler();
