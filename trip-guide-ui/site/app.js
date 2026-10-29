import { WEATHER_CITIES, forecastWindow, fetchDayForecast } from "./weather.mjs";

const STORAGE_KEY = "spain-guide-ui-progress-2026-v2";
const NAVIGATION_KEY = "spain-guide-ui-navigation-2026-v2";
const PREPARATION_KEY = "spain-guide-ui-preparation-2026-v2";
const DEFAULT_DATE = "2026-12-29";
const savedNavigation = loadNavigation();

const state = {
  plan: null,
  photoReferences: null,
  selectedDate: savedNavigation.date || DEFAULT_DATE,
  selectedTab: ["today", "step", "prep", "transport"].includes(savedNavigation.tab) ? savedNavigation.tab : "today",
  currentIndex: Number.isInteger(savedNavigation.index) ? savedNavigation.index : 0,
  completed: loadCompleted(),
  preparation: loadPreparation(),
  installPrompt: null
};

const elements = {
  dayPicker: document.querySelector("#day-picker"),
  dayCount: document.querySelector("#day-count"),
  dayStrip: document.querySelector(".day-strip"),
  viewTabs: document.querySelector(".view-tabs"),
  appContent: document.querySelector("#app-content"),
  connectionState: document.querySelector("#connection-state"),
  installButton: document.querySelector("#install-button"),
  installDialog: document.querySelector("#install-dialog"),
  closeInstallDialog: document.querySelector("#close-install-dialog"),
  toast: document.querySelector("#toast"),
  copyLinkButton: document.querySelector("#copy-link-button")
};

const kindLabels = {
  arrival: "到达",
  check: "检查",
  hop: "交通",
  lodging: "入住",
  meal: "用餐",
  anchor: "预约 / 门票",
  photo: "拍照",
  rest: "休息",
  free: "自由安排"
};

const mealPeriodLabels = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  tea: "下午茶",
  dessert: "甜点"
};

const restaurantMealPeriods = new Set(["lunch", "dinner", "tea"]);

const tagLabels = {
  pinned: "重要安排",
  opener: "建议先做"
};

const NAVIGATION_OVERRIDES = {
  // For the intercity leg, navigate to the departure station, not on foot to Seville.
  "2026-12-31": { 0: { stop: "Barcelona Sants", mode: "transit" } },
  "2027-01-03": { 0: { stop: "Plaza de Armas 汽车站", mode: "transit" } },
  "2027-01-05": { 0: { stop: "格拉纳达站", mode: "transit" } }
};

const TRAVEL_MODES = [
  { id: "walking", label: "步行" },
  { id: "transit", label: "公共交通" },
  { id: "driving", label: "驾车 / 打车" }
];

const DAILY_MAPS = {
  "2026-12-29": {
    "description": "巴塞罗那老城；线路为示意，现场导航及官方安排优先。",
    "panels": [
      {
        "src": "./assets/trip/daily-maps/d01-barcelona-arrival-1.jpg",
        "alt": "巴塞罗那老城区域地图",
        "title": "巴塞罗那老城"
      }
    ]
  },
  "2026-12-30": {
    "description": "高迪建筑；线路为示意，现场导航及官方安排优先。",
    "panels": [
      {
        "src": "./assets/trip/daily-maps/d02-barcelona-modernisme-1.jpg",
        "alt": "高迪建筑区域地图",
        "title": "高迪建筑"
      }
    ]
  },
  "2026-12-31": {
    "description": "跨城转场；线路为示意，现场导航及官方安排优先。",
    "panels": [
      {
        "src": "./assets/trip/daily-maps/d03-barcelona-seville-1.jpg",
        "alt": "跨城转场区域地图",
        "title": "出发地"
      },
      {
        "src": "./assets/trip/daily-maps/d03-barcelona-seville-2.jpg",
        "alt": "跨城转场区域地图",
        "title": "抵达地"
      }
    ]
  },
  "2027-01-01": {
    "description": "元旦河岸；线路为示意，现场导航及官方安排优先。",
    "panels": [
      {
        "src": "./assets/trip/daily-maps/d04-seville-newyear-1.jpg",
        "alt": "元旦河岸区域地图",
        "title": "元旦河岸"
      }
    ]
  },
  "2027-01-02": {
    "description": "王宫与主教堂；线路为示意，现场导航及官方安排优先。",
    "panels": [
      {
        "src": "./assets/trip/daily-maps/d05-seville-palace-1.jpg",
        "alt": "王宫与主教堂区域地图",
        "title": "王宫与主教堂"
      }
    ]
  },
  "2027-01-03": {
    "description": "前往格拉纳达；线路为示意，现场导航及官方安排优先。",
    "panels": [
      {
        "src": "./assets/trip/daily-maps/d06-seville-granada-1.jpg",
        "alt": "前往格拉纳达区域地图",
        "title": "出发地"
      },
      {
        "src": "./assets/trip/daily-maps/d06-seville-granada-2.jpg",
        "alt": "前往格拉纳达区域地图",
        "title": "抵达地"
      }
    ]
  },
  "2027-01-04": {
    "description": "阿尔罕布拉宫；线路为示意，现场导航及官方安排优先。",
    "panels": [
      {
        "src": "./assets/trip/daily-maps/d07-granada-alhambra-1.jpg",
        "alt": "阿尔罕布拉宫区域地图",
        "title": "阿尔罕布拉宫"
      }
    ]
  },
  "2027-01-05": {
    "description": "回巴塞罗那；线路为示意，现场导航及官方安排优先。",
    "panels": [
      {
        "src": "./assets/trip/daily-maps/d08-granada-barcelona-1.jpg",
        "alt": "回巴塞罗那区域地图",
        "title": "出发地"
      },
      {
        "src": "./assets/trip/daily-maps/d08-granada-barcelona-2.jpg",
        "alt": "回巴塞罗那区域地图",
        "title": "抵达地"
      }
    ]
  },
  "2027-01-06": {
    "description": "机场返程；线路为示意，现场导航及官方安排优先。",
    "panels": [
      {
        "src": "./assets/trip/daily-maps/d09-barcelona-airport-1.jpg",
        "alt": "机场返程区域地图",
        "title": "机场返程"
      }
    ]
  }
};

