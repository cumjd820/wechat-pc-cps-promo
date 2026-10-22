# 微信小游戏 CPS 导流试点站（静态）

用网站做落地获客（**导流分成 / CPS**），**不做**发行联运。页面只负责展示与引导用户前往微信客户端（手机 / PC）畅玩，**不** iframe 嵌小游戏，**不**冒充腾讯 / 微信官方。

## 目录结构

```text
pc-web-promo-site/
├── index.html                 # Top 20 合集首页
├── legal.html                 # 说明与免责
├── README.md
├── g/
│   └── {appid}.html           # 单游落地页（20 个）
└── assets/
    ├── css/site.css
    ├── img/qr-placeholder.svg # 二维码占位
    └── js/
        ├── config.js          # CPS_PARAM 等全局配置
        ├── games-data.js      # Top 20 数据（可由脚本重生成）
        └── app.js             # UA 分流、卡片、复制等
```

## 如何改 CPS

编辑 `assets/js/config.js`：

```js
CPS_PARAM: 'YOUR_CPS_PARAM',  // ← 换成服务商后台下发的真实参数
```

改这一处后，`buildCpsPath()` 会生成 `?wxgamepro=你的参数`，供后续接入小程序码 / URL Link / 开放标签时统一使用。

网页自身的投放 UTM（如 `?utm_source=`）请与 `wxgamepro` **分开**，不要混写。

## 本地预览

在本目录启动静态服务（相对路径，无构建工具）：

```bash
cd /workspace/cps-games/pc-web-promo-site
python3 -m http.server 8080
```

浏览器打开：

- 首页：<http://127.0.0.1:8080/>
- 示例落地页：<http://127.0.0.1:8080/g/wx141bfb9b73c970a9.html>

也可用任意静态服务器；直接用 `file://` 打开时，部分浏览器可能限制远程图片，建议仍用 `http.server`。

## 上线到 Cloudflare Pages（简要）

1. 将本目录作为静态站点根目录推送到 Git，或用 Wrangler / Dashboard **直接上传**该文件夹。
2. Cloudflare Pages → Create project → 连接仓库或 Upload assets。
3. **Build 命令留空**（无构建）；Output directory 填 `/` 或项目根。
4. 绑定自定义域名并开启 HTTPS。
5. 上线前把 `CPS_PARAM` 换成真实值；唤起 / 二维码按下一节接入。

免备案域名选型见同级文档 `../free-no-icp-domain-options.md`（另案）。

## 后续如何换真实二维码

1. 在服务商 / 微信开放后台生成**带参**小程序码或 URL Link，path/query 含：
   `?wxgamepro=` + `SITE_CONFIG.CPS_PARAM`（与 `buildCpsPath()` 一致）。
2. 将生成的图片放到例如 `assets/img/qr/{appid}.png`。
3. 替换各落地页中 `.qr-frame img` 的 `src`，或在 `app.js` / 数据里增加 `qrUrl` 字段后统一渲染。
4. 若使用 URL Link：把链接写入 `SITE_CONFIG`（可按 appid 映射），并在 `deepLinkEnabled: true` 后让主 CTA 跳转；未配置前保持「待配置」。

**不要**编造未文档化的 `weixin://` deep link。

## 数据更新

Top 20 来自：

- 精选顺序：`../pc-web-promo-games-selected.csv`（UTF-8 BOM 已按 `utf-8-sig` 处理）
- logo / banner：`../2026-10-21_微信小游戏CPS游戏库.xlsx` 的「全部游戏」表

可用 Python + openpyxl 按同样逻辑重写 `assets/js/games-data.js`，再按需重跑单页生成脚本。

## 合规要点

- 页脚固定文案：「第三方推广落地页，游戏由微信小游戏提供，非腾讯官方」
- **不对 C 端展示**新用户 / 回流分成百分比（仅 `data-share-*` 或注释保留）
- 棋牌类投放前按当地规范审核
