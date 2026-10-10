import { createRequire } from "node:module";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require("sharp");
} catch (error) {
  throw new Error(
    "This generator needs the bundled sharp package. Run it with NODE_PATH pointing to the workspace Node packages.",
    { cause: error }
  );
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
const planPath = path.join(projectDirectory, "public", "plan.geo.json");
const photoReferencesPath = path.join(projectDirectory, "public", "photo-references.json");
const outputDirectories = [
  path.join(projectDirectory, "public", "assets", "trip", "daily-maps"),
  path.join(projectDirectory, "site", "assets", "trip", "daily-maps")
];

const TILE_SIZE = 256;
const OUTPUT_WIDTH = 1200;
const OUTPUT_HEIGHT = 680;
const TILE_USER_AGENT = "EspanolTripGuide/1.0 (personal static build)";
const tileCache = new Map();
const routeCache = new Map();

const MAP_SPECS = [
  {
    date: "2027-01-26",
    slug: "d01-barcelona-arrival",
    description: "抵达日：只定位 Barcelona 机场到住宿的方向，不安排城市观光线。",
    panels: [
      {
        title: "Barcelona · 机场—住宿定位",
        zoom: 12,
        routeMode: "transfer",
        points: ["Barcelona–El Prat Airport（入境节点）", "Barcelona Sants（住宿交通节点）"],
        labels: {
          "Barcelona–El Prat Airport（入境节点）": "BCN 机场",
          "Barcelona Sants（住宿交通节点）": "Sants / 住宿方向"
        }
      }
    ]
  },
  {
    date: "2027-01-27",
    slug: "d02-barcelona-modernisme",
    description: "Barcelona 北侧现代主义轴线：圣家堂 → Avinguda Gaudí → Sant Pau。",
    panels: [
      {
        title: "Barcelona · 现代主义轴线",
        zoom: 15,
        points: ["Sagrada Família", "Sant Pau"],
        photo_spot_ids: ["sagrada-pool", "sant-pau-axis"],
        labels: { "Sagrada Família": "圣家堂", "Sant Pau": "Sant Pau" }
      }
    ]
  },
  {
    date: "2027-01-28",
    slug: "d03-barcelona-eixample",
    description: "Barcelona Eixample 与老城边缘：从格拉西亚大道沿街区向北短走。",
    panels: [
      {
        title: "Barcelona · Eixample 街区",
        zoom: 15,
        points: ["Casa Batlló", "Passeig de Gràcia"],
        photo_spot_ids: ["casa-batllo-corner", "passeig-gracia-axis"],
        labels: { "Casa Batlló": "巴特罗之家", "Passeig de Gràcia": "格拉西亚大道" }
      }
    ]
  },
  {
    date: "2027-01-29",
    slug: "d04-barcelona-granada",
    description: "跨城日：左图看 Barcelona Sants 出发位置，右图看 Granada 住处到大教堂的中心短线。",
    panels: [
      {
        title: "Barcelona · Sants 出发",
        zoom: 15,
        points: ["Barcelona departure"],
        labels: { "Barcelona departure": "Barcelona Sants" }
      },
      {
        title: "Granada · 到站定位",
        zoom: 15,
        points: ["Granada base"],
        labels: { "Granada base": "Granada 住宿方向" }
      }
    ]
  },
  {
    date: "2027-01-30",
    slug: "d05-granada-alhambra",
    description: "Granada 东南侧山坡定位：先看住处/市中心与 Alhambra 的相对方向，再按预约入口行动。",
    panels: [
      {
        title: "Granada · Alhambra 山坡",
        zoom: 15,
        points: ["Alhambra"],
        photo_spot_ids: ["generalife-window"],
        labels: { Alhambra: "Alhambra" }
      }
    ]
  },
  {
    date: "2027-01-31",
    slug: "d06-granada-seville",
    description: "跨城日：Granada 车站到 Seville 住宿的定位方向；抵达后短线按现场时间决定。",
    panels: [
      {
        title: "Granada → Seville · 跨城定位",
        zoom: 9,
        routeMode: "transfer",
        points: ["Granada departure", "Seville base"],
        labels: { "Granada departure": "Granada 车站", "Seville base": "Seville 住宿方向" }
      }
    ]
  },
  {
    date: "2027-02-01",
    slug: "d07-seville-old-town",
    description: "Seville 老城南侧：王宫 → 主教座堂 → Santa Cruz，沿街区关系理解今天的短线。",
    panels: [
      {
        title: "Seville · 老城核心",
        zoom: 15,
        points: ["Real Alcázar", "Cathedral and Giralda"],
        photo_spot_ids: ["alcazar-garden", "orange-court"],
        labels: { "Real Alcázar": "王宫", "Cathedral and Giralda": "主教座堂" }
      }
    ]
  },
  {
    date: "2027-02-02",
    slug: "d08-seville-barcelona",
    description: "返程缓冲日：Sevilla Santa Justa → Barcelona Sants，抵达后只做住宿和机场路线确认。",
    panels: [
      {
        title: "Seville · 车站出发",
        zoom: 8,
        points: ["Sevilla Santa Justa", "Barcelona Sants（返程定位）"],
        labels: { "Sevilla Santa Justa": "Santa Justa 车站", "Barcelona Sants（返程定位）": "Barcelona Sants" }
      },

    ]
  },
  {
    date: "2027-02-03",
    slug: "d09-barcelona-airport",
    description: "离境日：只定位 Barcelona 住宿到机场的方向，不安排临时观光。",
    panels: [
      {
        title: "Barcelona · 离境机场定位",
        zoom: 14,
        points: ["Barcelona–El Prat Airport（离境节点）"],
        labels: { "Barcelona–El Prat Airport（离境节点）": "BCN 机场" }
      }
    ]
  }
];

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function haversineKilometers(a, b) {
  const radius = 6371;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(value));
}

