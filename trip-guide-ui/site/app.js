const STORAGE_KEY = "spain-guide-ui-progress-v1";
const NAVIGATION_KEY = "spain-guide-ui-navigation-v1";
const PREPARATION_KEY = "spain-guide-ui-preparation-v1";
const DEFAULT_DATE = "2027-01-26";
const savedNavigation = loadNavigation();

const state = {
  plan: null,
  selectedDate: savedNavigation.date || DEFAULT_DATE,
  selectedTab: ["today", "step", "prep"].includes(savedNavigation.tab) ? savedNavigation.tab : "today",
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
  check: "确认",
  hop: "转场",
  lodging: "入住",
  meal: "用餐",
  anchor: "预约事项",
  photo: "拍照",
  rest: "休息",
  free: "空档"
};

const tagLabels = {
  pinned: "固定节点",
  opener: "优先开始"
};

const NAVIGATION_OVERRIDES = {
  "2027-01-26": {
    0: { stop: "Madrid-Barajas Airport（入境节点）", mode: "transit" },
    1: { stop: "Madrid-Barajas Airport（入境节点）", mode: "transit" },
    2: { label: "Madrid Puerta de Atocha 火车站", query: "Madrid Puerta de Atocha railway station, Madrid, Spain", mode: "transit" },
    5: { label: "圣家堂", query: "Basílica de la Sagrada Família, Barcelona, Spain", mode: "walking" }
  },
  "2027-01-27": {
    1: { stop: "Sagrada Família", mode: "walking" },
    2: { stop: "Sagrada Família", mode: "walking" },
    3: { stop: "Sagrada Família", mode: "walking" },
    4: { stop: "Sant Pau", mode: "walking" },
    5: { stop: "Sant Pau", mode: "walking" },
    8: { stop: "Sagrada Família", mode: "walking" },
    9: { label: "Eixample", query: "Eixample, Barcelona, Spain", mode: "walking" }
  },
  "2027-01-28": {
    1: { stop: "Passeig de Gràcia", mode: "walking" },
    2: { stop: "Casa Batlló", mode: "walking" },
    3: { stop: "La Pedrera", mode: "walking" },
    4: { stop: "La Pedrera", mode: "walking" },
    7: { stop: "Passeig de Gràcia", mode: "walking" },
    8: { label: "Arc de Triomf", query: "Arc de Triomf, Barcelona, Spain", mode: "walking" },
    9: { label: "Parc de la Ciutadella", query: "Parc de la Ciutadella, Barcelona, Spain", mode: "walking" }
  },
  "2027-01-29": {
    1: { stop: "Barcelona departure", mode: "transit" },
    2: { stop: "Barcelona departure", mode: "transit" },
    4: { stop: "Granada Cathedral", mode: "walking" },
    5: { stop: "Granada base", mode: "walking" },
    6: { stop: "Granada Cathedral", mode: "walking" },
    7: { label: "Gran Vía de Colón", query: "Gran Vía de Colón, Granada, Spain", mode: "walking" }
  },
  "2027-01-30": {
    2: { stop: "Alhambra", mode: "transit" },
    3: { stop: "Alhambra", mode: "walking" },
    4: { stop: "Nasrid Palaces", mode: "walking" },
    5: { stop: "Alhambra", mode: "walking" },
    7: { label: "Generalife", query: "Generalife, Granada, Spain", mode: "walking" },
    8: { stop: "Nasrid Palaces", mode: "walking" },
    11: { label: "Gran Vía de Colón", query: "Gran Vía de Colón, Granada, Spain", mode: "walking" }
  },
  "2027-01-31": {
    1: { stop: "Granada departure", mode: "transit" },
    2: { stop: "Granada departure", mode: "transit" },
    3: { stop: "Seville base", mode: "walking" },
    4: { stop: "Seville base", mode: "walking" },
    5: { stop: "Plaza de España", mode: "walking" },
    6: { stop: "Plaza de España", mode: "walking" }
  },
  "2027-02-01": {
    1: { stop: "Real Alcázar", mode: "walking" },
    2: { stop: "Real Alcázar", mode: "walking" },
    3: { stop: "Cathedral and Giralda", mode: "walking" },
    4: { stop: "Cathedral and Giralda", mode: "walking" },
    5: { stop: "Santa Cruz", mode: "walking" },
    6: { stop: "Cathedral and Giralda", mode: "walking" },
    8: { stop: "Santa Cruz", mode: "walking" },
    9: { stop: "Santa Cruz", mode: "walking" },
    10: { stop: "Seville base", mode: "walking" },
    12: { stop: "Seville base", mode: "walking" }
  },
  "2027-02-02": {
    1: { stop: "Plaza de España", mode: "walking" },
    2: { stop: "Seville base", mode: "walking" },
    4: { stop: "Sevilla Santa Justa", mode: "transit" },
    5: { stop: "Sevilla Santa Justa", mode: "transit" },
    6: { stop: "Madrid Puerta de Atocha", mode: "transit" }
  },
  "2027-02-03": {
    2: { stop: "Adolfo Suárez Madrid–Barajas Airport", mode: "transit" }
  }
};

