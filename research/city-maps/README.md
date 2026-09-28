# 三城地图接口与数据格式

本目录负责地图数据接口、中文地图查看器、研究可视化台和可下载的地图文件。它不替代 `research/` 与 `trip/` 中的原始记录，也不从零推断住宿、安全或景点建议。

## 当前状态

- [打开中文交互地图](city-atlas.html)：在原有地图和图层接口上扩展了本次行程的 16 个规划点位/路线，并在同一页面增加“资料总览 → 资料工作台”。默认先展示按用途分组的日程、住宿、餐饮和灵感入口，以及从 canonical 计划数据读取的下一步核对事项；进入详细页后可按城市范围、关键词和分类筛选。每日攻略按“城市 → 日期”组织 9 天的酒店、景点、交通、餐饮、雨天替代和晚到删减规则。规划点位使用 `display_scope: "itinerary_plan"` 单独标注为候选，不伪装成 2027 年已确认的营业、票价、库存或班次；地图仍按确认门槛显示官方资料。研究台可浏览三城全部 201 条小红书记录，原始小红书内容只以“已阅读线索 / 需复核”呈现，不进入地图或 KML。
- 地图底图使用 OpenFreeMap 公共服务，不需要 API key、账号或注册；地图瓦片需要联网。双击 `open-city-map.command` 会以项目根目录启动临时网页服务，并打开 `http://localhost:<端口>/research/city-maps/city-atlas.html`，从而让研究记录、计划文件和官方资料的相对链接保持可用。保持终端窗口打开；关闭终端或按 Ctrl+C 即停止服务。直接双击 HTML 以 `file://` 打开时，浏览器的本地文件跨域限制可能阻止 WebGL 地图资源加载。这个服务会让项目根目录下的文件可被浏览；不要直接用它对不受信任的公网分享，公开分享请使用精简副本或静态托管。
- [长期地图展示数据](city-data.js)：保存地图所需的名称、坐标、图层、显示门槛、覆盖度元数据、官方资料入口及证据引用；它是地图展示数据源，不替代 `research/` 中的原始研究记录。
- [研究数据生成脚本](build-atlas-research-data.py)：从 `plan.geo.json`、`research/xhs/`、住宿快照和 `trip/dining.md` 生成页面数据适配层。
- [页面研究数据适配层](atlas-research-data.js)：生成文件，不要手动编辑；包含 201 条小红书索引、60 条住宿快照和 16 个行程规划地图要素。重新研究或修改计划后运行生成脚本刷新它。
- [官方地图文件](official/)：按城市分类保存的交通图、旅游图和街区图。
- [KML 导出](city-atlas.html)：页面根据当前可显示的地图/规划要素即时导出；不导出原始小红书记录、住宿快照或餐饮策略。`three-cities-orientation.kml` 仍只保留空城市文件夹，不含点位。
- 原[三城旅行速查](../archive/三城地图与出行住宿安全速查-2026-09-25-retired.md)已退出当前指南；其中内容仅作历史记录，不作为当前建议或地图数据。

## 数据流与文件职责

```text
research/ 的调研记录与来源 + plan.geo.json + trip/dining.md
        ↓ 通过稳定 record_id 引用；生成脚本保留来源与核验状态
atlas-research-data.js（页面适配层） ← build-atlas-research-data.py
        ↓                           ↘ 研究台：每日攻略 / 住宿比价 / 美食策略 / 小红书灵感
city-data.js（官方/长期地图展示要素）
        ↓
city-atlas.html 交互地图 / 即时 KML 导出
```

地图要素将显示字段和来源引用放在同一 GeoJSON Feature 中，便于查看者追溯到原始记录。不要把整篇研究日志复制进地图，也不要把地图页面或 KML 当成证据源。

## GeoJSON 要素格式

长期要素保存在 `city-data.js`（当前 `schemaVersion: 3`）中对应城市的 `features` 数组。采用 GeoJSON `Feature` / `FeatureCollection`，坐标遵循 `[经度, 纬度]`。点、线、多线、多边形和多多边形均可显示。每个 Feature 需要稳定的 `id`、`properties.cityId`、`properties.layer`、展示名称和至少一条带有效 `record_id` 的 `evidence` 引用。

本次路线规划要素由 `build-atlas-research-data.py` 根据 `plan.geo.json` 生成到 `atlas-research-data.js`，不会改写 `city-data.js`。它们带有 `display_status: "planned"` 与 `display_scope: "itinerary_plan"`，属于当前行程候选层；页面会在信息卡中明确提醒仍需按日期核验。修改 `plan.geo.json` 后应重新运行生成脚本，而不是手动改生成文件。

```json
{
  "type": "Feature",
  "id": "replace-with-stable-map-feature-id",
  "geometry": {
    "type": "Point",
    "coordinates": [0, 0]
  },
  "properties": {
    "cityId": "barcelona",
    "layer": "sight",
    "nameZh": "中文显示名称",
    "nameLocal": "Local name",
    "description": "由调研记录支持的展示说明",
    "display_status": "confirmed",
    "evidence": [
      {
        "record_id": "replace-with-existing-research-record-id",
        "record_url": "",
        "source_name": "来源名称",
        "source_type": "other",
        "source_url": "",
        "checked_at_hkt": null,
        "evidence_status": "unverified"
      }
    ]
  }
}
```

