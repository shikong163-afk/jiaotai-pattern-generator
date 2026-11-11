# 绞胎纹路生成器

省赛新闻传播赛道演示工具：瓷器器型设计 + 绞胎纹样起草，导出 PNG，生成 AI 提示词，并用「匠人筛选卡 / 对照台」完成「AI 起草 → 人工筛选」流程。

## 在线使用（扫码）

- 生成器：仓库 GitHub Pages 的 `index.html`
- 全流程定制：`process.html`（选土→出窑，个性化原创工艺卡）
- 扫码页：同站点的 `share.html`（展示二维码，手机直接扫）

部署后地址形如：

`https://<你的用户名>.github.io/jiaotai-pattern-generator/`

## 本地怎么用

1. 用浏览器打开 `index.html`（双击即可）
2. 在「25 种瓶型」中选择：多管瓶、蟠龙瓶、净瓶、盘口瓶、花口瓶、抱月瓶、转心瓶、冬瓜瓶、琮式瓶、荸荠瓶、灯笼瓶、天球瓶、玉壶春瓶、梅瓶、橄榄瓶、胆瓶、瓜棱瓶、柳叶瓶、莱菔瓶、贯耳瓶、葫芦瓶、蒜头瓶、棒槌瓶、观音瓶、象腿瓶
3. 调节腹径、口沿、足高、釉光；选择纹样、泥色与绞制参数
4. 预览可在「瓷器器型 / 纯纹样 / 截面证明」间切换
5. 点「生成设计」；可「导出 PNG」或「收入对照」
6. 复制「AI 提示词」到即梦 / Midjourney 等做二次细化（标注为辅助设计）

## Agnes AI 生图（密钥安全）

API Key **绝不能**写进前端或推到 GitHub。本仓库用代理保管密钥：

1. 复制 `proxy/.env.example` 为 `proxy/.env`，填入你的 `AGNES_API_KEY`
2. 本地启动：`python proxy/agnes_proxy.py`（默认 `http://127.0.0.1:8787`）
3. 网页通过 `config.js` 里的 `JIAOTAI_AGNES_PROXY` 调用代理；密钥不会出现在浏览器源码里
4. 线上公网可用 Cloudflare Worker：见 `worker/`，用 `wrangler secret put AGNES_API_KEY` 注入密钥，再把 `config.js` 改成 Worker 的 `/generate` 地址

代理不可用时，前端会自动回退 Pollinations 免费生图。

若 Key 曾出现在聊天/截图里，请到 Agnes 控制台**立刻重置**。

## 说明

- 本工具输出的是**设计草稿**，不替代手工绞胎与工坊授权。
- 筛选结论供团队讨论，最终以匠人实操为准。
