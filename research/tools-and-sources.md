# 旅行工具与平台调研

调研快照：2026-09-25。以下信息来自当时查阅的 GitHub 项目与说明文档；候选工具不等于已安装、已连接或经过实时验证的服务。项目总目录见根目录 README.md。

## 初步调研记录

- **行程规划：**[trip-planner-skill](https://github.com/skywain/trip-planner-skill) 可按当前开放时间和价格设计行程、比较航班并提供预订链接；其说明将预订和付款留给旅客。
- **行程整理：**[wanderlog-mcp](https://github.com/shaikhspeare/wanderlog-mcp) 可创建或编辑 Wanderlog 行程、地点、酒店条目、备注和清单。它是非官方集成，使用 Wanderlog 私有网页 API 和登录会话 Cookie。
- **酒店：**[TourMind Hotel Booking AI MCP](https://github.com/tourmind-com/Hotel-Booking-AI-MCP) 提供托管 MCP 和配套 Skill；公开搜索可用，订单操作需要 user_key。该 MCP 仓库提供产品契约和 Skill，并不包含服务端实现。[DIDA 全球版](https://github.com/DIDA-AI/Dida-Hotel-MCP-Global)和[中国版](https://github.com/DIDA-AI/Dida-hotel-MCP-CN)项目介绍了酒店搜索；自助 API key 模式的工具少于包含预订/付款功能的 OAuth 商务模式。[WinWin.travel](https://github.com/WinWin-travel/MCP-server)和[1Stay](https://github.com/STAYKER-COM/1Stay-mcp)说明了托管住宿预订流程与外部结账链接。
- **民宿：**[StayingAPI Hotel MCP](https://github.com/stayingapi/hotel-mcp) 可搜索或比较 Airbnb、Booking.com、Vrbo 和 Google Hotels 的价格，但其文档列出的工具为只读。另一个 [Airbnb MCP](https://github.com/markswendsen-code/mcp-airbnb) 声称支持浏览器预订；它保存 Airbnb 会话 Cookie 并使用浏览器自动化，因此不应作为默认可信方案。
- **景点和门票：**[GetYourGuide MCP](https://github.com/chrischall/getyourguide-mcp)、[Viator MCP](https://github.com/chrischall/viator-mcp) 和 [TicketLens MCP](https://github.com/ticketlens/ticketlens-experiences-mcp) 主要提供搜索、详情或库存查询；其文档没有说明可完成常规购票。[Last Minute Deals](https://github.com/OyaAIProd/lastminutedeals-api)介绍了较窄范围临近出发活动的结账/预订流程，实际使用前仍需确认服务是否可用。

比较集成时，应区分实时搜索/库存、创建预订和付款。价格、取消条款和票务库存应在供应方页面复核。本次行程只纳入明确写有免费取消及截止时间的住宿价格；若预算内没有符合条件的选择，应说明限制并询问是否考虑例外，不能默认推荐不可退款住宿。

## 按用途的适配与尽调排序

**快照：2026-09-25。**按用途分组排序：先看本次行程的适配度，再看供应方来源和交易流程是否清楚，最后参考近期维护情况。Star/Fork 数仅作弱社区信号。GitHub 数据于该日刷新；没有实时调用 MCP、预订或付款，因此以下排序不代表服务保证。

### 行程规划与行程存储

1. **[trip-planner-skill](https://github.com/skywain/trip-planner-skill)**：最适合 2027 年 Barcelona–Granada–Seville 行程的规划工具，可设计路线和逐日安排、核对日期/价格/开放时间、查询签证官方信息、比较航班、整理酒店候选并提供预订链接。**40 stars；最近推送 2026-09-05；MIT。**不负责预订或付款。
2. **[wanderlog-mcp](https://github.com/shaikhspeare/wanderlog-mcp)**：可选的行程写入工具。**137 stars / 56 forks；最近推送 2026-09-14；MIT。**README 提到测试和覆盖率。可靠性取决于 Wanderlog 私有网页 API 和登录会话 Cookie；只有接受这类依赖时再考虑。

### 酒店

1. **[TourMind Hotel Booking AI](https://github.com/tourmind-com/Hotel-Booking-AI) 与 [其 MCP 包](https://github.com/tourmind-com/Hotel-Booking-AI-MCP)**：个人使用场景中功能较完整，支持实时搜索/报价，并记录了订单/付款操作。Skill 仓库有 **6 stars**，MCP 包有 **0 stars**；两者最近推送日期都是 **2026-09-09**。服务托管于外部；MCP 仓库包含 Skill/契约而非服务端源代码；订单操作需要 user_key。功能匹配较高，但独立验证较少。
2. **[DIDA Global MCP](https://github.com/DIDA-AI/Dida-Hotel-MCP-Global) / [DIDA China MCP](https://github.com/DIDA-AI/Dida-hotel-MCP-CN)**：在这些候选中，供应方背景较清楚；README 将服务标注为 DIDA/RollingGo 自有产品。全球版 **82 stars，最近推送 2026-09-08，MIT**；中国版 **10 stars，最近推送 2026-08-26，MIT**。自助 API key 模式记录了搜索/详情/标签功能；预订和付款工具属于 OAuth 商务模式，个人用户能否完成交易是主要限制。
3. **[WinWin.travel MCP](https://github.com/WinWin-travel/MCP-server)**：提供搜索、创建预订、付款链接和订单状态查询。**11 stars；最近推送 2026-08-25；MIT。**可作为托管服务备选，但服务与库存由供应商运营，尚未独立测试。
4. **[1Stay MCP](https://github.com/STAYKER-COM/1Stay-mcp)**：说明支持搜索、结账预订、订单查询和取消。**3 stars；最近推送 2026-09-23；GitHub 未识别 SPDX 许可证。**近期维护较积极，但社区验证有限。

**TourMind 商务产品应单独看待：**[Tourmind-Booking-Skills](https://github.com/tourmind-com/Tourmind-Booking-Skills) 有 **1,257 stars / 206 forks**，最近推送 **2026-09-24**，声明 MIT；但它需要商务 Skill Token。上述数字不能证明个人版 TourMind MCP 端点可靠。

### 民宿

1. **[StayingAPI Hotel MCP](https://github.com/stayingapi/hotel-mcp)**：适合对比 Airbnb/Vrbo/Booking.com；**1 star；最近推送 2026-07-21；MIT。**文档列出的工具为只读，并使用供应方额度，预订需在其他平台完成。
2. **[mcp-airbnb](https://github.com/markswendsen-code/mcp-airbnb)**：README 声称支持浏览器预订，但可靠性较弱：**0 stars；最近推送 2026-03-16；未识别许可证**；会保存 Airbnb 会话 Cookie，并采用浏览器自动化和反机器人规避方式。不建议作为默认方案。

### 景点门票与活动

1. **[GetYourGuide MCP](https://github.com/chrischall/getyourguide-mcp)**：活动发现首选，可通过合作伙伴 API 查询选项和库存。**0 stars；最近推送 2026-09-23；MIT。**只读；维护者称项目由 AI 开发/维护，需在供应方页面核实结果。
2. **[Viator MCP](https://github.com/chrischall/viator-mcp)**：提供类似的搜索/库存查询和预订链接。**1 star；最近推送 2026-09-23；未识别许可证**；维护者也称由 AI 开发。只读。
3. **[TicketLens MCP](https://github.com/ticketlens/ticketlens-experiences-mcp)**：覆盖较广的门票/活动搜索。**1 star；最近推送 2026-09-12；Apache-2.0。**没有文档说明其提供购票/结账工具，社区验证较少。
4. **[Last Minute Deals](https://github.com/OyaAIProd/lastminutedeals-api)**：文档记录了实际活动结账流程，但**0 stars；最近推送 2026-04-26；MIT**，库存偏向临近出发活动，不适合提前规划这次 2027 年 1–2 月行程；临近出行时可重新确认服务状态。

## 本次行程的实用候选

- 用 **trip-planner-skill** 做规划；确定出发日后，按三人总成本比较北京和香港集合方案。
- 酒店调研可比较 **TourMind 个人版 MCP**（个人预订流程较直接）和 **DIDA**（供应方背景较清楚，但交易工具受商务模式限制）。搜索结果不代表已预订。
- 民宿可用 **StayingAPI** 做初筛，再到实际平台核实和预订。
- 景点发现可用 **GetYourGuide/Viator**；购票预计仍需到供应方页面完成。只有确实需要把行程写入 Wanderlog 时，才考虑依赖其私有 API 和会话 Cookie 的集成。

## 项目内工具与连接状态

以下工具于 2026-09-25 安装或配置在本项目中，没有写入用户级/全局 Codex 配置。

- **行程规划 Skill：**.agents/skills/trip-planner/，来源为 [skywain/trip-planner-skill](https://github.com/skywain/trip-planner-skill)。可指导调研行程、航班比较、交通、住宿候选和预订链接；明确不代替用户预订、付款或保留名额。Skill 本身不需要登录或 API key。
- **机票搜索 Skill：**.agents/skills/airfare-search/。只读比较公开票价来源；不得使用浏览器 Cookie 或保存的凭证，也不负责预订/付款。
- **酒店 Skill 与 MCP：**.agents/skills/hotel-booking-ai/ 和 .codex/config.toml 连接 TourMind 托管 ToC MCP。文档称公开搜索、房价和库存查询不需认证或 API key。订单操作需要 TourMind user key；项目没有保存或配置此 key，且本地 Skill 禁止在聊天中索要或把 key 存入项目文件。因此当前不能通过这套配置预订、取消或付款；如之后决定预订，应在卖家自己的结账页操作。
- **景点/活动搜索 MCP：**.codex/config.toml 连接 TicketLens 托管 MCP。文档没有要求用户登录/API key，可查询体验和门票，但不完成购买；购票前应在景点或卖家官网核验。
- **未连接/可选：**StayingAPI 需要 OAuth/账户额度；GetYourGuide 需要合作伙伴 API key。目前规划不依赖它们，也未连接。除非后续明确选择，否则不要注册或提供凭证。

**旅客当前无需提供账号登录、注册或 API key。**Codex 可能需要先信任本项目并加载项目级 MCP 配置，才能使用托管酒店/门票搜索工具；这是项目连接步骤，不等于注册第三方账户。预订平台若要求账户，由旅客在其官网自行处理。

MCP 配置文件属于本项目，仅在 Codex 信任该项目后加载。依赖上游仓库或服务前应重新确认状态；连接搜索 MCP 不等于验证房源/票价真实性、实时库存或预订成功。
