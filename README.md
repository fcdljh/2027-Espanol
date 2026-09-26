# 手机 Chrome 版旅行攻略

这里是可以直接部署到 HTTPS 静态托管的真实手机网页，不依赖 React、Node 或数据库。它与上一级 `trip-guide-ui/` 的手机框预览共用同一份 `plan.geo.json` 数据，但本目录本身就是可发布目录。

如果上一级 `public/plan.geo.json` 有更新，先在 `trip-guide-ui/` 目录执行 `npm run sync:site`（或等价的 `node scripts/sync-static-site.mjs`），再发布本目录，避免网页包仍显示旧行程。

## 给两位旅伴的使用方式

1. 打开网页后先选当天的 `D01–D09`。
2. 只看“当前步骤”：点“打开导航”，到达后点“完成当前步骤”。
3. 首页会直接显示今天走动公里数、住宿预算上限和 `112`；“两位旅伴只要记住这四件事”里可以展开步行、预算、延误和安全说明。
4. 右上角“大字”会保存设置；当天、Tab 和当前步骤也会保存，下次打开会回到上次位置。

“可删”不是必须完成的任务。两位旅伴累了、晚到或下雨时，先删“可删”，不需要把少走的路补回来。

## 推荐使用方式

优先用 HTTPS 地址打开，而不是双击 `index.html`：

```bash
python3 -m http.server 8080 --directory trip-guide-ui/site
```

然后在 vivo Chrome 打开同一局域网可访问的地址。正式旅行建议使用 GitHub Pages 或 Cloudflare Pages；打开一次后，Service Worker 会缓存核心页面、路线图和进度壳，断网时仍可查看已经载入的攻略。交通、营业时间、票价和天气仍要以出发前及当天官方信息为准。

## 三种托管选择

### A. GitHub Pages：默认推荐

适合这份不含个人证件、支付信息的静态攻略。将仓库推到 GitHub 后，用 GitHub Actions 将 `trip-guide-ui/site/` 发布到 Pages；生成地址通常是 `https://<账号>.github.io/<仓库名>/trip-guide-ui/site/` 或者将该目录作为发布根目录。GitHub Pages 是静态 HTML/CSS/JS 托管，不需要保持 peilab 在线。

GitHub Actions 的最小思路：

1. 在仓库 Settings → Pages 选择 GitHub Actions。
2. 工作流 checkout 仓库，把 `trip-guide-ui/site` 上传为 Pages artifact。
3. 部署完成后，用 vivo Chrome 打开 Actions 输出的 HTTPS 地址。

如果以后给项目绑定自定义域名，`manifest.webmanifest` 和 Service Worker 的相对路径仍可工作，不要把 `start_url` 改成带仓库名的绝对路径。

### B. Cloudflare Pages：第二推荐

适合希望自动预览、自动部署，或者未来要加访问控制的情况。可以连接 GitHub/GitLab，也可以把这个目录直接上传：

```bash
npx wrangler pages deploy trip-guide-ui/site --project-name spain-winter-guide
```

命令会需要 Cloudflare 的账号认证；不要把 API Token 写进仓库或本地项目文件。Cloudflare Pages 提供 `pages.dev` HTTPS 地址，适合手机使用。

### C. peilab + ngrok：临时预览

适合给同行快速看当前版本，不适合当旅行当天唯一入口，因为它依赖 peilab 在线、端口转发和 ngrok 会话：

```bash
python3 -m http.server 8080 --directory /path/to/Espanol/trip-guide-ui/site
ngrok http 8080
```

不要把含有未公开住宿、航班订单或个人信息的页面通过公开 tunnel 暴露。若确实需要临时分享，使用 ngrok 的认证/访问策略；没有固定域名时，重启 tunnel 后 URL 也可能变化。

## vivo Chrome 使用检查清单

- 首次打开后等待页面载入，再在 Chrome 菜单选择“添加到主屏幕”或“安装应用”。
- 允许网页使用离线存储；不要在系统设置里清除 Chrome 的站点数据，否则会清掉步骤完成进度。
- 地图按钮会打开 Google Maps；交通、营业时间、票券和天气是动态信息，攻略中的“待复核”标记不能被离线缓存替代。
- 若 Chrome 没有显示安装按钮，仍可正常使用网页；使用 Chrome 菜单的“添加到主屏幕”即可。
