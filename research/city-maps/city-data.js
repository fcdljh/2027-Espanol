/*
 * 三城地图数据入口
 * 页面只读取这里的城市视窗和 GeoJSON 要素，不内置旅游、安全或住宿结论。
 * 长期展示数据请放入对应城市的 features / content，并用 evidence[].record_id 链接研究记录；
 * 单次预览可在页面导入 GeoJSON，临时数据不会写回此文件。
 */
window.CITY_ATLAS_DATA = {
  schemaVersion: 1,
  cities: {
    barcelona: {
      label: "巴塞罗那",
      roman: "Barcelona",
      center: [41.390, 2.170],
      zoom: 13,
      core: [[41.365, 2.138], [41.421, 2.196]],
      wide: [[41.285, 2.055], [41.425, 2.205]],
      features: [],
      content: { transit: { summary: "", evidence: [] }, notes: [] }
    },
    granada: {
      label: "格拉纳达",
      roman: "Granada",
      center: [37.177, -3.594],
      zoom: 14,
      core: [[37.162, -3.624], [37.194, -3.576]],
      wide: [[37.175, -3.790], [37.205, -3.575]],
      features: [],
      content: { transit: { summary: "", evidence: [] }, notes: [] }
    },
    seville: {
      label: "塞维利亚",
      roman: "Seville",
      center: [37.387, -5.991],
      zoom: 14,
      core: [[37.371, -6.015], [37.403, -5.969]],
      wide: [[37.370, -6.020], [37.425, -5.875]],
      features: [],
      content: { transit: { summary: "", evidence: [] }, notes: [] }
    }
  }
};
