# Design QA

## Comparison target

- Source visual truth: `qa/source-combined-ui.png`（由已选的 2+3 综合视觉稿复制，原始生成图为 853 × 1844 px）
- Implementation: 本地 Vite 原型 `http://127.0.0.1:4173/`
- Implementation evidence: Codex Desktop in-app Browser 的 `[data-testid="device-screen"]` 内容屏幕截图，捕获于 2026-09-26 HKT；截图已在 QA 回合中显示。Cua 截图 API 不提供可写入项目的文件路径，因此没有伪造文件路径。
- Viewport: 393 × 852 CSS px，deviceScaleFactor 1；浏览器外层被放大到 1800 × 1800，以确保手机内容屏幕按 1:1 CSS 尺寸渲染。
- State: iPhone runtime，默认 D7（2027-02-01，塞维利亚），`今日安排` Tab，0 / 13 步，未滚动。

## Evidence reviewed

- Full-view: 比较了源视觉稿的顶部塞维利亚图、双 Tab、路线图、D7 日期块、今日清单、吃饭/拍照入口、绿色下一步条和底部导航，与实现的同一状态。
- Focused regions: 重点检查了双 Tab 的 selected/unselected 状态、路线图裁切、D7 清单第一屏、勾选圆点、下一步条和固定底部导航；这些区域决定“今日安排 / 当前步骤”是否能快速跟随。
- Interactions tested: `当前步骤` Tab 切换；点击“完成这一步”后自动推进到下一条；返回“今日安排”；D7 → D8 日期切换；D7 的完成状态可撤销并写入本机 localStorage；地图链接以新标签方式打开；快捷入口能进入吃饭/拍照对应步骤。
- Console: in-app Browser Dev Logs checked after interactions，error/warn 为空。

## Findings

没有发现可阻塞交付的 P0、P1 或 P2 问题。

### Required fidelity surfaces

- Fonts and typography: 实现沿用综合稿的“中文衬线大标题 + 清晰无衬线操作文字”层级；正文被限制在移动端舒适的短行宽，时间、标签和复核提示使用较小但仍可点击/读取的层级。
- Spacing and layout: 页面保持源稿的“顶图 → 双 Tab → 旅日选择 → 路线 → 今日标题 → 时间线 → 快捷入口 → 下一步 → 底部导航”顺序；列表使用轻分隔线而不是卡片嵌套，底部导航不遮住可滚动内容。
- Colors and tokens: 米白、砖红、鼠尾草绿、浅杏色和地图蓝被抽成 CSS tokens；当前 Tab、完成状态、出发前复核使用不同语义颜色，文本对比足以支撑操作。
- Image quality and asset fidelity: 顶部图、路线图和 tapas 缩略图均为真实 raster 资产，已放入 `public/assets/trip/`；没有用 CSS 绘图、手写 SVG 或占位块替代综合稿中的图像。Radix Icons 用于操作图标，保持同一图标族。
- Copy and content: UI 采用实际 `plan.geo.json` 的 9 天时间线；动态门票、开放时间、车次和餐厅状态保留“出发前复核”边界，没有伪装成已确认。

## Comparison history

- Initial pass: 未发现 P0/P1/P2；无需为视觉 QA 进行修复迭代。
- Post-fix evidence: 不适用；交互回归和控制台检查在同一实现上通过。

## Follow-up polish

- P3：如果后续需要更接近综合稿，可把底部三项快捷导航扩展为四项（例如加入“我的行程”），但当前两个主 Tab 已覆盖用户要求的核心工作流，因此不构成阻塞。
- P3：可在真实出发日期确定后，把默认 D7 改成用户当天，并为各城市补充更多官方机位/餐厅跳转入口。

final result: passed

Media filter follow-up: the photo shortcut now uses a downloaded human-pose reference; the hero remains a city-skyline visual and the food shortcut remains a food image. Architecture-only images are not used as photo references.
