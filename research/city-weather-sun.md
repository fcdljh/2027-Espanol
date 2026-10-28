# 跨年三城气候与天气预报

核查时间：2026-10-29T00:07:32+08:00。距离 2026-12-29—2027-01-06 仍较远，当前不存在可信的逐日天气预报，不能把月平均写成当天温度。手机页面仅在目的地日期进入未来 7 天后向 [Open-Meteo](https://open-meteo.com/en/docs) 请求该日最高、最低和最大降水概率；数据缺失、断网或日期不符时显示无法获取，预报按西班牙本地日期和目的城市展示，不是沿途天气。出发前和当天优先查看 AEMET 官方预报和预警。

| 参考站（机场） | 月份 | 平均日最高 / 平均日最低 | 资料 |
|---|---|---|---|
| Barcelona 机场 | 12月 | 14.3 / 5.7 °C | [AEMET](https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?l=0076) |
| Barcelona 机场 | 1月 | 13.6 / 4.7 °C | 同上 |
| Sevilla 机场 | 12月 | 16.6 / 7.3 °C | [AEMET](https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?l=5783) |
| Sevilla 机场 | 1月 | 16.0 / 5.7 °C | 同上 |
| Granada 机场 | 1月 | 13.0 / 0.0 °C | [AEMET](https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?l=5530E) |

这些是 1981–2010 机场站气候平均值，非市中心或山区的预测，不是日最高或最低的边界。格拉纳达清晨、山坡和宫殿园区更应分层保暖；全程准备防风防雨外层与防滑鞋。

逐日官方入口：[Barcelona](https://www.aemet.es/es/eltiempo/prediccion/municipios/barcelona-id08019) · [Sevilla](https://www.aemet.es/es/eltiempo/prediccion/municipios/sevilla-id41091) · [Granada](https://www.aemet.es/es/eltiempo/prediccion/municipios/granada-id18087)。AEMET 页面为未来 7 天与部分逐小时预报，具体日期进入范围后再查。

## 当前行程的日落与冬季机位

`sun-winter-20261029`｜[sunrise-sunset.org](https://sunrise-sunset.org/api) 天文计算，2026-10-29T00:22:09+08:00 查询；以下均为 Europe/Madrid 当地时间的约数，不代表云量、山脊遮挡或晚霞预报。巴塞罗那 12/29–30 约 17:30；塞维利亚 12/31 约 18:15、1/1 约 18:16、1/2 约 18:17；格拉纳达 San Nicolás 1/3 约 18:09、阿宫 1/4 约 18:10；巴塞罗那 1/5 约 17:35。实地建筑阴影可能更早出现。

1/3 观景台可争取 17:15 左右到达，但只在交通准时和天气适合的情况下执行；积雪和红霞不是保证。1/1 西班牙广场可用拱廊、瓷砖长椅与桥作为画面框架，雨天以防滑和保暖为先。12/30 高迪大道在圣家堂与圣保罗之间，安排在原步行路线上，避免为了日落临时跨城或上山。照片参考与限制见[冬季拍照研究](xhs/winter-photo-20261029.md)。

> 历史资料：下方为旧 2027 年 1 月底路线，仅存档；其日落日期、三人安排不得套用于本次。

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