function project(lon, lat, zoom) {
  const scale = 2 ** zoom;
  const x = ((lon + 180) / 360) * scale * TILE_SIZE;
  const sine = Math.sin((lat * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * scale * TILE_SIZE;
  return { x, y };
}

function uniqueStops(points) {
  const groups = [];
  for (const point of points) {
    const group = groups.find((candidate) => haversineKilometers(candidate[0], point) < 0.08);
    if (group) group.push(point);
    else groups.push([point]);
  }
  return groups.map((group) => ({
    ...group[0],
    sourceNames: group.map((point) => point.name)
  }));
}

function routeKey(a, b) {
  return `${a.lon.toFixed(6)},${a.lat.toFixed(6)};${b.lon.toFixed(6)},${b.lat.toFixed(6)}`;
}

async function walkingRoute(a, b) {
  const key = routeKey(a, b);
  if (routeCache.has(key)) return routeCache.get(key);
  const straight = [[a.lon, a.lat], [b.lon, b.lat]];
  if (haversineKilometers(a, b) > 4) {
    routeCache.set(key, straight);
    return straight;
  }
  const url = `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=full&geometries=geojson`;
  try {
    const response = await fetch(url, { headers: { "user-agent": TILE_USER_AGENT } });
    if (!response.ok) throw new Error(`route ${response.status}`);
    const body = await response.json();
    const geometry = body.routes?.[0]?.geometry?.coordinates;
    const result = Array.isArray(geometry) && geometry.length > 1 ? geometry : straight;
    routeCache.set(key, result);
    await sleep(220);
    return result;
  } catch {
    routeCache.set(key, straight);
    return straight;
  }
}

async function fetchTile(zoom, x, y) {
  const worldSize = 2 ** zoom;
  const wrappedX = ((x % worldSize) + worldSize) % worldSize;
  const key = `${zoom}/${wrappedX}/${y}`;
  if (tileCache.has(key)) return tileCache.get(key);
  // Use the OSM.de mirror for the static build; keep the required OSM attribution
  // in every generated map so the published page has no runtime tile dependency.
  const url = `https://tile.openstreetmap.de/${zoom}/${wrappedX}/${y}.png`;
  let lastError;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { "user-agent": TILE_USER_AGENT } });
      if (!response.ok) throw new Error(`tile ${response.status}: ${url}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < 100) throw new Error(`empty tile: ${url}`);
      tileCache.set(key, buffer);
      return buffer;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await sleep(450 * (attempt + 1));
    }
  }
  throw lastError;
}

function viewportFor(points, zoom) {
  const projected = points.map((point) => project(point.lon ?? point[0], point.lat ?? point[1], zoom));
  let minX = Math.min(...projected.map((point) => point.x));
  let maxX = Math.max(...projected.map((point) => point.x));
  let minY = Math.min(...projected.map((point) => point.y));
  let maxY = Math.max(...projected.map((point) => point.y));
  let spanX = Math.max(640, maxX - minX);
  let spanY = Math.max(430, maxY - minY);
  const aspect = OUTPUT_WIDTH / OUTPUT_HEIGHT;
  if (spanX / spanY < aspect) spanX = spanY * aspect;
  else spanY = spanX / aspect;
  spanX *= 1.2;
  spanY *= 1.2;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  return {
    zoom,
    left: centerX - spanX / 2,
    top: centerY - spanY / 2,
    width: spanX,
    height: spanY
  };
}

async function buildTileBase(viewport) {
  const leftTile = Math.floor(viewport.left / TILE_SIZE);
  const topTile = Math.floor(viewport.top / TILE_SIZE);
  const rightTile = Math.floor((viewport.left + viewport.width) / TILE_SIZE);
  const bottomTile = Math.floor((viewport.top + viewport.height) / TILE_SIZE);
  const mosaicWidth = (rightTile - leftTile + 1) * TILE_SIZE;
  const mosaicHeight = (bottomTile - topTile + 1) * TILE_SIZE;
  const composites = [];
  for (let tileY = topTile; tileY <= bottomTile; tileY += 1) {
    for (let tileX = leftTile; tileX <= rightTile; tileX += 1) {
      const input = await fetchTile(viewport.zoom, tileX, tileY);
      composites.push({ input, left: (tileX - leftTile) * TILE_SIZE, top: (tileY - topTile) * TILE_SIZE });
    }
  }
  const mosaic = await sharp({
    create: {
      width: mosaicWidth,
      height: mosaicHeight,
      channels: 3,
      background: { r: 248, g: 244, b: 232 }
    }
  })
    .composite(composites)
    .png()
    .toBuffer();

  return sharp(await mosaic)
    .extract({
      left: Math.max(0, Math.round(viewport.left - leftTile * TILE_SIZE)),
      top: Math.max(0, Math.round(viewport.top - topTile * TILE_SIZE)),
      width: Math.min(mosaicWidth, Math.round(viewport.width)),
      height: Math.min(mosaicHeight, Math.round(viewport.height))
    })
    .resize(OUTPUT_WIDTH, OUTPUT_HEIGHT, { fit: "fill" });
}

function imagePoint(lon, lat, viewport) {
  const point = project(lon, lat, viewport.zoom);
  return {
    x: ((point.x - viewport.left) / viewport.width) * OUTPUT_WIDTH,
    y: ((point.y - viewport.top) / viewport.height) * OUTPUT_HEIGHT
  };
}

function routePath(coordinates, viewport) {
  return coordinates
    .map(([lon, lat], index) => {
      const point = imagePoint(lon, lat, viewport);
      return `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    })
    .join(" ");
}