function loadCompleted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadNavigation() {
  try {
    const raw = localStorage.getItem(NAVIGATION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadPreparation() {
  try {
    const raw = localStorage.getItem(PREPARATION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveNavigation() {
  try {
    localStorage.setItem(NAVIGATION_KEY, JSON.stringify({
      date: state.selectedDate,
      tab: state.selectedTab,
      index: state.currentIndex
    }));
  } catch {
    // The guide remains usable when storage is disabled.
  }
}

function saveCompleted() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.completed));
  } catch {
    // Private browsing or a disabled storage policy should not block the guide.
  }
}

function savePreparation() {
  try {
    localStorage.setItem(PREPARATION_KEY, JSON.stringify(state.preparation));
  } catch {
    // The checklist remains usable when storage is disabled.
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    weekday: "short"
  }).format(new Date(`${dateString}T12:00:00`));
}

function formatDayNumber(index) {
  return `D${String(index + 1).padStart(2, "0")}`;
}

function currentDay() {
  return state.plan?.days?.find((day) => day.date === state.selectedDate) ?? state.plan?.days?.[0];
}

function currentDayIndex() {
  return Math.max(0, state.plan?.days?.findIndex((day) => day.date === state.selectedDate) ?? 0);
}

function stepKey(day, index) {
  return `${day.date}-${index}`;
}

function isComplete(day, index) {
  return Boolean(state.completed[stepKey(day, index)]);
}

function toggleComplete(index) {
  const day = currentDay();
  if (!day) return;
  const key = stepKey(day, index);
  state.completed[key] = !state.completed[key];
  saveCompleted();
  render();
  showToast(state.completed[key] ? "已标记完成" : "已取消完成");
}

function togglePreparation(id) {
  state.preparation[id] = !state.preparation[id];
  savePreparation();
  render();
  showToast(state.preparation[id] ? "已记下这项" : "已取消这项");
}

function mapsDirectionsUrl(destination, travelMode = "walking") {
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("destination", destination);
  url.searchParams.set("travelmode", travelMode);
  url.searchParams.set("dir_action", "navigate");
  return url.toString();
}

function stopByName(day, name) {
  return day?.stops?.find((stop) => stop.name === name) || null;
}

function inferredNavigationTarget(day, item) {
  const text = `${item.what || ""} ${item.note || ""}`;
  const matches = (day?.stops || []).filter((stop) => text.includes(stop.name));
  if (matches.length === 1) return matches[0];
  if (matches.length > 1 && /→|前往|到|沿/.test(item.what || "")) return matches[matches.length - 1];
  return null;
}

function destinationForItem(day, item, index) {
  const override = NAVIGATION_OVERRIDES[day?.date]?.[index];
  if (override?.stop) {
    const stop = stopByName(day, override.stop);
    if (stop) return { label: stop.name, query: stop.query, mode: override.mode || stop.mode || "walking" };
  }
  if (override?.query) return { label: override.label, query: override.query, mode: override.mode || "walking" };
  const inferred = inferredNavigationTarget(day, item);
  if (inferred) return { label: inferred.name, query: inferred.query, mode: inferred.mode || "walking" };
  return null;
}

function plannedRouteUrl(item) {
  return /google\.[^/]+\/maps|maps\.google/i.test(item?.link || "") ? item.link : "";
}

function nonNavigationOfficialUrl(item) {
  return plannedRouteUrl(item) ? "" : officialUrl(item);
}

function navigationModes(target) {
  const preferred = target?.mode || "walking";
  return [preferred, ...TRAVEL_MODES.map((mode) => mode.id).filter((mode) => mode !== preferred)]
    .map((mode) => TRAVEL_MODES.find((option) => option.id === mode))
    .filter(Boolean);
}

function navigationOptionsMarkup(target, className = "") {
  return `<div class="nav-mode-options ${className}">${navigationModes(target).map((mode) => `
    <a href="${escapeHtml(mapsDirectionsUrl(target.query, mode.id))}" target="_blank" rel="noreferrer">从当前位置${escapeHtml(mode.label)} ↗</a>
  `).join("")}</div>`;
}

function navigationRowMarkup(day, item, index) {
  const target = destinationForItem(day, item, index);
  const routeLink = plannedRouteUrl(item);
  if (!target && !routeLink) return `<span class="nav-unavailable">地址待确认</span>`;
  if (!target) return `<a class="route-detail-link" href="${escapeHtml(routeLink)}" target="_blank" rel="noreferrer">打开已排好的这段路线 ↗</a>`;
  return `
    <div class="row-navigation">
      <span class="nav-destination"><b>目的地</b>${escapeHtml(target.label)}</span>
      ${navigationOptionsMarkup(target)}
      ${routeLink ? `<a class="route-detail-link" href="${escapeHtml(routeLink)}" target="_blank" rel="noreferrer">查看已排好的这段路线 ↗</a>` : ""}
    </div>
  `;
}

function stepNavigationMarkup(day, item, index) {
  const target = destinationForItem(day, item, index);
  const routeLink = plannedRouteUrl(item);
  if (!target && !routeLink) {
    return `<div class="step-navigation-missing"><strong>这一步暂时没有固定地址</strong><span>住宿、早餐或餐厅要到出发前再确认具体地址，确认后再打开导航。</span></div>`;
  }
  if (!target) {
    return `<div class="step-navigation"><div class="step-navigation-heading"><span>这段路线</span><strong>查看路线</strong></div><a class="step-navigation-route" href="${escapeHtml(routeLink)}" target="_blank" rel="noreferrer">打开这段路线 ↗</a></div>`;
  }
  return `
    <div class="step-navigation">
      <div class="step-navigation-heading"><span>导航目的地</span><strong>${escapeHtml(target.label)}</strong></div>
      <p>不预填错误起点；Google Maps 会使用手机当前位置作为出发点。</p>
      ${navigationOptionsMarkup(target, "step-nav-options")}
      ${routeLink ? `<a class="step-navigation-route" href="${escapeHtml(routeLink)}" target="_blank" rel="noreferrer">查看已排好的这段路线 ↗</a>` : ""}
    </div>
  `;
}

function stepSafetyNavigationMarkup(day, item, index) {
  const target = destinationForItem(day, item, index);
  const routeLink = plannedRouteUrl(item);
  if (target) return `<a href="${escapeHtml(mapsDirectionsUrl(target.query, target.mode || "walking"))}" target="_blank" rel="noreferrer">从当前位置重新核对 → ${escapeHtml(target.label)} ↗</a>`;
  if (routeLink) return `<a href="${escapeHtml(routeLink)}" target="_blank" rel="noreferrer">重新核对这段已排路线 ↗</a>`;
  return `<span class="nav-unavailable">地址确认后再打开导航</span>`;
}

function dayRouteUrl(day) {
  if (day?.day_map) return day.day_map;
  const lastStop = day?.stops?.[day.stops.length - 1];
  return lastStop ? mapsDirectionsUrl(lastStop.query, lastStop.mode || "walking") : "";
}

function officialUrl(item) {
  return item.link || "";
}

function officialLinkLabel(item) {
  const link = officialUrl(item);
  if (!link) return "";
  return /google\.[^/]+\/maps|maps\.google/i.test(link) ? "路线详情 ↗" : "官方 / 票券 ↗";
}

function kindLabel(kind) {
  return kindLabels[kind] || kind || "安排";
}

function tagLabel(tag) {
  return tagLabels[tag] || "安排";
}

function tagMarkup(tag) {
  if (!tag || tag === "planned") return "";
  return `<span class="tag-label tag-${escapeHtml(tag)}">${escapeHtml(tagLabel(tag))}</span>`;
}

function iconForKind(kind) {
  return {
    arrival: "↓",
    check: "✓",
    hop: "→",
    lodging: "⌂",
    meal: "·",
    anchor: "✦",
    photo: "○",
    rest: "—",
    free: "~"
  }[kind] || "·";
}

function cityDisplay(day) {
  return day?.city || "西班牙";
}

function shortCityDisplay(day) {
  const city = cityDisplay(day);
  return city
    .replaceAll("Barcelona", "巴塞")
    .replaceAll("Granada", "格拉纳达")
    .replaceAll("Seville", "塞维利亚")
    .replaceAll("→", " → ");
}

function isTravelDay(day) {
  return Boolean(day?.travel_day || String(day?.city || "").includes("→"));
}

function walkingStatus(day) {
  if (day?.walking_km?.total == null) return { km: "待估", label: "按体力分段", tone: "soft" };
  const km = Number(day?.walking_km?.total);
  if (!Number.isFinite(km)) return { km: "待估", label: "按体力分段", tone: "soft" };
  if (km <= 3) return { km: `${km} km`, label: "轻松", tone: "easy" };
  if (km <= 5.5) return { km: `${km} km`, label: "中等·可分段", tone: "medium" };
  return { km: `${km} km`, label: "偏多·提前折返", tone: "hard" };
}

function changeGuardMarkup(day) {
  const rain = String(day?.rain_alt || "").trim();
  const late = String(day?.late_cut || "").trim();
  const plans = [
    rain ? `<p><b>下雨</b>${escapeHtml(rain)}</p>` : "",
    late ? `<p><b>晚到/延误</b>${escapeHtml(late)}</p>` : ""
  ].filter(Boolean);
  if (!plans.length) return "";
  return `
    <details class="guard-card change-card">
      <summary><span class="guard-icon delay-icon">↗</span><span><strong>遇到变化怎么办</strong><small>这里只列真正能用的备用安排</small></span></summary>
      <div class="guard-detail change-detail">${plans.join("")}</div>
    </details>
  `;
}

function safetyFooterMarkup(plan) {
  const insurance = String(plan?.brief?.insurance || "出发前确认覆盖申根全程，医疗保额至少 EUR 30,000，并保存 24 小时援助方式。").trim();
  return `
    <section class="safety-footer-card" aria-label="安全与应急">
      <div class="safety-footer-heading">
        <div><span class="section-kicker">安全</span><h3>安全与应急</h3></div>
        <a class="emergency-link" href="tel:112">拨打 112</a>
      </div>
      <p>人多把包放身前，夜间走亮路，使用正规交通；遇到紧急情况拨打 112。</p>
      <p class="insurance-note"><strong>保险政策：</strong>${escapeHtml(insurance)}</p>
    </section>
  `;
}

function ticketPriceMarkup(item) {
  const price = String(item?.ticket_price || "").trim();
  return price ? `<p class="timeline-price"><strong>门票</strong>${escapeHtml(price)}</p>` : "";
}

function heroForDay(day) {
  if (!day) return null;
  if (day.city.includes("Seville") || day.city.includes("塞维利亚")) return "./assets/trip/seville-hero.jpg";
  if (isTravelDay(day)) return null;
  return null;
}

function dailyMapMarkup(day) {
  const map = DAILY_MAPS[day?.date];
  if (!map) return "";
  return `
    <section class="daily-map-card" aria-label="今日城市街巷图">
      <div class="card-heading-row">
        <div><span class="section-kicker">街巷地图</span><h3>今天在哪里走</h3></div>
        <span class="muted-label">街区定位</span>
      </div>
      <p class="daily-map-intro">${escapeHtml(map.description)}</p>
      <div class="daily-map-panels">
        ${map.panels.map((panel, index) => `
          <figure class="daily-map-panel">
            <img src="${escapeHtml(panel.src)}" alt="${escapeHtml(panel.alt)}" loading="${index === 0 ? "eager" : "lazy"}" />
            <figcaption>${escapeHtml(panel.title)}</figcaption>
          </figure>
        `).join("")}
      </div>
      <p class="daily-map-note">底图显示街道和地点的相对位置；连线仅供理解方位，跨城和市内实际路线请按车票与导航确认。底图数据 © OpenStreetMap contributors。</p>
    </section>
  `;
}

function nextStepMarkup(day, index, allComplete) {
  const item = day?.timeline?.[index];
  if (!item) return "";
  const target = destinationForItem(day, item, index);
  const label = allComplete ? "今天已经走完" : "现在先做这一步";
  const count = allComplete ? "已完成" : `第 ${index + 1} 步 / 共 ${day.timeline.length} 步`;
  const buttonLabel = allComplete ? "回看最后一步" : "开始这一步";
  return `
    <section class="next-step-card ${allComplete ? "is-complete" : ""}" aria-label="${escapeHtml(label)}">
      <div class="next-step-top">
        <div><span class="section-kicker">从这里开始</span><h3>${escapeHtml(label)}</h3></div>
        <span class="next-step-count">${escapeHtml(count)}</span>
      </div>
      <div class="next-step-main">
        <div>
          <strong>${escapeHtml(item.what)}</strong>
          <p>${escapeHtml(allComplete ? "可以回看今天的路线，或切到「出发前」继续准备。" : item.note || "按这一步行动；到达后再标记完成。")}</p>
        </div>
        <button class="next-step-button" data-open-step="${index}" type="button">${escapeHtml(buttonLabel)} <span aria-hidden="true">→</span></button>
      </div>
      <div class="next-step-meta"><span>${target ? `目的地 · ${escapeHtml(target.label)}` : "先按步骤说明行动"}</span>${allComplete ? "" : "到达后点「完成这步」"}</div>
    </section>
  `;
}

function renderDayPicker() {
  if (!state.plan?.days) return;
  elements.dayCount.textContent = `${state.plan.days.length} 天 · 左右滑动选择`;
  elements.dayPicker.innerHTML = state.plan.days.map((day, index) => `
    <button class="day-chip ${day.date === state.selectedDate ? "is-selected" : ""}" data-date="${escapeHtml(day.date)}" role="listitem" type="button" title="选择 ${escapeHtml(formatDayNumber(index))} · ${escapeHtml(formatDate(day.date))} · ${escapeHtml(shortCityDisplay(day))}">
      <span class="day-chip-number">${formatDayNumber(index)}</span>
      <span class="day-chip-date">${escapeHtml(formatDate(day.date))}</span>
      <span class="day-chip-city">${escapeHtml(shortCityDisplay(day))}</span>
    </button>
  `).join("");

  elements.dayPicker.querySelectorAll("[data-date]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedDate = button.dataset.date;
      state.currentIndex = 0;
      state.selectedTab = "today";
      saveNavigation();
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function renderTabs() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    if (button.id === "copy-link-button") return;
    const active = button.dataset.tab === state.selectedTab;
    button.classList.toggle("is-active", active);
    if (button.getAttribute("role") === "tab") button.setAttribute("aria-selected", String(active));
  });
}

