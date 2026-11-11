# 绞胎纹路生成器

省赛新闻传播赛道演示工具：瓷器器型设计 + 绞胎纹样起草，导出 PNG，生成 AI 提示词，并用「匠人筛选卡 / 对照台」完成「AI 起草 → 人工筛选」流程。

## 在线使用（扫码）

- 云端推荐：https://jiaotai-pattern-generator.pages.dev/
- 三阶入场：`index.html`（历史 → 交互绞泥 → 进入本体）
- 纹样生成器：`studio.html`
- 全流程定制：`process.html`（选土→出窑，个性化原创工艺卡）
- 扫码页：`share.html`

## 本地怎么用

1. 打开 `index.html` 走三阶入场，或直接打开 `studio.html` / `process.html`
2. 在「25 种瓶型」中选择：多管瓶、蟠龙瓶、净瓶、盘口瓶、花口瓶、抱月瓶、转心瓶、冬瓜瓶、琮式瓶、荸荠瓶、灯笼瓶、天球瓶、玉壶春瓶、梅瓶、橄榄瓶、胆瓶、瓜棱瓶、柳叶瓶、莱菔瓶、贯耳瓶、葫芦瓶、蒜头瓶、棒槌瓶、观音瓶、象腿瓶
3. 调节腹径、口沿、足高、釉光；选择纹样、泥色与绞制参数
4. 预览可在「瓷器器型 / 纯纹样 / 截面证明」间切换
5. 点「生成设计」；可「导出 PNG」或「收入对照」
6. 复制「AI 提示词」到即梦 / Midjourney 等做二次细化（标注为辅助设计）

## Agnes AI 生图（密钥安全 / 可脱离电脑）

线上云端：https://jiaotai-pattern-generator.pages.dev/ （Cloudflare Pages + Function，密钥在云端 Secret）
GitHub Pages 也会请求上述 /generate，电脑关机也能生图。

本机备用：python proxy/agnes_proxy.py → http://127.0.0.1:8787/



## 说明

- 本工具输出的是**设计草稿**，不替代手工绞胎与工坊授权。
- 筛选结论供团队讨论，最终以匠人实操为准。
