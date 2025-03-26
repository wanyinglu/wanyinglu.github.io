# 角角向前冲 Scratch 游戏

[![GitHub Pages](https://img.shields.io/badge/在线访问-wanyinglu.github.io-blue)](https://wanyinglu.github.io)

## 项目特点
- 使用 Service Worker 缓存视频资源
- 响应式设计适配各种设备
- 动态粒子背景效果

## 技术栈
- HTML5/CSS3/JavaScript
- Particles.js 动画库
- Service Worker 离线缓存

## 开发说明
1. 视频资源缓存策略见 `sw.js`
2. 缓存管理逻辑在 `scripts/cache-handler.js`
3. 主页面为 `index.html`

## 注意事项
首次加载因视频缓存可能需要较长时间，后续访问会显著加快