function preparationEntries(preparation) {
  if (!preparation) return [];
  const visaSteps = preparation.visa?.steps || [];
  const visaMaterials = (preparation.visa?.materials || []).flatMap((group) => group.items || []);
  const baggageItems = (preparation.baggage?.groups || []).flatMap((group) => group.items || []);
  return [...visaSteps, ...visaMaterials, ...baggageItems];
}

function preparationProgress(preparation) {
  const entries = preparationEntries(preparation);
  const completed = entries.filter((entry) => Boolean(state.preparation[entry.id])).length;
  return {
    completed,
    total: entries.length,
    percent: entries.length ? Math.round((completed / entries.length) * 100) : 0
  };
}

function preparationCheckboxMarkup(item, context = "") {
  const checked = Boolean(state.preparation[item.id]);
  return `
    <label class="prep-check-row ${checked ? "is-done" : ""}">
      <input type="checkbox" data-prep-id="${escapeHtml(item.id)}" ${checked ? "checked" : ""} />
      <span class="prep-check-box" aria-hidden="true">${checked ? "✓" : ""}</span>
      <span class="prep-check-copy"><strong>${escapeHtml(item.label || item.title)}</strong>${item.note ? `<small>${escapeHtml(item.note)}</small>` : ""}${context ? `<em>${escapeHtml(context)}</em>` : ""}</span>
    </label>
  `;
}

function preparationSourceMarkup(sources = []) {
  return sources.map((source) => `
    <a class="prep-source" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">
      <span><strong>${escapeHtml(source.label)}</strong><small>${escapeHtml(source.note || "以页面当前内容为准")}</small></span><span aria-hidden="true">↗</span>
    </a>
  `).join("");
}