function labelBox(point, label, index) {
  const width = Math.max(82, label.length * 15 + 26);
  const x = Math.min(OUTPUT_WIDTH - width - 14, Math.max(14, point.x + (index % 2 ? -width + 6 : 16)));
  const y = Math.min(OUTPUT_HEIGHT - 54, Math.max(64, point.y + (index % 2 ? 19 : -38)));
  return `
    <g class="map-label">
      <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${width.toFixed(1)}" height="30" rx="10" />
      <text x="${(x + 13).toFixed(1)}" y="${(y + 20).toFixed(1)}">${escapeXml(label)}</text>
    </g>
  `;
}

function marker(point, label, index) {
  return `
    <g class="map-marker">
      <circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="17" class="marker-halo" />
      <circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="11" class="marker-dot" />
      <text x="${point.x.toFixed(1)}" y="${(point.y + 4).toFixed(1)}" class="marker-number">${String(index + 1).padStart(2, "0")}</text>
    </g>
    ${labelBox(point, label, index)}
  `;
}

function photoMarker(point, label, index) {
  const width = Math.max(106, label.length * 14 + 30);
  const x = Math.min(OUTPUT_WIDTH - width - 14, Math.max(14, point.x - width / 2));
  const y = Math.min(OUTPUT_HEIGHT - 58, Math.max(82, point.y + (index % 2 ? 31 : -55)));
  return `
    <g class="photo-marker">
      <circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="13" class="photo-marker-ring" />
      <circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="8" class="photo-marker-dot" />
      <text x="${point.x.toFixed(1)}" y="${(point.y + 4).toFixed(1)}" class="photo-marker-icon">◎</text>
      <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${width.toFixed(1)}" height="27" rx="9" class="photo-label-box" />
      <text x="${(x + 11).toFixed(1)}" y="${(y + 18).toFixed(1)}" class="photo-label-text">${escapeXml(label)}</text>
    </g>
  `;
}

