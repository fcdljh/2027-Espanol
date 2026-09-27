# 四城日落与一月底天气参考

最后核验：2026-09-27T15:44:51+08:00（HKT）。这是为 2027-01-26 至 2027-02-02 转场日 citywalk 服务的气候参考，不是 2027 年逐日天气预报。日落时间按 `Europe/Madrid` 冬季当地时间换算；出发前 T-14/T-1 仍需重新看天气、云量、降雨、风和能见度。

## 计划日期的日落窗口

来源为 [Sunrise-Sunset API](https://sunrise-sunset.org/api)，输入各城市中心坐标和计划日期；`civil_twilight_end` 是日落后民用暮光结束，适合把“晚霞/回酒店”截止线写进现场卡。时间为当地时间，API 原始结果为 UTC 后换算为 CET（UTC+1）。

| 城市 | 日期范围 | 日落 | 民用暮光结束 | 适合的现场动作 |
|---|---|---|---|---|
| Madrid | 1/26 | 18:26 | 18:54 | 只作为落地、转车和住宿缓冲；若当天进城，不追正式景点 |
| Barcelona | 1/26–1/29 | 18:00–18:04 | 18:29–18:32 | 约 17:00 后做 Sants/住处附近短线、街拍、晚餐；1/26 若 17:00 左右到酒店仍可完整拍一段晚霞 |
| Granada | 1/29–1/31 | 18:36–18:38 | 19:02–19:04 | 抵达日优先中心平地、街巷和晚餐；不要为了日落临时走 Albaicín 长坡 |
| Seville | 1/31–2/2 | 18:48–18:50 | 19:14–19:16 | 抵达日可安排 Plaza de España/酒店周边；2/2 转 Madrid 前只保留短线，不追远端日落 |
| Madrid | 2/2 | 18:35 | 19:02 | 只在抵达早且不影响第二天机场节点时安排附近晚餐/短走，不把 Madrid 改成观光日 |

代表性查询链接：[Madrid 2027-01-26](https://api.sunrise-sunset.org/json?lat=40.4168&lng=-3.7038&date=2027-01-26&formatted=0)、[Barcelona 2027-01-26](https://api.sunrise-sunset.org/json?lat=41.3874&lng=2.1686&date=2027-01-26&formatted=0)、[Granada 2027-01-29](https://api.sunrise-sunset.org/json?lat=37.1773&lng=-3.5986&date=2027-01-29&formatted=0)、[Seville 2027-01-31](https://api.sunrise-sunset.org/json?lat=37.3891&lng=-5.9845&date=2027-01-31&formatted=0)。

## AEMET 一月历史气候正常值

以下为西班牙国家气象局 AEMET 页面公开的 1981–2010 正常值，作为“往年一月底”尺度参考；它描述整月气候，不代表某个具体日期。`T/TM/Tm` 分别为月平均、日最高温平均、日最低温平均；降雨日为月内降水量至少 1 mm 的平均天数；日照为月平均总小时。

| 城市/参考站 | T | TM | Tm | 月降水 | 降雨日 | 霜冻日 | 日照小时 | 计划提示 |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Madrid Retiro | 6.3°C | 9.8°C | 2.7°C | 33 mm | 5.7 | 6.2 | 149 | 早晚冷，通勤日按保暖外层和可撤销晚车预案准备 |
| Barcelona Airport | 9.2°C | 13.6°C | 4.7°C | 37 mm | 3.7 | 1.4 | 151 | 温度较温和但海风/降雨会明显影响晚霞和体感，保留室内替换 |
| Granada Airport | 6.5°C | 13.0°C | 0.0°C | 42 mm | 5.6 | 16.8 | 168 | 早晚最需要保暖；Alhambra 和抵达晚间都按低温、结露/霜冻风险准备 |
| Sevilla Airport | 10.9°C | 16.0°C | 5.7°C | 66 mm | 6.1 | 1.8 | 183 | 四城中最适合抵达日傍晚 citywalk，但降雨量/降雨日不应忽略 |

来源：[AEMET Madrid Retiro](https://www.aemet.es/es/web/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?k=mad&l=3195)、[AEMET Barcelona Airport](https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?k=cat&l=0076)、[AEMET Granada Airport](https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?l=5530E)、[AEMET Sevilla Airport](https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?l=5783)。AEMET 页面标注的正常值时期为 1981–2010；AEMET 另说明其气候监测自 2023 年起采用 1991–2020 标准正常值，因此本表只作保守历史参照，不能替代临行天气。

## 对行程的执行含义

- 转场日的最低目标是“正常抵达、入住/寄存、补水吃饭、熟悉街区”，不是零游览；安全抵达后按日落倒排 60–120 分钟低风险 citywalk。
- 任何有独立车票、行李异常或入住尚未完成的日子，都不安排不可错过的正式预约；日落模块是可删的 `optional`，不是错过就影响全程的 `pinned`。
- 1/26 Madrid→Barcelona：当前 07:25 落地候选若约 17:00 到酒店，仍能在 Barcelona 日落前后拍一段住处/车站—街区短线；若最终中午到达 Madrid，优先晚车安全到 Barcelona，不为赶日落冒险压缩入境缓冲。
- Granada 1/29、Seville 1/31、Madrid 2/2 的跨城日均预留“到达城市第一段”：先熟悉酒店周边、主广场或平地老城，再决定是否继续；雨天立即切换室内咖啡/市场/商场或酒店附近餐饮。