function renderCityTransport(data) {
  if (!data?.cities?.length) {
    elements.appContent.innerHTML = `<section class="error-card prep-load-error"><h2>市内交通暂时没有载入</h2><p>请联网打开一次网页，让交通资料进入离线缓存。</p></section>`;
    return;
  }
  elements.appContent.innerHTML = `
    <section class="prep-hero-card transport-hero"><div class="prep-hero-top"><span class="section-kicker">市内交通 · ${escapeHtml(data.updated_at)} 核查</span><span class="prep-status">三城速查</span></div><h2>坐车怎么付？</h2><p>${escapeHtml(data.summary)}</p></section>
    <section class="prep-window transport-notice"><span class="prep-window-icon">!</span><p>${escapeHtml(data.notice)}</p></section>
    ${data.estimate ? `<section class="transport-estimate"><div class="card-heading-row"><div><span class="section-kicker">两人行程估算</span><h3>${escapeHtml(data.estimate.title)}</h3></div></div><p>${escapeHtml(data.estimate.summary)}</p><details class="estimate-days"><summary>展开每日乘车估算 <span aria-hidden="true">＋</span></summary><p class="estimate-assumptions">${escapeHtml(data.estimate.assumptions)}</p>${data.estimate.days.map((day) => `<div class="estimate-row"><div><strong>${escapeHtml(day.date)} · ${escapeHtml(day.city)}</strong><b>${escapeHtml(day.count)}</b></div><p>${escapeHtml(day.detail)}</p></div>`).join("")}</details></section>` : ""}
    ${data.cities.map((city) => `
      <details class="transport-city" ${currentDay()?.city_id === city.id ? "open" : ""}>
        <summary><span><strong>${escapeHtml(city.name)}</strong><small>${escapeHtml(city.subtitle)}</small></span><b aria-hidden="true">＋</b></summary>
        <div class="transport-city-body">
          ${city.sections.map((section) => `<section class="transport-topic"><h3>${escapeHtml(section.title)}</h3><p>${escapeHtml(section.text)}</p></section>`).join("")}
          <div class="transport-sources"><strong>查看原始信息</strong>${city.sources.map((source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)} ↗</a>`).join("")}</div>
        </div>
      </details>
    `).join("")}
    <p class="transport-footer">先联网打开一次以便离线查看；票价、线路和设备以现场及运营方最新信息为准。</p>
  `;
}

function renderPreDeparture(preparation) {
  if (!preparation) {
    elements.appContent.innerHTML = `
      <section class="error-card prep-load-error">
        <span class="section-kicker">行前准备</span>
        <h2>行前清单暂时没有载入</h2>
        <p>请保持网页在线打开一次，让签证与行李清单进入离线缓存。</p>
      </section>
    `;
    return;
  }

  const progress = preparationProgress(preparation);
  const visa = preparation.visa;
  const baggage = preparation.baggage;
  elements.appContent.innerHTML = `
    <section class="prep-hero-card">
      <div class="prep-hero-top"><span class="section-kicker">行前准备 · ${escapeHtml(preparation.updated_at)}</span><span class="prep-status">${progress.completed}/${progress.total} 已完成</span></div>
      <h2>出发前，把路线、签证和行李准备好</h2>
      <p>${escapeHtml(preparation.basis)}</p>
      <div class="prep-progress-track" aria-label="行前清单完成度"><span style="width:${progress.percent}%"></span></div>
      <div class="prep-hero-meta"><span>签证：${escapeHtml(visa.status)}</span><span>行李：两人冬季转场</span></div>
    </section>

    <section class="prep-section plan-lock-section">
      <div class="prep-section-heading"><div><span class="section-kicker">00 · 路线</span><h3>先把每天怎么走看一遍</h3></div><span class="prep-count">出发前完成</span></div>
      <p class="prep-summary">出发前把每天要去的地方、预约、交通、住宿和下雨备用方案看一遍。旅途中遇到延误或下雨，就按当天卡片里的备用安排处理。</p>
      <div class="prep-hard-rules">
        <p><span>✓</span>先核对车票、预约时段、住宿地址和机场衔接。</p>
        <p><span>✓</span>把天气、体力和晚到时的备用走法提前写进当天安排。</p>
        <p><span>✓</span>出发后按当天卡片走；有变化时打开“遇到变化怎么办”。</p>
      </div>
    </section>

    <section class="prep-section visa-prep-section">
      <div class="prep-section-heading"><div><span class="section-kicker">01 · 签证</span><h3>${escapeHtml(visa.title)}</h3></div><span class="prep-count">${visa.steps.filter((step) => state.preparation[step.id]).length}/${visa.steps.length}</span></div>
      <p class="prep-summary">${escapeHtml(visa.summary)}</p>
      <div class="prep-window"><span class="prep-window-icon">!</span><p>${escapeHtml(visa.window)}</p></div>
      <div class="prep-timeline">
        ${visa.steps.map((step, index) => {
          const checked = Boolean(state.preparation[step.id]);
          return `
            <article class="prep-timeline-row ${checked ? "is-done" : ""}">
              <button class="prep-step-check" data-prep-id="${escapeHtml(step.id)}" type="button" aria-label="${checked ? "取消完成" : "标记完成"}：${escapeHtml(step.title)}">${checked ? "✓" : String(index + 1).padStart(2, "0")}</button>
              <div class="prep-timeline-copy"><div class="prep-step-meta"><span>${escapeHtml(step.phase)}</span><b>${escapeHtml(step.tag)}</b></div><h4>${escapeHtml(step.title)}</h4><p>${escapeHtml(step.note)}</p></div>
            </article>
          `;
        }).join("")}
      </div>
      <div class="prep-materials">
        <div class="prep-subheading"><strong>递交材料 checklist</strong><span>点开逐项勾选</span></div>
        ${visa.materials.map((group, index) => `
          <details class="prep-details" ${index === 0 ? "open" : ""}>
            <summary><span><strong>${escapeHtml(group.title)}</strong><small>${group.items.filter((item) => state.preparation[item.id]).length}/${group.items.length} 完成</small></span><b>＋</b></summary>
            <div class="prep-check-list">${group.items.map((item) => preparationCheckboxMarkup(item)).join("")}</div>
            ${group.link ? `<a class="prep-official-link" href="${escapeHtml(group.link)}" target="_blank" rel="noreferrer">${escapeHtml(group.link_text || "打开当期官方清单")} ↗</a>` : ""}
          </details>
        `).join("")}
      </div>
      <div class="prep-sources"><div class="prep-subheading"><strong>官方入口 / 小红书参考</strong><span>出发前重新打开</span></div>${preparationSourceMarkup(visa.sources)}</div>
    </section>

    <section class="prep-section baggage-prep-section">
      <div class="prep-section-heading"><div><span class="section-kicker">02 · 行李</span><h3>${escapeHtml(baggage.title)}</h3></div><span class="prep-count">${baggage.groups.flatMap((group) => group.items).filter((item) => state.preparation[item.id]).length}/${baggage.groups.flatMap((group) => group.items).length}</span></div>
      <p class="prep-summary">${escapeHtml(baggage.summary)}</p>
      <div class="prep-hard-rules">${baggage.hard_rules.map((rule) => `<p><span>✓</span>${escapeHtml(rule)}</p>`).join("")}</div>
      <div class="prep-baggage-groups">
        ${baggage.groups.map((group, index) => `
          <details class="prep-details baggage-details" ${index === 0 || index === 1 ? "open" : ""}>
            <summary><span><strong>${escapeHtml(group.title)}</strong><small>${escapeHtml(group.subtitle)} · ${group.items.filter((item) => state.preparation[item.id]).length}/${group.items.length}</small></span><b>＋</b></summary>
            <div class="prep-check-list">${group.items.map((item) => preparationCheckboxMarkup(item)).join("")}</div>
          </details>
        `).join("")}
      </div>
      <div class="prep-sources"><div class="prep-subheading"><strong>官方入口 / 小红书参考</strong><span>机场 / 场馆规则</span></div>${preparationSourceMarkup(baggage.sources)}</div>
    </section>

    <section class="prep-footer-note"><span class="section-kicker">资料留在本机</span><p>勾选进度只保存在这台手机的浏览器本地。它不会保存护照号、申请号、保单号或支付资料；签证、航班、行李和安检规则仍以出发前官方页面为准。</p></section>
  `;
  bindPreparationEvents();
}

function bindPreparationEvents() {
  document.querySelectorAll("[data-prep-id]").forEach((control) => {
    const handler = () => togglePreparation(control.dataset.prepId);
    if (control.matches("input")) control.addEventListener("change", handler);
    else control.addEventListener("click", handler);
  });
}

function assetUrl(path) {
  return `./${String(path || "").replace(/^\.\//, "")}`;
}

function xhsAppUrl(noteId) {
  return `xhsdiscover://item/${encodeURIComponent(noteId)}`;
}

function hotelForDay(day) {
  return state.plan?.hotels?.find((hotel) => hotel.city_id === day?.city_id && (!hotel.start || (day.date >= hotel.start && day.date < hotel.end))) || null;
}

function hotelStatusLabel(status) {
  return {
    selected_candidate: "目前优先",
    candidate: "待确认",
    conditional_candidate: "备用选项",
    to_select: "出发前选择"
  }[status] || "参考选项";
}

function hotelSupplierLabel(option) {
  const value = `${option?.name || ""} ${option?.link || ""}`;
  if (/airbnb/i.test(value)) return "Airbnb";
  if (/ctrip|携程/i.test(value)) return "携程";
  if (/trip\.com/i.test(value)) return "Trip.com";
  if (/aena/i.test(value)) return "Aena";
  return "供应商页面";
}

function lodgingMarkup(day) {
  const hotel = hotelForDay(day);
  if (!hotel) return "";
  const isCityStart = state.plan?.days?.findIndex((candidate) => candidate.city_id === day.city_id) === currentDayIndex();
  return `
    <details class="lodging-card" ${isCityStart ? "open" : ""}>
      <summary><span><span class="section-kicker">住宿</span><strong>住宿入口</strong><small>${escapeHtml(hotelStatusLabel(hotel.status))} · ${escapeHtml(hotel.area)}</small></span><b>＋</b></summary>
      <div class="lodging-detail">
        <p class="lodging-base">${escapeHtml(hotel.base)}</p>
        <p class="lodging-why">${escapeHtml(hotel.why)}</p>
        <div class="lodging-options">
          ${(hotel.options || []).map((option) => `
            <a class="lodging-option" href="${escapeHtml(option.link)}" target="_blank" rel="noreferrer">
              <span class="lodging-option-top"><b>${escapeHtml(hotelSupplierLabel(option))}</b><span>打开供应商页面 ↗</span></span>
              <strong>${escapeHtml(option.name)}</strong>
              <small>${escapeHtml(option.band)}</small>
            </a>
          `).join("")}
        </div>
        <p class="lodging-note">优先酒店和含两人早餐的房价；民宿仅考虑风景或拍照体验突出的房源。住宿含税和必付费用上限为每间每晚人民币 1,500 元；比较早餐并核对逐晚费用，确认两张独立床、早餐时间、近期点评和最终地址。1/6 早赴机场需确认早餐是否来得及。</p>
      </div>
    </details>
  `;
}

function mealPeriodForItem(item) {
  const explicit = String(item?.meal_period || "").trim().toLowerCase();
  if (explicit) return explicit;
  const text = `${item?.what || ""} ${item?.note || ""}`;
  if (/早餐/.test(text)) return "breakfast";
  if (/下午茶|茶歇/.test(text)) return "tea";
  if (/甜点|甜品/.test(text)) return "dessert";
  if (/午餐|午饭|午间/.test(text)) return "lunch";
  if (/晚餐|晚饭/.test(text)) return "dinner";
  return "";
}

function restaurantsForDay(day, mealPeriod = "") {
  const restaurants = Array.isArray(state.plan?.restaurants) ? state.plan.restaurants : [];
  const dayKey = String(day?.date || "").slice(0, 10);
  const matches = restaurants.filter((restaurant) => {
    const dayIds = Array.isArray(restaurant.day_ids) ? restaurant.day_ids.map((value) => String(value).slice(0, 10)) : [];
    if (!dayIds.includes(dayKey)) return false;
    return !mealPeriod || restaurant.meal_period === mealPeriod;
  });
  matches.sort((a, b) => Number(a.priority || 1) - Number(b.priority || 1));
  if (mealPeriod) return matches.slice(0, 1);

  // The overview may show the day's meal plan, but still keeps one primary
  // restaurant per meal period. There is no city-wide fallback: a restaurant
  // must be assigned to this exact date before it appears.
  const seenPeriods = new Set();
  return matches.filter((restaurant) => {
    const period = restaurant.meal_period || restaurant.role || restaurant.id;
    if (seenPeriods.has(period)) return false;
    seenPeriods.add(period);
    return true;
  });
}

function restaurantSourceMarkup(post) {
  const url = post?.url || `https://www.xiaohongshu.com/explore/${encodeURIComponent(post?.source_id || "")}`;
  return `
    <a class="restaurant-source" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">
      <span><strong>${escapeHtml(post?.title || "打开小红书帖子")}</strong><small>${escapeHtml(post?.date_display || "近一年内页面") } · ${escapeHtml(post?.note || "先看菜品照片和实际体验")}</small></span>
      <span aria-hidden="true">打开 ↗</span>
    </a>
  `;
}

function restaurantMarkup(day, item = null) {
  const mealPeriod = item ? mealPeriodForItem(item) : "";
  if (item && !restaurantMealPeriods.has(mealPeriod)) return "";
  const restaurants = restaurantsForDay(day, mealPeriod);
  if (!restaurants.length) return "";
  const isMealStep = Boolean(item);
  const periodLabel = mealPeriodLabels[mealPeriod] || "用餐";
  return `
    <section class="restaurant-section" aria-label="餐厅推荐">
      <div class="card-heading-row">
        <div><span class="section-kicker">${isMealStep ? periodLabel : "今天吃什么"}</span><h3>${isMealStep ? `${periodLabel}只看这一家` : "午餐、晚餐各留一家"}</h3></div>
        <span class="muted-label">两人共享</span>
      </div>
      <p class="restaurant-intro">${isMealStep ? `这张卡只对应今天的${periodLabel}；先看菜品和点法，再按当天营业、排队和菜单决定。` : "这里只列当天午餐、晚餐或特别值得体验的下午茶，不会把餐厅塞进每一个步骤。小红书只用于看菜品长相和体验，动态信息出发前再查。"}</p>
      <div class="restaurant-list">
        ${restaurants.map((restaurant) => `
          <article class="restaurant-card">
            <div class="restaurant-card-heading">
              <img src="${escapeHtml(assetUrl(restaurant.image || "assets/trip/tapas.jpg"))}" alt="${escapeHtml(restaurant.name)} 菜品外观参考" loading="lazy" />
              <div>
                <span class="restaurant-role">${escapeHtml(restaurant.city_label || "当天附近")} · ${escapeHtml(restaurant.role || "顺路用餐")}</span>
                <h4>${escapeHtml(restaurant.name)}</h4>
                <p>${escapeHtml(restaurant.area || "按地图当天确认具体地址")}</p>
              </div>
            </div>
            <div class="restaurant-copy-block"><strong>为什么适合今天</strong><p>${escapeHtml(restaurant.fit)}</p></div>
            <div class="restaurant-copy-block"><strong>两个人这样点</strong><p>${escapeHtml(restaurant.order_for_three)}</p></div>
            <div class="restaurant-copy-block">
              <strong>推荐菜长什么样</strong>
              <div class="restaurant-dishes">
                ${(restaurant.dishes || []).map((dish) => `<div class="restaurant-dish"><b>${escapeHtml(dish.zh || dish.name)}</b><small>${escapeHtml(dish.name || "")} · ${escapeHtml(dish.look || "先看当前菜单照片")}</small></div>`).join("")}
              </div>
            </div>
            <div class="restaurant-facts">
              <p><b>预算样本</b>${escapeHtml(restaurant.budget || "当前价格待查")}</p>
              <p><b>排队和备用</b>${escapeHtml(restaurant.queue || "当天看排队，久等就换附近店")}</p>
            </div>
            <div class="restaurant-actions">
              <a href="${escapeHtml(restaurant.map_url || "https://www.google.com/maps")}" target="_blank" rel="noreferrer">打开地图/商户页 ↗</a>
              ${restaurant.menu_url ? `<a href="${escapeHtml(restaurant.menu_url)}" target="_blank" rel="noreferrer">看当前菜单 ↗</a>` : ""}
            </div>
            <details class="restaurant-sources">
              <summary><span>打开近一年小红书图片</span><b>${(restaurant.xhs_posts || []).length} 篇＋</b></summary>
              <div class="restaurant-source-list">
                ${(restaurant.xhs_posts || []).map(restaurantSourceMarkup).join("")}
              </div>
            </details>
            <p class="restaurant-note">${escapeHtml(restaurant.source_note || "小红书是体验参考，不是当前营业或价格保证。")}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function photoReferenceForDay(day) {
  if (!day) return null;
  const config = state.photoReferences?.days?.[day.date];
  const cityId = config?.pool_city_id || day.city_id;
  const city = state.photoReferences?.cities?.[cityId];
  if (config && city) return { config, city };

  // Keep the already-published three-card version usable if the optional
  // expanded library is unavailable for a moment during a static deploy.
  const legacy = state.plan?.photo_references?.find((group) => group.city_id === day.city_id);
  if (!legacy?.items?.length || isTravelDay(day)) return null;
  return {
    config: {
      pool_city_id: day.city_id,
      intro: legacy.note,
      step_refs: {}
    },
    city: {
      label: legacy.title,
      intro: legacy.note,
      featured: legacy.items.map((item) => item.source_id),
      images: legacy.items.map((item) => ({
        image: item.image,
        source_id: item.source_id,
        title: item.title,
        caption: item.caption,
        spot_ids: []
      })),
      posts: legacy.items.map((item) => ({
        source_id: item.source_id,
        title: item.title,
        location: item.caption,
        hint: item.caption,
        spot_ids: [],
        source_url: item.source_url
      }))
    }
  };
}

function photoPostUrl(post) {
  return post?.source_url || `https://www.xiaohongshu.com/explore/${encodeURIComponent(post?.source_id || "")}`;
}

function photoSpotById(spotId) {
  return state.photoReferences?.spots?.[spotId] || null;
}

function photoPostsForIds(city, postIds = [], fallbackSpotIds = []) {
  const ids = postIds.length
    ? postIds
    : fallbackSpotIds.flatMap((spotId) => photoSpotById(spotId)?.post_ids || []);
  const byId = new Map((city?.posts || []).map((post) => [post.source_id, post]));
  return [...new Set(ids)].map((id) => byId.get(id)).filter(Boolean);
}

function photoImagesForSpots(city, spotIds = [], minimum = 3) {
  const images = [...(city?.images || []), ...(city?.licensed_images || [])];
  const matching = images.filter((image) => spotIds.some((spotId) => image.spot_ids?.includes(spotId)));
  const remaining = images.filter((image) => !matching.includes(image));
  return [...matching, ...remaining].slice(0, Math.min(Math.max(minimum, matching.length), images.length));
}

function photoImageMarkup(image, compact = false) {
  const isLicensed = image.kind === "public-license";
  const credit = isLicensed && image.source_page
    ? `<a class="photo-credit" href="${escapeHtml(image.source_page)}" target="_blank" rel="noreferrer">公开授权 · ${escapeHtml(image.author || "来源页")} · ${escapeHtml(image.license || "许可信息")} ↗</a>`
    : `<small class="photo-image-note">小红书原帖图 · 只作动作和构图参考</small>`;
  return `
    <figure class="photo-static-item ${isLicensed ? "is-licensed" : "is-post-image"} ${compact ? "is-compact" : ""}">
      <img src="${escapeHtml(assetUrl(image.image))}" alt="${escapeHtml(image.title)}" loading="lazy" />
      <figcaption><strong>${escapeHtml(image.title)}</strong><small>${escapeHtml(image.caption || "")}</small>${credit}</figcaption>
    </figure>
  `;
}

function xhsButtonMarkup(post, className = "xhs-copy-button") {
  return `<button class="${className}" type="button" data-xhs-url="${escapeHtml(photoPostUrl(post))}" data-xhs-app-url="${escapeHtml(xhsAppUrl(post.source_id))}">${escapeHtml(post.title)} · 打开 App ↗</button>`;
}

function photoStepReference(day, index) {
  const reference = photoReferenceForDay(day);
  const step = reference?.config?.step_refs?.[String(index)];
  if (!reference || !step) return null;
  const spots = (step.spot_ids || []).map(photoSpotById).filter(Boolean);
  const posts = photoPostsForIds(reference.city, step.post_ids || [], step.spot_ids || []);
  const images = photoImagesForSpots(reference.city, step.spot_ids || [], 3);
  return { ...reference, step, spots, posts, images };
}

function stepPhotoMarkup(day, item, index, { compact = false } = {}) {
  const reference = photoStepReference(day, index);
  if (!reference) return "";
  const spotNames = reference.spots.map((spot) => spot.label).join("、") || "按当天标记的拍摄点";
  const postButtons = reference.posts.slice(0, 3).map((post) => xhsButtonMarkup(post, "xhs-inline-button")).join("");
  return `
    <aside class="step-photo-reference ${compact ? "is-compact" : ""}">
      <div class="step-photo-heading"><span class="photo-camera-mark">◎</span><div><span class="section-kicker">拍照</span><strong>这里可以拍照</strong></div><span class="photo-count">${reference.posts.length || 0} 篇</span></div>
      <p class="step-photo-prompt">${escapeHtml(reference.step.prompt || "按机位提示拍一组即可，不为单一角度反复折返。")}</p>
      <p class="step-photo-location"><b>机位</b>${escapeHtml(spotNames)}</p>
      ${reference.images.length ? `<div class="step-photo-images">${reference.images.map((image) => photoImageMarkup(image, true)).join("")}</div>` : ""}
      ${postButtons ? `<div class="step-photo-links"><span>相关帖子</span>${postButtons}</div>` : ""}
    </aside>
  `;
}

function photoReferencesMarkup(day) {
  const reference = photoReferenceForDay(day);
  if (!reference || !reference.city?.posts?.length) return "";
  const { config, city } = reference;
  const featuredIds = city.featured || city.posts.slice(0, 3).map((post) => post.source_id);
  const featured = featuredIds.map((id) => city.posts.find((post) => post.source_id === id)).filter(Boolean).slice(0, 3);
  const rest = city.posts.filter((post) => !featured.some((item) => item.source_id === post.source_id));
  const dayMapSpots = (config.map_spot_ids || []).map(photoSpotById).filter(Boolean);
  const mapSpotText = dayMapSpots.length ? `地图已标出：${dayMapSpots.map((spot) => spot.label).join("、")}` : "今天没有另外标出的拍照点";
  const postImages = city.images || [];
  const licensedImages = city.licensed_images || [];
  const imageCount = postImages.length + licensedImages.length;
  return `
    <details class="photo-reference-section photo-reference-details">
      <summary class="photo-reference-summary">
        <div><span class="section-kicker">拍照参考 · 可选</span><h3>拍照参考</h3></div>
        <span class="muted-label">${city.posts.length} 篇 · ${imageCount} 张图</span><b aria-hidden="true">＋</b>
      </summary>
      <div class="photo-reference-body">
        <p class="photo-reference-intro">${escapeHtml(config.intro || city.intro || "先看机位提示，再决定是否拍摄。")}</p>
        <p class="photo-reference-map-note"><span>◎</span>${escapeHtml(mapSpotText)}。地图上的相机点是参考位置，不代表可以占用通道或保证空场。</p>
        ${postImages.length ? `
          <div class="photo-image-group">
            <div class="photo-image-heading"><strong>小红书动作与构图参考</strong><span>${postImages.length} 张已归档图片</span></div>
            <div class="photo-static-strip">${postImages.map((image) => photoImageMarkup(image)).join("")}</div>
          </div>
        ` : ""}
        ${licensedImages.length ? `
          <div class="photo-image-group is-licensed-group">
            <div class="photo-image-heading"><strong>公开授权景点图</strong><span>${licensedImages.length} 张 · 已记录作者与许可</span></div>
            <div class="photo-static-strip">${licensedImages.map((image) => photoImageMarkup(image)).join("")}</div>
          </div>
        ` : ""}
        <div class="photo-featured-heading"><strong>先看这 3 篇</strong><span>复制链接后唤起小红书 App</span></div>
        <div class="photo-featured-links">${featured.map((post) => xhsButtonMarkup(post)).join("")}</div>
        ${rest.length ? `
          <details class="photo-post-library">
            <summary><span>查看其余 ${rest.length} 篇参考帖</span><b>＋</b></summary>
            <div class="photo-post-list">
              ${rest.map((post) => `<article class="photo-post-row"><div><strong>${escapeHtml(post.title)}</strong><small>${escapeHtml(post.location || "已读拍照参考")}</small><em>${escapeHtml(post.hint || "只作构图灵感")}</em></div>${xhsButtonMarkup(post, "xhs-library-button")}</article>`).join("")}
            </div>
          </details>
        ` : ""}
        <p class="photo-reference-note">小红书帖子只用于动作、构图和机位线索；公开授权景点图只帮助理解建筑、街巷和机位空间。开放时间、门票、拍摄许可和现场动线仍以官方页面与当日标识为准。点击帖子按钮会先复制分享链接，再尝试打开手机端小红书 App；没有 App 才回退到网页。</p>
      </div>
    </details>
  `;
}

function bindXhsEvents() {
  document.querySelectorAll("[data-xhs-url]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const shareUrl = button.dataset.xhsUrl;
      const appUrl = button.dataset.xhsAppUrl;
      const copyResult = navigator.clipboard?.writeText(shareUrl);
      if (copyResult) copyResult.catch(() => {});

      let leftPage = false;
      const markLeftPage = () => {
        if (document.hidden) leftPage = true;
      };
      const cleanup = () => {
        document.removeEventListener("visibilitychange", markLeftPage);
        window.removeEventListener("pagehide", markPageHidden);
      };
      const markPageHidden = () => {
        leftPage = true;
      };
      document.addEventListener("visibilitychange", markLeftPage);
      window.addEventListener("pagehide", markPageHidden, { once: true });
      window.setTimeout(() => {
        const appOpened = leftPage || document.hidden;
        cleanup();
        if (!appOpened) {
          showToast("未检测到小红书 App，改用网页链接");
          window.location.assign(shareUrl);
        }
      }, 1800);

      try {
        window.location.assign(appUrl);
      } catch {
        window.location.assign(shareUrl);
      }
    });
  });
}

