# 手机 Chrome 版旅行攻略

这里是可以直接部署到 HTTPS 静态托管的真实手机网页，不依赖 React、Node 或数据库。它与上一级 `trip-guide-ui/` 的手机框预览共用同一份 `plan.geo.json` 数据，但本目录本身就是可发布目录。

如果上一级 `public/plan.geo.json` 有更新，先在 `trip-guide-ui/` 目录执行 `npm run sync:site`（或等价的 `node scripts/sync-static-site.mjs`），再发布本目录，避免网页包仍显示旧行程。

公开验收地址：<https://fcdljh.github.io/2027-Espanol/>。页面调试和三位旅伴的日常使用都以此公开地址为准，不使用 `localhost`、`127.0.0.1` 或其他本地预览地址。

## 给三位旅伴的使用方式

1. 打开网页后先选当天的 `D01–D09`。
2. 只看“当前步骤”：先确认卡片上的目的地，再选择“从当前位置步行 / 公共交通 / 驾车”，到达后点“完成当前步骤”。没有锁定单一地址的早餐、候选餐厅或住宿区域不会生成模糊地图入口。
3. 底部“出发前”会打开签证办理时间线、北京/香港材料 checklist、随身/托运行李和出发前最后一晚清单。
4. 首页顶部直接显示今天走动公里数；只有存在明确目的地或行动的下雨/晚到备用安排，才会放在页面底部的安全与应急上方。签证和行李统一从底部“出发前”进入，不在当天页面重复提醒。安全与应急包含 112、简短安全动作和保险政策核对。住宿和景点卡片直接显示已有价格，尚未锁定的价格会明确标注待官方放票或复核。
5. 页面默认采用易读字号；当天、Tab、当前步骤和“出发前”勾选进度会保存在这台手机上。
6. 每个城市的“住宿入口”只打开已有的 Airbnb、Trip.com、携程或机场官方页面，不创建订单；“打卡参考图”带对应小红书原帖，点击按钮会复制分享链接并唤起小红书 App。

行程会在出发前按预约、交通、住宿和体力安排定稿。出发后只按当天路线执行；如果需要删改内容，请在“出发前”页面完成，不在当天行程里临时处理。

## 地图、住宿与参考图

`plan.geo.json` 中的 `stops` 是导航目的地和每日街巷图的来源。每天的“今天在哪里走”都会显示真实街道底图、所在城区关系、编号停靠点、相机参考点和按既定点位生成的彩色路线；跨城日拆成两个局部图，避免把不同城市压成一张看不懂的线图。底图为静态构建的 OpenStreetMap 瓦片并保留署名，路线图由 `scripts/build-daily-route-maps.mjs` 生成。页面另外把明确地点生成 Google Maps Directions 链接，并省略起点，让 Google Maps 使用手机当前位置；每个明确地点都提供步行、公共交通和驾车/打车三种方式。日程中的候选餐厅、住宿区域和补给安排如果没有确定地址，会明确显示“地点未单独锁定”。住宿沿用已有含税/页面价，景点时间线使用 `ticket_price` 显示已核验的当前参考价或明确的待放票状态。

住宿候选沿用 `hotels[].options[]` 的供应商链接，显示为可复核入口而不是预订按钮。`photo-references.json` 保存三城每城 10 篇小红书参考帖、已归档的动作图，以及按城市/机位分类的公开授权景点图。公开图都记录作者、许可和来源页，页面不会把它们标成小红书照片；它们只帮助理解城市空间、建筑比例和可能的机位。小红书按钮点击时复制分享链接，同时使用官方 `xhsdiscover://item/<note_id>` 深链唤起手机 App，未安装 App 才回退网页。开放时间、门票和现场限制仍看官方页面。

## 出发前视图

签证与行李内容保存在 `pre-departure.json`，发布前由 `scripts/sync-static-site.mjs` 从 `public/` 同步到 `site/`。签证规则和机场安检规则均带官方入口与查询日期；页面不会保存护照号、申请号、保单号或支付资料。最终清单仍需在递交/值机前按当期官方页面复核。

## 推荐使用方式

统一在 vivo Chrome 打开[公开 GitHub Pages 地址](https://fcdljh.github.io/2027-Espanol/)。页面内容变更后，先同步 `public/` 到 `site/`、运行检查并提交；完成已授权的 GitHub Pages 发布后，重新加载公开地址确认新内容已经出现。公开地址没有更新，就不能视为本次页面修改完成。Service Worker 会缓存核心页面、每日街巷图、路线图和进度壳，断网时仍可查看已经载入的攻略；交通、营业时间、票价和天气仍要以出发前及当天官方信息为准。

## 三种托管选择

### A. GitHub Pages：默认推荐

适合这份不含个人证件、支付信息的静态攻略。当前项目的固定公开地址是 `https://fcdljh.github.io/2027-Espanol/`；用 GitHub Actions 将 `trip-guide-ui/site/` 发布到 Pages。GitHub Pages 是静态 HTML/CSS/JS 托管，不需要保持 peilab 在线。

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