const TRAVEL_MODES = [
  { id: "walking", label: "步行" },
  { id: "transit", label: "公共交通" },
  { id: "driving", label: "驾车 / 打车" }
];

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
  if (!target && !routeLink) return `<span class="nav-unavailable">地点未单独锁定</span>`;
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
    return `<div class="step-navigation-missing"><strong>这一步没有单一目的地</strong><span>住宿、早餐或候选餐厅仍需出发前确认具体地址，暂不生成模糊地图入口。</span></div>`;
  }
  if (!target) {
    return `<div class="step-navigation"><div class="step-navigation-heading"><span>已排好的路线</span><strong>按当前路线核对</strong></div><a class="step-navigation-route" href="${escapeHtml(routeLink)}" target="_blank" rel="noreferrer">打开这段路线 ↗</a></div>`;
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
  return `<span class="nav-unavailable">这一步没有单一目的地，不生成模糊导航</span>`;
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

function isTravelDay(day) {
  return Boolean(day?.travel_day || String(day?.city || "").includes("→"));
}

function walkingStatus(day) {
  const km = Number(day?.walking_km?.total);
  if (!Number.isFinite(km)) return { km: "待估", label: "按体力分段", tone: "soft" };
  if (km <= 3) return { km: `${km} km`, label: "轻松", tone: "easy" };
  if (km <= 5.5) return { km: `${km} km`, label: "中等·可分段", tone: "medium" };
  return { km: `${km} km`, label: "偏多·提前折返", tone: "hard" };
}

function budgetGuardMarkup() {
  return `
    <details class="guard-card">
      <summary><span class="guard-icon budget-icon">￥</span><span><strong>预算护栏</strong><small>先看上限，再决定</small></span></summary>
      <div class="guard-detail">
        <p>住宿目标约 CNY 1200/晚，上限 CNY 1500/晚；当前候选仍未预订。</p>
        <p>机票每人目标不超过 RMB 4500 / HKD 5000；没写清税费、行李和完整行程，就先不付款。</p>
        <p class="guard-muted">金额是研究基准，不是当天可购买价格。</p>
      </div>
    </details>
  `;
}

function safetyGuardMarkup(plan) {
  const emergency = plan?.brief?.emergency || "西班牙紧急电话 112；出发前补入领馆、医院和保险援助电话。";
  const safety = plan?.brief?.safety || "人多时把包放身前，夜间走照明主路，使用正规交通。";
  return `
    <details class="guard-card">
      <summary><span class="guard-icon safety-icon">!</span><span><strong>安全与应急</strong><small>三人一起走，先保安全</small></span></summary>
      <div class="guard-detail">
        <p>${escapeHtml(safety)}</p>
        <p>${escapeHtml(emergency)}</p>
        <a class="emergency-link" href="tel:112">拨打 112</a>
      </div>
    </details>
  `;
}

function delayGuardMarkup(day) {
  return `
    <details class="guard-card">
      <summary><span class="guard-icon delay-icon">↗</span><span><strong>遇到变化怎么办</strong><small>按备用安排走，不追赶</small></span></summary>
      <div class="guard-detail">
        <p>${escapeHtml(day.late_cut || "遇到延误时，按已经准备好的转场、入住和用餐安排执行。")}</p>
        <p>${escapeHtml(day.rain_alt || "下雨时，按已经准备好的室内或有遮蔽路线执行；不临时增加跨区行程。")}</p>
      </div>
    </details>
  `;
}

function walkingGuardMarkup(day) {
  const walking = walkingStatus(day);
  return `
    <details class="guard-card">
      <summary><span class="guard-icon walk-icon">↝</span><span><strong>今天走多少</strong><small>${escapeHtml(walking.km)} · ${escapeHtml(walking.label)}</small></span></summary>
      <div class="guard-detail">
        <p>${escapeHtml(day.walking_km?.how || "按三位旅伴的体力分段；任何时候都可以坐车或提前回住处。")}</p>
        <p>路线已经提前排好，按三位旅伴的体力完成主线即可，不需要为了赶进度加速。</p>
      </div>
    </details>
  `;
}

function guardPanelMarkup(day) {
  return `
    <section class="guard-panel">
      <div class="card-heading-row">
        <div><span class="section-kicker">EASY MODE</span><h3>三人同行，只要记住这四件事</h3></div>
        <span class="muted-label">点开看细节</span>
      </div>
      <div class="guard-grid">
        ${walkingGuardMarkup(day)}
        ${budgetGuardMarkup()}
        ${delayGuardMarkup(day)}
        ${safetyGuardMarkup(state.plan)}
      </div>
    </section>
  `;
}

function heroForDay(day) {
  if (!day) return null;
  if (day.city.includes("Seville") || day.city.includes("塞维利亚")) return "./assets/trip/seville-hero.jpg";
  if (isTravelDay(day)) return "./assets/trip/route-map.jpg";
  return null;
}

function renderDayPicker() {
  if (!state.plan?.days) return;
  elements.dayCount.textContent = `${state.plan.days.length} 天 · 可随时切换`;
  elements.dayPicker.innerHTML = state.plan.days.map((day, index) => `
    <button class="day-chip ${day.date === state.selectedDate ? "is-selected" : ""}" data-date="${escapeHtml(day.date)}" role="listitem" type="button">
      <span class="day-chip-number">${formatDayNumber(index)}</span>
      <span class="day-chip-date">${escapeHtml(formatDate(day.date))}</span>
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

function renderPreDeparture(preparation) {
  if (!preparation) {
    elements.appContent.innerHTML = `
      <section class="error-card prep-load-error">
        <span class="section-kicker">PRE-DEPARTURE</span>
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
      <div class="prep-hero-top"><span class="section-kicker">PRE-DEPARTURE · ${escapeHtml(preparation.updated_at)}</span><span class="prep-status">${progress.completed}/${progress.total} 已完成</span></div>
      <h2>出发前，把路线和两件大事定下来</h2>
      <p>${escapeHtml(preparation.basis)}</p>
      <div class="prep-progress-track" aria-label="行前清单完成度"><span style="width:${progress.percent}%"></span></div>
      <div class="prep-hero-meta"><span>签证：${escapeHtml(visa.status)}</span><span>行李：三人冬季转场</span></div>
    </section>

    <section class="prep-section plan-lock-section">
      <div class="prep-section-heading"><div><span class="section-kicker">00 · ITINERARY</span><h3>先把行程定稿</h3></div><span class="prep-count">出发前完成</span></div>
      <p class="prep-summary">出发前确认每天的主线、预约、交通、住宿和备用安排。需要删改的内容在这里处理；出发后只按已经定好的路线执行，不在当天临时改行程。</p>
      <div class="prep-hard-rules">
        <p><span>✓</span>先核对车票、预约时段、住宿地址和机场衔接。</p>
        <p><span>✓</span>把天气、体力和晚到时的备用走法提前写进当天安排。</p>
        <p><span>✓</span>出发后只记录完成情况；行程调整回到本页，在出发前处理。</p>
      </div>
    </section>

    <section class="prep-section visa-prep-section">
      <div class="prep-section-heading"><div><span class="section-kicker">01 · VISA</span><h3>${escapeHtml(visa.title)}</h3></div><span class="prep-count">${visa.steps.filter((step) => state.preparation[step.id]).length}/${visa.steps.length}</span></div>
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
      <div class="prep-section-heading"><div><span class="section-kicker">02 · PACKING</span><h3>${escapeHtml(baggage.title)}</h3></div><span class="prep-count">${baggage.groups.flatMap((group) => group.items).filter((item) => state.preparation[item.id]).length}/${baggage.groups.flatMap((group) => group.items).length}</span></div>
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

    <section class="prep-footer-note"><span class="section-kicker">KEEP IT LOCAL</span><p>勾选进度只保存在这台手机的浏览器本地。它不会保存护照号、申请号、保单号或支付资料；签证、航班、行李和安检规则仍以出发前官方页面为准。</p></section>
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
  return state.plan?.hotels?.find((hotel) => hotel.city_id === day?.city_id) || null;
}

function hotelStatusLabel(status) {
  return {
    selected_candidate: "优先候选",
    candidate: "待确认候选",
    conditional_candidate: "有条件候选",
    to_select: "出发前选择"
  }[status] || "候选入口";
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
      <summary><span><span class="section-kicker">STAY</span><strong>住宿入口</strong><small>${escapeHtml(hotelStatusLabel(hotel.status))} · ${escapeHtml(hotel.area)}</small></span><b>＋</b></summary>
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
        <p class="lodging-note">这里只打开 Airbnb、Trip.com、携程或机场官方页面，不创建订单。床型、税费、取消截止和最终地址请在出发前重新核对。</p>
      </div>
    </details>
  `;
}

function photoReferenceGroupForDay(day) {
  if (!day || isTravelDay(day)) return null;
  return state.plan?.photo_references?.find((group) => group.city_id === day.city_id) || null;
}

function photoReferencesMarkup(day) {
  const group = photoReferenceGroupForDay(day);
  if (!group || !group.items?.length) return "";
  return `
    <section class="photo-reference-section">
      <div class="card-heading-row">
        <div><span class="section-kicker">PHOTO REFERENCES</span><h3>打卡参考图</h3></div>
        <span class="muted-label">${group.items.length} 篇原帖</span>
      </div>
      <p class="photo-reference-intro">${escapeHtml(group.title)}。${escapeHtml(group.note)}</p>
      <div class="photo-reference-strip">
        ${group.items.map((item) => `
          <article class="photo-reference-item">
            <img src="${escapeHtml(assetUrl(item.image))}" alt="${escapeHtml(item.title)}" loading="lazy" />
            <div class="photo-reference-copy"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.caption)}</small></div>
            <button class="xhs-copy-button" type="button" data-xhs-url="${escapeHtml(item.source_url)}" data-xhs-app-url="${escapeHtml(xhsAppUrl(item.source_id))}">复制链接并打开 App ↗</button>
            <span class="photo-source-id">笔记 ${escapeHtml(item.source_id)}</span>
          </article>
        `).join("")}
      </div>
      <p class="photo-reference-note">点击按钮会先复制分享链接，再唤起小红书 App 打开对应笔记；若手机未安装 App，才回退到网页。帖子只用于动作和构图灵感，不代替官方开放时间或现场规则。</p>
    </section>
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

function renderToday(day) {
  const completedCount = day.timeline.filter((_, index) => isComplete(day, index)).length;
  const progress = Math.round((completedCount / Math.max(1, day.timeline.length)) * 100);
  const walking = walkingStatus(day);
  const hero = heroForDay(day);
  const firstOpenIndex = Math.max(0, day.timeline.findIndex((_, index) => !isComplete(day, index)));
  const heroMarkup = hero ? `<img class="day-hero-image" src="${hero}" alt="西班牙旅途视觉" loading="lazy" />` : "";

  elements.appContent.innerHTML = `
    <section class="day-intro-card">
      <div class="day-intro-top">
        <span class="section-kicker">${escapeHtml(formatDate(day.date))} · ${escapeHtml(formatDayNumber(currentDayIndex()))}</span>
        <span class="progress-label">${completedCount}/${day.timeline.length} 完成</span>
      </div>
      <h2>${escapeHtml(day.label)}</h2>
      <p class="day-city">${escapeHtml(cityDisplay(day))}</p>
      <p class="day-ribbon">${escapeHtml(day.ribbon || "按已经确定的顺序执行；遇到延误就转入当天备用安排。")}</p>
      <div class="day-metrics">
        <span class="metric-pill metric-${walking.tone}"><b>走动</b><strong>${escapeHtml(walking.km)}</strong><small>${escapeHtml(walking.label)}</small></span>
        <span class="metric-pill"><b>节奏</b><strong>${isTravelDay(day) ? "缓冲日" : "分段走"}</strong><small>${isTravelDay(day) ? "先交通入住" : "累了就折返"}</small></span>
        <span class="metric-pill"><b>住宿</b><strong>≤ CNY 1500</strong><small>每晚封顶</small></span>
        <a class="metric-pill metric-link" href="tel:112"><b>应急</b><strong>112</strong><small>点击拨号</small></a>
      </div>
      <div class="progress-track" aria-label="今日完成度"><span style="width:${progress}%"></span></div>
      ${heroMarkup}
    </section>

    <section class="decision-card">
      <div class="decision-icon" aria-hidden="true">!</div>
      <div>
        <span class="section-kicker">TODAY'S RULE</span>
        <h3>${isTravelDay(day) ? "转场日：先保证交通和入住" : "先完成预约事项，再安排拍照"}</h3>
        <p>${escapeHtml(day.late_cut || "体力下降、天气变差或排队过长时，按当天备用安排执行。")}</p>
      </div>
    </section>

    <section class="simple-guide-card">
      <div class="guide-number">1</div>
      <div class="guide-copy"><span class="section-kicker">START HERE</span><h3>今天按这三步走</h3><p>看当前步骤 → 打开导航 → 到达后点“完成”。行程已经提前确定，按顺序执行即可。</p></div>
      <button class="guide-start-button" data-open-step="${firstOpenIndex}" type="button">开始</button>
    </section>

    <section class="predeparture-promo">
      <div class="predeparture-promo-icon" aria-hidden="true">✓</div>
      <div><span class="section-kicker">BEFORE YOU GO</span><h3>签证和行李还没做完？</h3><p>打开出发前清单，按时间线办理签证，再逐项勾选随身包和托运行李。</p></div>
      <button class="predeparture-promo-button" data-open-prep type="button">打开清单 ↗</button>
    </section>

    ${guardPanelMarkup(day)}

    ${lodgingMarkup(day)}

    ${isTravelDay(day) ? `
      <section class="route-card">
        <div class="card-heading-row">
          <div><span class="section-kicker">ROUTE</span><h3>转场确认</h3></div>
          <a class="text-link" href="${escapeHtml(dayRouteUrl(day))}" target="_blank" rel="noreferrer">打开当天串联路线 ↗</a>
        </div>
        <div class="route-map-wrap"><img src="./assets/trip/route-map.jpg" alt="西班牙三城路线示意" loading="lazy" /></div>
        <p>只按最终车票、航站楼和住宿地址行动；不要把不确定的换乘写成“肯定赶得上”。</p>
      </section>
    ` : ""}

    ${photoReferencesMarkup(day)}

    <section class="timeline-card">
      <div class="card-heading-row">
        <div><span class="section-kicker">FOLLOW THE LINE</span><h3>今天按这个顺序走</h3></div>
        <button class="small-action" data-open-step="${firstOpenIndex}" type="button">从现在开始</button>
      </div>
      <div class="timeline-list">
        ${day.timeline.map((item, index) => {
          const done = isComplete(day, index);
          return `
            <article class="timeline-row ${done ? "is-done" : ""}" data-step-index="${index}">
              <div class="timeline-time">${escapeHtml(item.t)}</div>
              <div class="timeline-rail"><span class="timeline-dot ${done ? "is-done" : ""}">${done ? "✓" : iconForKind(item.kind)}</span></div>
              <div class="timeline-body">
                <div class="timeline-meta"><span class="kind-label">${escapeHtml(kindLabel(item.kind))}</span>${tagMarkup(item.tag)}</div>
                <button class="timeline-title" data-open-step="${index}" type="button">${escapeHtml(item.what)}</button>
                ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}
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

    <section class="rain-card">
      <span class="section-kicker">RAIN / LATE PLAN</span>
      <h3>下雨或晚到时，按备用安排走</h3>
      <p>${escapeHtml(day.rain_alt || "优先执行已经准备好的室内、平地和有遮蔽路线；不临时增加跨区行程。")}</p>
    </section>
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
      <div class="step-focus-top"><span class="section-kicker">CURRENT STEP · ${String(index + 1).padStart(2, "0")} / ${String(day.timeline.length).padStart(2, "0")}</span><span class="focus-date">${escapeHtml(formatDate(day.date))}</span></div>
      <div class="step-time">${escapeHtml(item.t)}</div>
      <h2>${escapeHtml(item.what)}</h2>
      <div class="step-badges"><span class="kind-label">${escapeHtml(kindLabel(item.kind))}</span>${tagMarkup(item.tag)}${item.verify ? `<span class="verify-label">${escapeHtml(item.verify)}</span>` : ""}</div>
      <p class="step-note">${escapeHtml(item.note || "按现场情况执行；如果出现不确定性，先停下来核对官方信息。")}</p>
      <div class="step-support-row"><span>今天走 ${escapeHtml(walking.km)}</span><span>${escapeHtml(walking.label)}</span><span>${isTravelDay(day) ? "交通缓冲优先" : "按既定路线执行"}</span></div>
      <div class="step-actions">
        <button class="primary-button ${done ? "is-complete" : ""}" data-toggle-step="${index}" type="button">${done ? "已完成 · 点此取消" : "完成当前步骤"}</button>
        ${nonNavigationOfficialUrl(item) ? `<a class="secondary-button" href="${escapeHtml(nonNavigationOfficialUrl(item))}" target="_blank" rel="noreferrer">${officialLinkLabel(item)}</a>` : ""}
      </div>
      ${stepNavigationMarkup(day, item, index)}
    </section>

    ${isTransfer ? `<section class="step-image-card"><img src="./assets/trip/route-map.jpg" alt="三城路线示意" loading="lazy" /><div><span class="section-kicker">KEEP THE BUFFER</span><p>交通日不追景点。先核对车票、站台、行李和入住地址；晚到时按转场安排直接入住和用餐。</p></div></section>` : ""}

    ${lodgingMarkup(day)}
    ${photoReferencesMarkup(day)}

    ${guardPanelMarkup(day)}

    <section class="navigation-card">
      <div class="card-heading-row"><div><span class="section-kicker">NEXT MOVE</span><h3>只看前后两步</h3></div><span class="muted-label">${completedCount(day)}/${day.timeline.length} 完成</span></div>
      <div class="step-nav-buttons">
        <button class="nav-step-button" data-step-nav="${previous ?? ""}" ${previous === null ? "disabled" : ""} type="button"><span>← 上一步</span>${previous === null ? "已经是第一步" : escapeHtml(day.timeline[previous].what)}</button>
        <button class="nav-step-button next" data-step-nav="${next ?? ""}" ${next === null ? "disabled" : ""} type="button"><span>下一步 →</span>${next === null ? "今天已到最后" : escapeHtml(day.timeline[next].what)}</button>
      </div>
    </section>

    <section class="step-safety-card">
      <span class="section-kicker">IF PLANS CHANGE</span>
      <h3>如果现场有变化怎么办？</h3>
      <p>${escapeHtml(day.late_cut || "保留既定主线，按当天备用安排执行；不要在陌生城市为了一张照片跨区折返。")}</p>
      ${stepSafetyNavigationMarkup(day, item, index)}
    </section>
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
      const targetIndex = currentDay().timeline.findIndex((item) => item.kind === button.dataset.quickKind);
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
  elements.dayStrip.hidden = isPreparation;
  elements.viewTabs.hidden = isPreparation;
  if (!isPreparation) renderDayPicker();
  renderTabs();
  if (isPreparation) renderPreDeparture(state.plan.pre_departure);
  else if (state.selectedTab === "step") renderStep(day);
  else renderToday(day);
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
  if (tab === "today" || tab === "step" || tab === "prep") state.selectedTab = tab;
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