function weatherMarkup(day) {
  const city = WEATHER_CITIES[day.city_id];
  if (!city) return "";
  const climate = day.date.slice(5, 7) === "12" ? city.december : city.january;
  const status = forecastWindow(day.date) ? "正在查询当天预报…" : "该日不在未来 7 天预报范围，暂无逐日预报。";
  return `<section class="weather-card" aria-label="当天天气"><div class="card-heading-row"><div><span class="section-kicker">天气 · ${escapeHtml(city.name)}${day.travel_day ? "（抵达城市）" : ""}</span><h3>当天出行天气</h3></div><a class="text-link" href="${escapeHtml(city.forecast)}" target="_blank" rel="noreferrer">AEMET 官方预报 ↗</a></div><p class="weather-status" data-weather-date="${escapeHtml(day.date)}">${escapeHtml(status)}</p><p>历史气候参考：机场站${day.date.slice(5,7) === "12" ? "12月" : "1月"}平均日最高 / 最低 ${escapeHtml(climate)}°C（1981–2010），不是当日预报。</p><a href="${escapeHtml(city.climate)}" target="_blank" rel="noreferrer">查看 AEMET 气候资料 ↗</a></section>`;
}

async function updateWeather(day) {
  const city = WEATHER_CITIES[day.city_id];
  if (!city || !forecastWindow(day.date)) return;
  try {
    const value = await fetchDayForecast(city, day.date);
    const target = document.querySelector(`[data-weather-date="${day.date}"]`);
    if (!target || state.selectedDate !== day.date || state.selectedTab !== "today") return;
    const rain = value.rain === null ? "降水概率暂无数据" : `最大降水概率 ${value.rain}%`;
    target.textContent = `Open-Meteo 当日预报：最高 ${value.high}°C / 最低 ${value.low}°C；${rain}。更新于 ${new Date().toLocaleString("zh-CN", {timeZone:"Asia/Hong_Kong"})}（香港时间）；请同时查看 AEMET 官方预警。`;
  } catch {
    const target = document.querySelector(`[data-weather-date="${day.date}"]`);
    if (target && state.selectedDate === day.date && state.selectedTab === "today") target.textContent = "当天预报暂时无法获取；请打开 AEMET 官方预报，离线时稍后重试。";
  }
}

