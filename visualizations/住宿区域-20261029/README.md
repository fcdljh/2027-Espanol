# 三城住宿搜索区域地图

生成日期：2026-10-29，地图范围与绘制参数见 `areas.json`。底图为 © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)。阴影是根据小红书住宿经验、行程位置与携程搜索位置绘制的近似搜索区域，不是行政或安全边界；橙点是交通或景点参照，并不代表酒店。资料链接见 `areas.json`，对应记录 `xhs-stay-area-bcn-6969ede2`、`xhs-stay-area-svq-6a005f4b`、`xhs-granada-692ee3c4000000001e035bc0`。

重新生成需 Python 3、Pillow、系统中文字体和访问 OpenStreetMap 地图瓦片：`python3 render.py`；也可传入 `barcelona`、`seville` 或 `granada` 只生成一个城市。
