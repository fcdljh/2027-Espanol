# 三城地图接口与数据格式

本目录负责地图数据接口、中文地图查看器和可下载的官方地图文件。它不负责调研结论的撰写，也不从零推断住宿、安全或景点建议。

## 当前状态

- [打开中文交互地图](city-atlas.html)：三个城市的图层接口已准备好；目前 `city-data.js` 中三个城市的 `features` 均为空，所以地图底图加载后不会出现研究标记。
- [长期地图展示数据](city-data.js)：保存地图所需的名称、坐标、图层及证据引用；它是地图展示数据源，不替代 `research/` 中的原始研究记录。
- [官方地图文件](official/)：按城市分类保存的交通图、旅游图和街区图。
- [KML 导出](city-atlas.html)：页面根据当前已接入数据即时导出。`three-cities-orientation.kml` 只保留空城市文件夹，不含点位。
- 原[三城旅行速查](../archive/三城地图与出行住宿安全速查-2026-09-25-retired.md)已退出当前指南；其中内容仅作历史记录，不作为当前建议或地图数据。

## 数据流与文件职责

```text
research/ 的调研记录与来源
        ↓ 通过稳定 record_id 引用
city-data.js 的地图展示要素与中文字段
        ↓
city-atlas.html 交互地图 / 即时 KML 导出
```

地图要素将显示字段和来源引用放在同一 GeoJSON Feature 中，便于查看者追溯到原始记录。不要把整篇研究日志复制进地图，也不要把地图页面或 KML 当成证据源。

## GeoJSON 要素格式

长期要素保存在 `city-data.js` 中对应城市的 `features` 数组。采用 GeoJSON `Feature` / `FeatureCollection`，坐标遵循 `[经度, 纬度]`。点、线、多线、多边形和多多边形均可显示。每个 Feature 需要稳定的 `id`、`properties.cityId`、`properties.layer`、展示名称和至少一条带有效 `record_id` 的 `evidence` 引用。

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
    "evidence": [
      {
        "record_id": "replace-with-existing-research-record-id",
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

以上 ID、名称、链接和时间均为格式示例占位值，不能当作真实研究记录。`record_id` 必须先存在于相应研究记录中；不得为了填满地图字段而编造 ID 或时间。旧字段 `sources`、`sourceUrl` 仍为导入兼容格式，但页面会提示缺少研究记录 ID；新增长期要素使用 `evidence`。

支持的 `cityId`：`barcelona`、`granada`、`seville`，也接受城市中文名。支持的 `layer`：`zone`、`sight`、`transit`、`stay`、`market`、`souvenir`、`safety`、`route`。这些字段只决定显示位置和图层类别，不会自动生成推荐、危险等级或安全结论。`status`、`details` 可用于展示原始记录中的属性，不应替来源作解释。

## 城市补充资料

交通说明和补充卡片仍以数据接口形式保留，引用也采用相同的证据对象。这里不预填城市建议。

```js
content: {
  transit: {
    summary: "由来源记录支持的展示文字",
    evidence: [{
      record_id: "replace-with-existing-research-record-id",
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

- 页面“导入 GeoJSON”只用于临时查看；刷新后临时内容会清除。导入后页面显示缺少 `record_id` 的要素数量。
- 正式数据必须写入 `city-data.js`，并同时更新其来源研究记录；不要只在页面临时导入。
- 页面“保存 KML”按当前三个城市数据即时导出。KML 是衍生文件，不应手动维护或当作数据源。
- 底图需要联网；地图查看器、接口和本地官方地图文件可离线打开，在线地图瓦片除外。