function dailyTransitMarkup(day) {
  const route = state.plan?.pre_departure?.city_transport?.daily_routes?.[day?.date];
  if (!route) return "";
  return `
    <section class="daily-transit-card" aria-label="今日市内接驳">
      <div class="card-heading-row"><div><span class="section-kicker">今天怎么坐车 · 按候选住宿</span><h3>${escapeHtml(route.title)}</h3></div></div>
      <p class="daily-transit-intro">${escapeHtml(route.intro)}</p>
      <div class="daily-transit-segments">${route.segments.map((item) => `
        <article class="daily-transit-segment"><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.text)}</p>${item.map_url ? `<a href="${escapeHtml(item.map_url)}" target="_blank" rel="noreferrer">打开路线导航 ↗</a>` : ""}</article>
      `).join("")}</div>
      <details class="daily-transit-sources"><summary>查看线路和时刻来源</summary><div>${route.sources.map((source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)} ↗</a>`).join("")}</div></details>
      <p class="daily-transit-footnote">住宿与车票均未确认；节日班次、入口、转乘和航站楼以出发前及当天官方信息为准。</p>
    </section>
  `;
}

function renderToday(day) {
  const completedCount = day.timeline.filter((_, index) => isComplete(day, index)).length;
  const progress = Math.round((completedCount / Math.max(1, day.timeline.length)) * 100);
  const walking = walkingStatus(day);
  const hero = heroForDay(day);
  const firstUnfinishedIndex = day.timeline.findIndex((_, index) => !isComplete(day, index));
  const allComplete = firstUnfinishedIndex < 0;
  const firstOpenIndex = allComplete ? Math.max(0, day.timeline.length - 1) : firstUnfinishedIndex;
  const heroMarkup = hero ? `<img class="day-hero-image" src="${hero}" alt="西班牙旅途视觉" loading="lazy" />` : "";

  elements.appContent.innerHTML = `
    <section class="day-intro-card">
      <div class="day-intro-top">
        <span class="section-kicker">${escapeHtml(formatDate(day.date))} · ${escapeHtml(formatDayNumber(currentDayIndex()))}</span>
        <span class="progress-label">${completedCount}/${day.timeline.length} 完成</span>
      </div>
      <h2>${escapeHtml(day.label)}</h2>
      <p class="day-city">${escapeHtml(cityDisplay(day))}</p>
      <p class="day-ribbon">${escapeHtml(day.ribbon || "按今天这条路线走，累了就跳过可选部分。")}</p>
      <div class="day-metrics">
        <span class="metric-pill metric-${walking.tone}"><b>走动</b><strong>${escapeHtml(walking.km)}</strong><small>${escapeHtml(walking.label)}</small></span>
        <span class="metric-pill"><b>节奏</b><strong>${isTravelDay(day) ? "缓冲日" : "分段走"}</strong><small>${isTravelDay(day) ? "先交通入住" : "累了就折返"}</small></span>
      </div>
      <div class="progress-track" aria-label="今日完成度"><span style="width:${progress}%"></span></div>
      ${heroMarkup}
    </section>

    ${weatherMarkup(day)}

    ${nextStepMarkup(day, firstOpenIndex, allComplete)}

    ${dailyTransitMarkup(day)}

    <button class="transport-shortcut" data-open-transport type="button"><span><strong>市内交通与购票</strong><small>三城刷卡、交通卡和机场票券</small></span><span aria-hidden="true">→</span></button>

    <section class="timeline-card">
      <div class="card-heading-row">
        <div><span class="section-kicker">今天路线</span><h3>今天按这个顺序走</h3></div>
        <button class="small-action" data-open-step="${firstOpenIndex}" type="button">${allComplete ? "回看最后一步" : "从这里开始"}</button>
      </div>
      <div class="timeline-list">
        ${day.timeline.map((item, index) => {
          const done = isComplete(day, index);
          const isNext = !allComplete && index === firstOpenIndex;
          return `
            <article class="timeline-row ${done ? "is-done" : ""} ${isNext ? "is-next" : ""}" data-step-index="${index}">
              <div class="timeline-time">${escapeHtml(item.t)}</div>
              <div class="timeline-rail"><span class="timeline-dot ${done ? "is-done" : ""}">${done ? "✓" : iconForKind(item.kind)}</span></div>
              <div class="timeline-body">
                <div class="timeline-meta"><span class="kind-label">${escapeHtml(kindLabel(item.kind))}</span>${tagMarkup(item.tag)}</div>
                <button class="timeline-title" data-open-step="${index}" type="button">${escapeHtml(item.what)}</button>
                ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}
                ${ticketPriceMarkup(item)}
                ${stepPhotoMarkup(day, item, index, { compact: true })}
                <div class="row-actions">
                  <button class="check-button ${done ? "is-done" : ""}" data-toggle-step="${index}" type="button" aria-label="${done ? "取消完成" : "标记完成"}">${done ? "完成" : "完成这步"}</button>
                  ${navigationRowMarkup(day, item, index)}
                  ${nonNavigationOfficialUrl(item) ? `<a href="${escapeHtml(nonNavigationOfficialUrl(item))}" target="_blank" rel="noreferrer">${officialLinkLabel(item)}</a>` : ""}
                </div>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>

    ${dailyMapMarkup(day)}

    ${lodgingMarkup(day)}

    ${isTravelDay(day) ? `
      <section class="route-card">
          <div class="card-heading-row">
          <div><span class="section-kicker">交通</span><h3>今天的交通</h3></div>
          <a class="text-link" href="${escapeHtml(dayRouteUrl(day))}" target="_blank" rel="noreferrer">核对目的地 ↗</a>
        </div>
        <div class="route-order">巴塞罗那 → 塞维利亚 → 格拉纳达 → 巴塞罗那</div>
        <p>只按最终车票、航站楼和住宿地址行动；不要把不确定的换乘写成“肯定赶得上”。</p>
      </section>
    ` : ""}

    ${restaurantMarkup(day)}

    ${photoReferencesMarkup(day)}

    <section class="quick-grid" aria-label="旅行辅助">
      <button class="quick-card quick-food" data-quick-kind="meal" type="button">
        <span class="quick-image"><img src="./assets/trip/tapas.jpg" alt="西班牙小食" loading="lazy" /></span>
        <span><strong>下一顿吃什么</strong><small>只在附近找，先看开门和排队</small></span>
      </button>
      <button class="quick-card quick-photo" data-quick-kind="photo" type="button">
        <span class="quick-image"><img src="./assets/trip/seville-pose.jpg" alt="塞维利亚人像动作参考" loading="lazy" /></span>
        <span><strong>找到拍照机位</strong><small>先看人像动作，再看现场光线</small></span>
      </button>
    </section>

    ${changeGuardMarkup(day)}
    ${safetyFooterMarkup(state.plan)}
 `;

  bindTodayEvents();
  bindXhsEvents();
}

function renderStep(day) {
  const index = Math.min(Math.max(0, state.currentIndex), day.timeline.length - 1);
  state.currentIndex = index;
  saveNavigation();
  const item = day.timeline[index];
  const walking = walkingStatus(day);
  const done = isComplete(day, index);
  const previous = index > 0 ? index - 1 : null;
  const next = index < day.timeline.length - 1 ? index + 1 : null;
  const isTransfer = item.kind === "hop" || isTravelDay(day);

  elements.appContent.innerHTML = `
    <section class="step-focus-card">
      <div class="step-focus-top"><span class="section-kicker">当前步骤 · ${String(index + 1).padStart(2, "0")} / ${String(day.timeline.length).padStart(2, "0")}</span><span class="focus-date">${escapeHtml(formatDate(day.date))}</span></div>
      <div class="step-time">${escapeHtml(item.t)}</div>
      <h2>${escapeHtml(item.what)}</h2>
      <div class="step-badges"><span class="kind-label">${escapeHtml(kindLabel(item.kind))}</span>${tagMarkup(item.tag)}${item.verify ? `<span class="verify-label">${escapeHtml(item.verify)}</span>` : ""}</div>
      <p class="step-note">${escapeHtml(item.note || "先按这一步做；不确定时先看官方信息。")}</p>
      <div class="step-support-row"><span>今天走 ${escapeHtml(walking.km)}</span><span>${escapeHtml(walking.label)}</span><span>${isTravelDay(day) ? "先处理交通和入住" : "按今天这条路线走"}</span></div>
      <div class="step-actions">
        <button class="primary-button ${done ? "is-complete" : ""}" data-toggle-step="${index}" type="button">${done ? "已完成 · 点此取消" : "完成当前步骤"}</button>
        ${nonNavigationOfficialUrl(item) ? `<a class="secondary-button" href="${escapeHtml(nonNavigationOfficialUrl(item))}" target="_blank" rel="noreferrer">${officialLinkLabel(item)}</a>` : ""}
      </div>
      ${stepNavigationMarkup(day, item, index)}
    </section>

    ${stepPhotoMarkup(day, item, index)}

    ${isTransfer ? `<section class="step-image-card"><div><span class="section-kicker">留出交通时间</span><p>交通日不追景点。先核对车票、站台、行李和入住地址；晚到时按当天交通安排直接入住和用餐。</p></div></section>` : ""}

    ${lodgingMarkup(day)}
    ${restaurantMarkup(day, item)}
    ${photoReferencesMarkup(day)}

    <section class="navigation-card">
      <div class="card-heading-row"><div><span class="section-kicker">接下来</span><h3>只看前后两步</h3></div><span class="muted-label">${completedCount(day)}/${day.timeline.length} 完成</span></div>
      <div class="step-nav-buttons">
        <button class="nav-step-button" data-step-nav="${previous ?? ""}" ${previous === null ? "disabled" : ""} type="button"><span>← 上一步</span>${previous === null ? "已经是第一步" : escapeHtml(day.timeline[previous].what)}</button>
        <button class="nav-step-button next" data-step-nav="${next ?? ""}" ${next === null ? "disabled" : ""} type="button"><span>下一步 →</span>${next === null ? "今天已到最后" : escapeHtml(day.timeline[next].what)}</button>
      </div>
    </section>

    ${day.late_cut ? `
      <section class="step-safety-card">
        <span class="section-kicker">遇到变化</span>
        <h3>如果现场有变化怎么办？</h3>
        <p>${escapeHtml(day.late_cut)}</p>
        ${stepSafetyNavigationMarkup(day, item, index)}
      </section>
    ` : ""}

    ${safetyFooterMarkup(state.plan)}
  `;

  document.querySelectorAll("[data-toggle-step]").forEach((button) => {
    button.addEventListener("click", () => toggleComplete(Number(button.dataset.toggleStep)));
  });
  document.querySelectorAll("[data-step-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled || button.dataset.stepNav === "") return;
      state.currentIndex = Number(button.dataset.stepNav);
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  bindXhsEvents();
}

function completedCount(day) {
  return day.timeline.filter((_, index) => isComplete(day, index)).length;
}

function bindTodayEvents() {
  document.querySelectorAll("[data-open-transport]").forEach((button) => {
    button.addEventListener("click", () => setTab("transport"));
  });
  document.querySelectorAll("[data-open-prep]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedTab = "prep";
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-open-step]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      state.currentIndex = Number(button.dataset.openStep);
      state.selectedTab = "step";
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-toggle-step]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleComplete(Number(button.dataset.toggleStep));
    });
  });

  document.querySelectorAll("[data-step-index]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest("button, a")) return;
      state.currentIndex = Number(row.dataset.stepIndex);
      state.selectedTab = "step";
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-quick-kind]").forEach((button) => {
    button.addEventListener("click", () => {
      const day = currentDay();
      let targetIndex = day.timeline.findIndex((item) => {
        if (item.kind !== button.dataset.quickKind) return false;
        if (button.dataset.quickKind !== "meal") return true;
        const period = mealPeriodForItem(item);
        return restaurantMealPeriods.has(period) && restaurantsForDay(day, period).length > 0;
      });
      if (targetIndex < 0) targetIndex = day.timeline.findIndex((item) => item.kind === button.dataset.quickKind);
      if (targetIndex < 0) {
        showToast("今天没有单独安排这一类步骤");
        return;
      }
      state.currentIndex = targetIndex;
      state.selectedTab = "step";
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function render() {
  if (!state.plan) return;
  if (!state.plan.days.some((day) => day.date === state.selectedDate)) state.selectedDate = state.plan.days[0]?.date || DEFAULT_DATE;
  saveNavigation();
  const day = currentDay();
  const isPreparation = state.selectedTab === "prep";
  const isTransport = state.selectedTab === "transport";
  elements.dayStrip.hidden = isPreparation || isTransport;
  elements.viewTabs.hidden = isPreparation || isTransport;
  if (!isPreparation && !isTransport) renderDayPicker();
  renderTabs();
  if (isPreparation) renderPreDeparture(state.plan.pre_departure);
  else if (isTransport) renderCityTransport(state.plan.pre_departure?.city_transport);
  else if (state.selectedTab === "step") renderStep(day);
  else { renderToday(day); updateWeather(day); }
}

function setTab(tab) {
  state.selectedTab = tab;
  saveNavigation();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2200);
}

function updateConnectionState() {
  const online = navigator.onLine;
  elements.connectionState.classList.toggle("is-offline", !online);
  elements.connectionState.innerHTML = `<span class="status-dot"></span>${online ? "在线 · 已启用离线缓存" : "离线 · 使用已缓存内容"}`;
}

async function copyEntryLink() {
  const url = new URL(window.location.href);
  url.hash = `${state.selectedDate}/${state.selectedTab}/${state.currentIndex}`;
  try {
    await navigator.clipboard.writeText(url.toString());
    showToast("当前攻略入口已复制");
  } catch {
    showToast("请复制浏览器地址栏链接");
  }
}

function readHash() {
  const [date, tab, index] = window.location.hash.replace(/^#/, "").split("/");
  if (date && state.plan?.days?.some((day) => day.date === date)) state.selectedDate = date;
  if (tab === "today" || tab === "step" || tab === "prep" || tab === "transport") state.selectedTab = tab;
  if (Number.isInteger(Number(index))) state.currentIndex = Number(index);
}

function wireGlobalEvents() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    if (button.id === "copy-link-button") return;
    button.addEventListener("click", () => setTab(button.dataset.tab));
  });
  elements.copyLinkButton.addEventListener("click", copyEntryLink);
  window.addEventListener("online", updateConnectionState);
  window.addEventListener("offline", updateConnectionState);
  window.addEventListener("hashchange", () => {
    readHash();
    render();
  });
  elements.closeInstallDialog.addEventListener("click", () => elements.installDialog.close());
  elements.installButton.addEventListener("click", async () => {
    if (state.installPrompt) {
      state.installPrompt.prompt();
      await state.installPrompt.userChoice;
      state.installPrompt = null;
      elements.installButton.hidden = true;
      return;
    }
    elements.installDialog.showModal();
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.installPrompt = event;
    elements.installButton.hidden = false;
  });
  window.addEventListener("appinstalled", () => {
    elements.installButton.hidden = true;
    showToast("已安装到主屏幕");
  });
}