以上 ID、名称、链接和时间均为格式示例占位值，不能当作真实研究记录。`record_id` 必须先存在于相应研究记录中；不得为了填满地图字段而编造 ID 或时间。可选的 `record_url` 指向项目内对应研究记录，地图标记可直接打开；`source_url` 指向原始来源。旧字段 `sources`、`sourceUrl` 仍为导入兼容格式，但页面会提示缺少研究记录 ID；新增长期要素使用 `evidence`。

支持的 `cityId`：`barcelona`、`granada`、`seville`，也接受城市中文名。支持的 `layer`：`zone`、`sight`、`transit`、`stay`、`market`、`souvenir`、`safety`、`route`。这些字段只决定显示位置和图层类别，不会自动生成推荐、危险等级或安全结论。`status`、`details` 可用于展示原始记录中的属性，不应替来源作解释。

页面默认读取 `displayPolicy.mode: "confirmed_only"`。官方地图要素只有在 `properties.display_status` 明确为 `confirmed` / `officially_verified`，或其全部证据为 `evidence_status: "officially_verified"` 时才显示；本次行程规划层是带 `display_scope: "itinerary_plan"` 的明确例外。来源类型、来源字段或 URL 直接指向小红书的要素，在地图与 KML 中始终隐藏，但会在研究台保留原文链接、摘要、可借鉴、冲突/复核提示和完整字段。已经从小红书线索中提取、并由官方来源核验的结论，可以用官方证据对象接入 `content` 信息卡，但不得把作者路线、体验、住宿或主观评价写成已确认事实。

## 研究台数据范围

- “小红书”页默认显示三城 201 条记录，可按城市、类别和关键词筛选；每条记录保留原文、项目记录、阅读状态、摘要、可借鉴和原始字段。
- “每日攻略”页读取 `plan.geo.json` 的路线骨架、跨城/机场腿、逐日时间线、住宿候选、餐饮策略、雨天替代与晚到删减规则；可按城市和日期筛选，适合按天执行但不代表交通票、门票或住宿已经预订。
- “住宿比价”页只把 Trip.com/携程记录用于酒店比较，只把 Airbnb 记录用于民宿/旅馆展示；TourMind 快照保留在原始 CSV，但不进入推荐视图。默认严格显示 CNY 1,500/晚以内且满足免费取消等硬条件的可比记录；用户可以主动切换到条件/全部可比记录查看被排除原因。当前推荐卡中的价格仍是带核对时间的研究快照，不是预订确认。
- “美食策略”页把 `trip/dining.md` 的策略与相关小红书记录放在一起；营业、菜单、价格、排队和预约仍需临行复核。

## 城市补充资料

交通说明和补充卡片仍以数据接口形式保留，引用也采用相同的证据对象。这里不预填城市建议。

```js
content: {
  transit: {
    summary: "由来源记录支持的展示文字",
    evidence: [{
      record_id: "replace-with-existing-research-record-id",
      record_url: "",
      source_name: "来源名称",
      source_type: "other",
      source_url: "",
      checked_at_hkt: null,
      evidence_status: "unverified"
    }]
  },
  notes: [{ title: "卡片标题", text: "展示文字", evidence: [] }]
}
```

## 临时预览与导出

- 页面“导入 GeoJSON”只用于临时查看；刷新后临时内容会清除。导入后页面会分别提示缺少 `record_id` 和因确认门槛暂不显示的要素数量；被隐藏的内容不会进入 KML 导出。
- 正式官方地图数据必须写入 `city-data.js`，并同时更新其来源研究记录；本次行程规划和研究台数据应更新其 canonical 输入后重新运行生成脚本，不要只在页面临时导入或手动改生成文件。
- 页面“保存 KML”按当前三个城市数据即时导出。KML 是衍生文件，不应手动维护或当作数据源。
- `officialResources` 只提供已登记的官方地图/运营方入口，用于确认后的可视化测试；它不会自动生成路线、班次、票价、住宿或安全结论。当前 `content` 已接入少量带 `display_status: "confirmed"` 和 `evidence_status: "officially_verified"` 的交通/景点运营结论。`researchCoverage` 只展示小红书阅读覆盖度元数据，不代表事实已核验。
- 底图需要联网；地图查看器、接口和本地官方地图文件可离线打开，在线地图瓦片除外。

## 远程分享边界

- ngrok 可以把正在运行的本地服务临时转成公网 HTTPS 地址，但它不是网页托管：本地 Python 服务或 ngrok agent 停止、电脑休眠或网络中断，页面就会不可访问。Agent endpoint 的生命周期与 agent 进程绑定；需要固定地址时还要按 ngrok 当前方案配置静态/自有域名。
- 本地预览服务现在以项目根目录提供 `research/city-maps/city-atlas.html`，因此可用 `ngrok http <本地端口>` 做受控分享；但这样会让项目根目录的其他文件也可能被访问，不应直接用于不受信任的公开分享。
- 若目标是长期给其他人查看，应先生成只包含地图页面、研究台所需记录、官方资料和计划文件的精简副本，再部署到静态托管；不要把“ngrok 隧道一直开着”当成永久部署方案。
