/*
 * 三城地图数据入口
 * 页面只读取这里的城市视窗、显示门槛和 GeoJSON 要素，不内置旅游、安全或住宿结论。
 * 长期展示数据请放入对应城市的 features / content，并用 evidence[].record_id 链接研究记录；
 * 单次预览可在页面导入 GeoJSON，临时数据不会写回此文件。
 * 原始小红书体验仍只保留在研究记录；通过官方来源二次核验的结论可进入可视化信息层。
 */
window.CITY_ATLAS_DATA = {
  schemaVersion: 3,
  displayPolicy: {
    mode: "confirmed_only",
    xhs: {
      enabled: false,
      requiresSecondReview: true,
      label: "原始小红书内容暂不进入生产地图"
    },
    note: "只有明确确认或带 officially_verified 证据的内容才可显示；原始小红书体验需二次确认，已由官方来源核验的结论可展示。"
  },
  researchCoverage: {
    label: "小红书研究覆盖度（仅元数据）",
    sourceLabel: "小红书研究总索引",
    sourceUrl: "../xhs/README.md",
    checkedOn: "2026-09-26",
    note: "覆盖度表示已阅读篇数，不等同于事实核验或地图可展示状态。",
    topics: [
      { id: "citywalk", label: "Citywalk / 路线" },
      { id: "photo", label: "拍照" },
      { id: "architecture", label: "建筑历史" },
      { id: "transit", label: "交通" },
      { id: "food", label: "美食日常" },
      { id: "accommodation", label: "住宿区域" }
    ],
    cities: {
      barcelona: { citywalk: 10, photo: 10, architecture: 10, transit: 0, food: 0, accommodation: 0, reviewed: 30, target: 60, partial: 1 },
      granada: { citywalk: 7, photo: 10, architecture: 10, transit: 10, food: 0, accommodation: 0, reviewed: 37, target: 60, partial: 0 },
      seville: { citywalk: 10, photo: 10, architecture: 10, transit: 10, food: 10, accommodation: 10, reviewed: 60, target: 60, partial: 1 }
    }
  },
  cities: {
    barcelona: {
      label: "巴塞罗那",
      roman: "Barcelona",
      center: [41.390, 2.170],
      zoom: 13,
      core: [[41.365, 2.138], [41.421, 2.196]],
      wide: [[41.285, 2.055], [41.425, 2.205]],
      features: [],
      officialResources: [
        { label: "Barcelona TMB 地铁图（项目资料）", url: "official/barcelona-tmb-metro-2026.pdf", sourceType: "official_map_asset", evidenceStatus: "source_checked", note: "官方图件入口；不等同于当前班次、票价或临时调整。" },
        { label: "Barcelona TMB 公交图（项目资料）", url: "official/barcelona-tmb-bus-2024.pdf", sourceType: "official_map_asset", evidenceStatus: "source_checked", note: "项目内留存的官方交通图；运营信息仍需出行前复核。" }
      ],
      content: {
        transit: {
          display_status: "confirmed",
          summary: "已确认的机场与市内交通边界：T-casual 为 10 次票，同一时刻只能一人使用，不能用于 L9 Sud 的机场地铁；Aerobus 为独立票制，官方当前单程 €7.75、往返 €13.30；R2/R2 Nord 属于机场铁路选项。2027 年具体票价、班次和换乘仍需按日期复核。",
          evidence: [
            { record_id: "xhs-barcelona-6a4ca5970000000021021caa", record_url: "../xhs/barcelona.md", source_name: "TMB · T-casual", source_type: "official_operator", source_url: "https://www.tmb.cat/en/barcelona-fares-metro-bus/t-casual", checked_at_hkt: "2026-09-26", evidence_status: "officially_verified" },
            { record_id: "xhs-barcelona-6a4ca5970000000021021caa", record_url: "../xhs/barcelona.md", source_name: "TMB · 机场地铁", source_type: "official_operator", source_url: "https://www.tmb.cat/en/visit-barcelona/public-transport/metro-airport", checked_at_hkt: "2026-09-26", evidence_status: "officially_verified" },
            { record_id: "xhs-barcelona-6a4ca5970000000021021caa", record_url: "../xhs/barcelona.md", source_name: "Aerobus Barcelona", source_type: "official_operator", source_url: "https://aerobusbarcelona.es/en/", checked_at_hkt: "2026-09-26", evidence_status: "officially_verified" },
            { record_id: "xhs-barcelona-6a4ca5970000000021021caa", record_url: "../xhs/barcelona.md", source_name: "Rodalies de Catalunya", source_type: "official_operator", source_url: "https://rodalies.gencat.cat/en/tarifes/servei_rodalia_barcelona/", checked_at_hkt: "2026-09-26", evidence_status: "officially_verified" }
          ]
        },
        notes: []
      }
    },
    granada: {
      label: "格拉纳达",
      roman: "Granada",
      center: [37.177, -3.594],
      zoom: 14,
      core: [[37.162, -3.624], [37.194, -3.576]],
      wide: [[37.175, -3.790], [37.205, -3.575]],
      features: [],
      officialResources: [
        { label: "Granada 旅游图（项目资料）", url: "official/granada-tourist-map-2026.pdf", sourceType: "official_map_asset", evidenceStatus: "source_checked", note: "官方图件入口；不等同于当前开放时间、票价或交通规则。" },
        { label: "Granada 街区图（项目资料）", url: "official/granada-street-map-2023.pdf", sourceType: "official_map_asset", evidenceStatus: "source_checked", note: "项目内留存的官方/运营资料；需按出行日期复核。" }
      ],
      content: {
        transit: {
          display_status: "confirmed",
          summary: "已确认的交通入口：Metro de Granada 当前官网列出可充值卡 €0.30、当前补贴钱包票 €0.49、单程 €1.35、往返 €2.70 和 1 日票 €4.50；Rober 当前线路页列出 C30、C31、C32、C34、C35，未列 C33；机场线 0245 连接 Granada–Aeropuerto。具体卡种、多人使用、站点、班次、支付、行李、换乘和 2027 施工仍需按日期复核。",
          evidence: [
            { record_id: "xhs-granada-68e62d7400000000030383ae", record_url: "../xhs/granada.md", source_name: "Metro de Granada · 费率", source_type: "official_operator", source_url: "https://www.metropolitanogranada.es/tarifas", checked_at_hkt: "2026-09-26", evidence_status: "officially_verified" },
            { record_id: "xhs-granada-6a71c7c6000000002500a19e", record_url: "../xhs/granada.md", source_name: "Transportes Rober · 线路", source_type: "official_operator", source_url: "https://www.transportesrober.com/flotamovimiento/lineas.htm", checked_at_hkt: "2026-09-26", evidence_status: "officially_verified" },
            { record_id: "xhs-granada-6a71c7c6000000002500a19e", record_url: "../xhs/granada.md", source_name: "Transportes Rober · C30 改道公告", source_type: "official_operator", source_url: "https://www.transportesrober.com/pdf/07.26%20CAMBIO%20ITINERARIO%20C30.pdf", checked_at_hkt: "2026-09-26", evidence_status: "officially_verified" },
            { record_id: "xhs-granada-6a97c6a8000000002900e056", record_url: "../xhs/granada.md", source_name: "Granada 0245 · 官方线路信息", source_type: "official_operator", source_url: "https://siu.ctagr.es/horarios_lineas_tabla.php?from=1&linea=1112", checked_at_hkt: "2026-09-26", evidence_status: "officially_verified" },
            { record_id: "xhs-granada-6a97c6a8000000002900e056", record_url: "../xhs/granada.md", source_name: "ALSA · Granada-Jaén 机场连接", source_type: "official_operator", source_url: "https://www.alsa.com/en/airports/granada-jaen", checked_at_hkt: "2026-09-26", evidence_status: "officially_verified" }
          ]
        },
        notes: [
          {
            display_status: "confirmed",
            category: "attraction",
            title: "Alhambra 官方参观约束（当前核验）",
            text: "Alhambra General 当前官方售票页显示 €22.27；冬季（10 月 15 日–3 月 31 日）开放 08:30–18:00；Nasrid Palaces 按票面时段入场并需携带原件身份证明；当前普通票规不支持改期或退款。官方访客说明允许摄影，但不得使用闪光灯、三脚架或独脚架。2027 票价、放票和临时开放仍需按日期复核。",
            evidence: [
              { record_id: "xhs-granada-68e205b1000000000700f5b1", record_url: "../xhs/granada.md", source_name: "Alhambra 官方售票页", source_type: "official_attraction", source_url: "https://tickets.alhambra-patronato.es/en/producto/alhambra-general/", checked_at_hkt: "2026-09-26", evidence_status: "officially_verified" },
              { record_id: "xhs-granada-69324797000000001e01194b", record_url: "../xhs/granada.md", source_name: "Alhambra 官方访客说明", source_type: "official_attraction", source_url: "https://www.alhambra-patronato.es/en/visit/organize-your-visit/time-of-the-visit", checked_at_hkt: "2026-09-26", evidence_status: "officially_verified" }
            ]
          }
        ]
      }
    },
    seville: {
      label: "塞维利亚",
      roman: "Seville",
      center: [37.387, -5.991],
      zoom: 14,
      core: [[37.371, -6.015], [37.403, -5.969]],
      wide: [[37.370, -6.020], [37.425, -5.875]],
      features: [],
      officialResources: [
        { label: "Seville TUSSAM 公交图（官方页面）", url: "https://www.tussam.es/sites/default/files/2026-01/Plano2026_EN.pdf", sourceType: "official_provider_page", evidenceStatus: "source_checked", note: "官方运营方图件入口；班次、票价和临时调整仍需出行前复核。" }
      ],
      content: {
        transit: {
          display_status: "confirmed",
          summary: "已确认的机场接驳边界：EA 单程 €6、往返 €8；银行卡可支付；机场专用单程票不能换乘普通 TUSSAM。Aena 当前页面列出约 04:30–00:05（去市区）和 05:22–01:00（去机场），具体日期、返程班次和票种规则仍需复核。",
          evidence: [
            { record_id: "xhs-seville-6a535b9d000000000702efc2", record_url: "../xhs/seville.md", source_name: "Aena · Seville Airport EA", source_type: "official_operator", source_url: "https://www.aena.es/en/sevilla/getting-there/bus.html", checked_at_hkt: "2026-09-26", evidence_status: "officially_verified" },
            { record_id: "xhs-seville-690db283000000000503a1db", record_url: "../xhs/seville.md", source_name: "Aena · EA 时刻与支付", source_type: "official_operator", source_url: "https://www.aena.es/en/sevilla/getting-there/bus.html", checked_at_hkt: "2026-09-26", evidence_status: "officially_verified" }
          ]
        },
        notes: [
          {
            display_status: "confirmed",
            category: "attraction",
            title: "塞维利亚景点运营信息（当前核验）",
            text: "Real Alcázar 当前冬季开放 09:30–17:00；Cathedral 普通票网上 €13、现场 €14；Setas 官方当前 09:30–01:00，00:15 最后入场，门票 €16 起。预约、临时调整和 2027 具体安排仍需按日期复核。",
            evidence: [
              { record_id: "xhs-seville-6a6b6aad000000003301c158", record_url: "../xhs/seville.md", source_name: "Real Alcázar 官方参观页", source_type: "official_attraction", source_url: "https://alcazarsevilla.org/prepara-la-visita/", checked_at_hkt: "2026-09-26", evidence_status: "officially_verified" },
              { record_id: "xhs-seville-6a535b9d000000000702efc2", record_url: "../xhs/seville.md", source_name: "Seville Cathedral 官方时刻与费率", source_type: "official_attraction", source_url: "https://www.catedraldesevilla.es/en/cultural-visit/schedules-and-rates/", checked_at_hkt: "2026-09-26", evidence_status: "officially_verified" },
              { record_id: "xhs-seville-6ab1e00e00000000360199a0", record_url: "../xhs/seville.md", source_name: "Setas de Sevilla 官方页", source_type: "official_attraction", source_url: "https://setasdesevilla.com/", checked_at_hkt: "2026-09-26", evidence_status: "officially_verified" }
            ]
          }
        ]
      }
    }
  }
};