function mapOverlay({ panel, viewport, mapPoints, routes, photoPoints }) {
  const markerPoints = mapPoints.map((point) => imagePoint(point.lon, point.lat, viewport));
  const photoMarkerPoints = photoPoints.map((point) => imagePoint(point.lon, point.lat, viewport));
  const paths = routes.map((coordinates) => routePath(coordinates, viewport)).join(" ");
  const routeClass = panel.routeMode === "transfer" ? "route-line transfer-line" : "route-line";
  const labels = mapPoints.map((point, index) => {
    const label = panel.labels?.[point.sourceNames[0]] || point.label || point.name;
    return marker(markerPoints[index], label, index);
  }).join("");
  const arrowPoint = markerPoints.at(-1);
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${OUTPUT_WIDTH}" height="${OUTPUT_HEIGHT}" viewBox="0 0 ${OUTPUT_WIDTH} ${OUTPUT_HEIGHT}">
      <style>
        .wash{fill:#fff8e8;opacity:.32}.route-under{fill:none;stroke:#fff8e8;stroke-width:13;stroke-linecap:round;stroke-linejoin:round;opacity:.9}.route-line{fill:none;stroke:#b85f47;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1 0}.transfer-line{stroke-dasharray:16 11;opacity:.9}.map-label rect{fill:#fffaf0;fill-opacity:.94;stroke:#d8c5a6;stroke-width:1}.map-label text{fill:#284b42;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;font-size:15px;font-weight:700}.marker-halo{fill:#fffaf0;fill-opacity:.85;stroke:#b85f47;stroke-width:2}.marker-dot{fill:#b85f47;stroke:#fffaf0;stroke-width:3}.marker-number{fill:#fffaf0;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;font-size:9px;font-weight:800;text-anchor:middle}.photo-marker-ring{fill:#fffaf0;fill-opacity:.88;stroke:#2b7774;stroke-width:2}.photo-marker-dot{fill:#f3c965;stroke:#fffaf0;stroke-width:2}.photo-marker-icon{fill:#284b42;font-family:Georgia,serif;font-size:12px;font-weight:800;text-anchor:middle}.photo-label-box{fill:#eef7ef;fill-opacity:.96;stroke:#6ca69a;stroke-width:1}.photo-label-text{fill:#245d59;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;font-size:12px;font-weight:800}.map-title{fill:#284b42;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;font-size:15px;font-weight:800;letter-spacing:.04em}.map-note{fill:#5c6d65;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;font-size:11px}.north{fill:#b85f47;font-family:Georgia,serif;font-size:17px;font-weight:700}.attribution{fill:#5c6d65;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;font-size:10px}
      </style>
      <rect width="${OUTPUT_WIDTH}" height="${OUTPUT_HEIGHT}" class="wash" />
      ${paths ? `<path d="${paths}" class="route-under" /><path d="${paths}" class="${routeClass}" />` : ""}
      <g transform="translate(24 26)"><rect width="${Math.min(340, panel.title.length * 17 + 34)}" height="31" rx="11" fill="#fffaf0" fill-opacity=".94" stroke="#d8c5a6" /><text x="14" y="21" class="map-title">${escapeXml(panel.title)}</text></g>
      <g transform="translate(${OUTPUT_WIDTH - 48} 28)"><text class="north" text-anchor="middle">N</text><path d="M0 7 L-5 18 L0 15 L5 18 Z" fill="#b85f47" /></g>
      ${arrowPoint ? `<circle cx="${arrowPoint.x.toFixed(1)}" cy="${arrowPoint.y.toFixed(1)}" r="23" fill="none" stroke="#b85f47" stroke-width="2" stroke-dasharray="4 7" opacity=".7" />` : ""}
      ${mapPoints.map((point, index) => marker(markerPoints[index], panel.labels?.[point.sourceNames[0]] || point.label || point.name, index)).join("")}
      ${photoPoints.map((point, index) => photoMarker(photoMarkerPoints[index], point.label, index)).join("")}
      <g transform="translate(24 ${OUTPUT_HEIGHT - 28})"><text class="map-note">${panel.routeMode === "transfer" ? "交通日 · 彩色虚线为定位方向" : "彩色路线为今日预排街巷线"}${photoPoints.length ? " · ◎ 为参考机位" : ""}</text></g>
      <text x="${OUTPUT_WIDTH - 20}" y="${OUTPUT_HEIGHT - 20}" text-anchor="end" class="attribution">© OpenStreetMap contributors</text>
    </svg>
  `);
}

function findAllStops(plan) {
  return plan.days.flatMap((day) => day.stops || []);
}

async function renderPanel(plan, photoData, panel) {
  const allStops = findAllStops(plan);
  const rawPoints = panel.points.map((name) => {
    const point = allStops.find((stop) => stop.name === name);
    if (!point) throw new Error(`Missing map stop: ${name}`);
    return point;
  });
  const mapPoints = uniqueStops(rawPoints);
  const photoPoints = (panel.photo_spot_ids || []).map((spotId) => {
    const spot = photoData?.spots?.[spotId];
    if (!spot) throw new Error(`Missing photo spot: ${spotId}`);
    const stop = allStops.find((candidate) => candidate.name === spot.stop_name);
    if (!stop) throw new Error(`Missing photo spot stop: ${spot.stop_name}`);
    return { ...stop, label: spot.label, photoSpotId: spotId };
  });
  const routes = [];
  for (let index = 0; index < mapPoints.length - 1; index += 1) {
    routes.push(panel.routeMode === "transfer" ? [[mapPoints[index].lon, mapPoints[index].lat], [mapPoints[index + 1].lon, mapPoints[index + 1].lat]] : await walkingRoute(mapPoints[index], mapPoints[index + 1]));
  }
  const routePoints = routes.flat().map(([lon, lat]) => ({ lon, lat }));
  const viewport = viewportFor([...mapPoints, ...photoPoints, ...routePoints], panel.zoom);
  const base = await buildTileBase(viewport);
  const overlay = mapOverlay({ panel, viewport, mapPoints, routes, photoPoints });
  const baseBuffer = await base.jpeg({ quality: 90, chromaSubsampling: "4:4:4" }).toBuffer();
  return sharp(baseBuffer).composite([{ input: overlay }]).jpeg({ quality: 88, chromaSubsampling: "4:4:4" }).toBuffer();
}

async function main() {
  const plan = JSON.parse(await readFile(planPath, "utf8"));
  const photoData = JSON.parse(await readFile(photoReferencesPath, "utf8"));
  await Promise.all(outputDirectories.map((directory) => mkdir(directory, { recursive: true })));
  for (const spec of MAP_SPECS) {
    for (let index = 0; index < spec.panels.length; index += 1) {
      const filename = `${spec.slug}-${index + 1}.jpg`;
      const buffer = await renderPanel(plan, photoData, spec.panels[index]);
      await Promise.all(outputDirectories.map((directory) => require("node:fs/promises").writeFile(path.join(directory, filename), buffer)));
      console.log(`Generated ${filename}`);
    }
  }
}

await main();
