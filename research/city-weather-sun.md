# 三城日落与一月底天气参考

最后核验/生成：2026-10-11T00:56:53+08:00。本文服务于新路线 **Barcelona → Granada → Seville → Barcelona**，不是 2027 年逐日天气预报。日落时间按 `Europe/Madrid` 冬季当地时间估算；出发前 T-14/T-1 重新查看天气、云量、降雨、风和能见度。

## 当前日期的日落窗口

| 城市 | 日期 | 日落参考 | 现场用法 |
|---|---|---:|---|
| Barcelona | 1/26 | 约18:00 | 到达日只有入住完成且体力允许才在住宿/Sants附近短走 |
| Barcelona | 1/27–1/29 | 约18:00–18:04 | D2/D3按主线安排；D4长途出发，不为日落跨区 |
| Granada | 1/29–1/31 | 约18:36–18:38 | D4只走Cathedral/Gran Vía平地；不为日落走长坡 |
| Seville | 1/31–2/2 | 约18:48–18:50 | D6到达日可做Plaza短线；D8离开日不追加观光 |
| Barcelona | 2/2–2/3 | 约18:09–18:11 | D8返程定位后不安排市内游；D9零观光 |

代表性 API 入口：[Barcelona 2027-01-26](https://api.sunrise-sunset.org/json?lat=41.3874&lng=2.1686&date=2027-01-26&formatted=0)、[Granada 2027-01-29](https://api.sunrise-sunset.org/json?lat=37.1773&lng=-3.5986&date=2027-01-29&formatted=0)、[Seville 2027-01-31](https://api.sunrise-sunset.org/json?lat=37.3891&lng=-5.9845&date=2027-01-31&formatted=0)。路线源文件的每日 `sun` 字段由 `route_tools.py sun --write` 生成。

## 一月底气候基线

以下为 AEMET 1981–2010 正常值尺度，仅用于穿衣和删减判断，不代表具体天气。

| 参考站 | 月平均 | 平均最高 | 平均最低 | 执行提示 |
|---|---:|---:|---:|---|
| Barcelona Airport | 9.2°C | 13.6°C | 4.7°C | 海风/降雨会影响D1和D3街拍，准备防雨外层与室内替换 |
| Granada Airport | 6.5°C | 13.0°C | 0.0°C | 早晚最冷；Alhambra按保暖、防滑和坐下休息设计 |
| Sevilla Airport | 10.9°C | 16.0°C | 5.7°C | 适合D6抵达短线，但雨天仍直接删除户外模块 |

来源：[AEMET Barcelona](https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?k=cat&l=0076)、[AEMET Granada](https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?l=5530E)、[AEMET Sevilla](https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?l=5783)。若链接字段或页面路径变化，以 AEMET 当前页面为准。

## 现场切换

- 转场日最低目标是正常抵达、入住/寄存、补水吃饭和熟悉街区；citywalk始终是 `optional`。
- 雨、晚点、行李异常、找站困难或父母疲劳任一出现，删除户外短线，不影响核心预约。
- Barcelona：雨天保留 Sagrada/已购室内建筑；不要为了海边、山上或城市天际线冒险。
- Granada：雨天留在 Cathedral、Royal Chapel、Gran Vía；不走石板坡道和观景台。
- Seville：雨天先保留 Alcázar/Cathedral，把 Plaza、河岸、Triana、Setas 改为可删模块。
- 2/2：抵达 Barcelona 后只做返程路线确认与休息；不把日落当作必须拍摄的节点。