async function loadPlan() {
  try {
    const response = await fetch("./plan.geo.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.plan = await response.json();
    try {
      const preparationResponse = await fetch("./pre-departure.json", { cache: "no-cache" });
      if (preparationResponse.ok) state.plan.pre_departure = await preparationResponse.json();
    } catch {
      // The itinerary remains usable if the optional preparation payload is unavailable.
    }
    try {
      const photoReferencesResponse = await fetch("./photo-references.json", { cache: "no-cache" });
      if (photoReferencesResponse.ok) state.photoReferences = await photoReferencesResponse.json();
    } catch {
      // The three legacy cards embedded in plan.geo.json remain available as a fallback.
    }
    readHash();
    render();
  } catch (error) {
    elements.appContent.innerHTML = `
      <section class="error-card">
        <span class="section-kicker">需要通过网页地址打开</span>
        <h2>行程数据没有载入</h2>
        <p>请用 GitHub Pages、Cloudflare Pages、ngrok 或本地 HTTP 服务打开这个文件夹。直接双击 <code>index.html</code> 的 <code>file://</code> 模式会被浏览器拦截数据读取。</p>
        <p class="error-detail">${escapeHtml(error.message)}</p>
      </section>
    `;
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || window.location.protocol === "file:") return;
  navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {
    // The guide remains usable online if a host does not allow service workers.
  });
}

wireGlobalEvents();
updateConnectionState();
registerServiceWorker();
loadPlan();
