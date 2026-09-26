const STORAGE_KEY = "spain-guide-ui-progress-v1";
const NAVIGATION_KEY = "spain-guide-ui-navigation-v1";
const DISPLAY_KEY = "spain-guide-ui-display-v1";
const DEFAULT_DATE = "2027-01-26";
const savedNavigation = loadNavigation();
const savedDisplay = loadDisplayPreferences();

const state = {
  plan: null,
  selectedDate: savedNavigation.date || DEFAULT_DATE,
  selectedTab: savedNavigation.tab === "step" ? "step" : "today",
  currentIndex: Number.isInteger(savedNavigation.index) ? savedNavigation.index : 0,
  largeText: Boolean(savedDisplay.largeText),
  completed: loadCompleted(),
  installPrompt: null
};

const elements = {
  dayPicker: document.querySelector("#day-picker"),
  dayCount: document.querySelector("#day-count"),
  appContent: document.querySelector("#app-content"),
  connectionState: document.querySelector("#connection-state"),
  fontSizeButton: document.querySelector("#font-size-button"),
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
  meal: "吃饭",
  anchor: "预约锚点",
  photo: "拍照",
  rest: "休息",
  free: "弹性"
};

const tagLabels = {
  pinned: "必做",
  opener: "开门优先",
  skippable: "可删"
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

function loadDisplayPreferences() {
  try {
    const raw = localStorage.getItem(DISPLAY_KEY);
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

function saveDisplayPreferences() {
  try {
    localStorage.setItem(DISPLAY_KEY, JSON.stringify({ largeText: state.largeText }));
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

function mapsUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function navigationUrl(item) {
  return mapsUrl(item.what);
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
      <summary><span class="guard-icon safety-icon">!</span><span><strong>安全与应急</strong><small>两人一起走，先保人</small></span></summary>
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
      <summary><span class="guard-icon delay-icon">↗</span><span><strong>晚到 / 下雨 / 累了</strong><small>先删可选，不追赶</small></span></summary>
      <div class="guard-detail">
        <p>${escapeHtml(day.late_cut || "保留入住、预约锚点和吃饭；先删 tag 为“可删”的户外项目。")}</p>
        <p>${escapeHtml(day.rain_alt || "优先室内、平地、有遮蔽的模块；不要为照片跨区折返。")}</p>
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
        <p>${escapeHtml(day.walking_km?.how || "按两位旅伴体力分段；任何时候都可以坐车或提前回住宿。")}</p>
        <p>这不是必须完成的运动量。累了就删掉下一个“可删”项目，不需要补回来。</p>
      </div>
    </details>
  `;
}

function guardPanelMarkup(day) {
  return `
    <section class="guard-panel">
      <div class="card-heading-row">
        <div><span class="section-kicker">EASY MODE</span><h3>两位旅伴只要记住这四件事</h3></div>
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
  if (day.travel_day || day.city.includes("→")) return "./assets/trip/route-map.jpg";
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
      <p class="day-ribbon">${escapeHtml(day.ribbon || "按顺序执行，遇到延误就从可删项开始删。")}</p>
      <div class="day-metrics">
        <span class="metric-pill metric-${walking.tone}"><b>走动</b><strong>${escapeHtml(walking.km)}</strong><small>${escapeHtml(walking.label)}</small></span>
        <span class="metric-pill"><b>节奏</b><strong>${day.travel_day ? "缓冲日" : "分段走"}</strong><small>${day.travel_day ? "先交通入住" : "累了就折返"}</small></span>
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
        <h3>${day.travel_day ? "转场日：先保护交通和入住" : "先做预约锚点，再安排拍照"}</h3>
        <p>${escapeHtml(day.late_cut || "体力下降、天气变差或排队过长时，先删掉 tag 为“可删”的项目。")}</p>
      </div>
    </section>

    <section class="simple-guide-card">
      <div class="guide-number">1</div>
      <div class="guide-copy"><span class="section-kicker">START HERE</span><h3>今天只循环三步</h3><p>看当前步骤 → 打开导航 → 到达后点“完成”。累了、下雨或晚到，就删掉“可删”项目。</p></div>
      <button class="guide-start-button" data-open-step="${firstOpenIndex}" type="button">开始</button>
    </section>

    ${guardPanelMarkup(day)}

    ${day.travel_day ? `
      <section class="route-card">
        <div class="card-heading-row">
          <div><span class="section-kicker">ROUTE</span><h3>交通决策门</h3></div>
          <a class="text-link" href="${mapsUrl(day.city)}" target="_blank" rel="noreferrer">打开地图 ↗</a>
        </div>
        <div class="route-map-wrap"><img src="./assets/trip/route-map.jpg" alt="西班牙三城路线示意" loading="lazy" /></div>
        <p>只按最终车票、航站楼和住宿地址行动；不要把不确定的换乘写成“肯定赶得上”。</p>
      </section>
    ` : ""}

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
                <div class="timeline-meta"><span class="kind-label">${escapeHtml(kindLabel(item.kind))}</span><span class="tag-label tag-${escapeHtml(item.tag || "free")}">${escapeHtml(tagLabel(item.tag))}</span></div>
                <button class="timeline-title" data-open-step="${index}" type="button">${escapeHtml(item.what)}</button>
                ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}
                <div class="row-actions">
                  <button class="check-button ${done ? "is-done" : ""}" data-toggle-step="${index}" type="button" aria-label="${done ? "取消完成" : "标记完成"}">${done ? "完成" : "完成这步"}</button>
                  <a href="${navigationUrl(item)}" target="_blank" rel="noreferrer">导航 ↗</a>
                  ${officialUrl(item) ? `<a href="${escapeHtml(officialUrl(item))}" target="_blank" rel="noreferrer">${officialLinkLabel(item)}</a>` : ""}
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
      <span class="section-kicker">RAIN / LATE CUT</span>
      <h3>下雨或晚到时，直接删这些</h3>
      <p>${escapeHtml(day.rain_alt || "优先保留有预约、室内、平地的项目；坡地、河岸和远景放到最后。")}</p>
    </section>
  `;

  bindTodayEvents();
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
  const isTransfer = item.kind === "hop" || day.travel_day;

  elements.appContent.innerHTML = `
    <section class="step-focus-card">
      <div class="step-focus-top"><span class="section-kicker">CURRENT STEP · ${String(index + 1).padStart(2, "0")} / ${String(day.timeline.length).padStart(2, "0")}</span><span class="focus-date">${escapeHtml(formatDate(day.date))}</span></div>
      <div class="step-time">${escapeHtml(item.t)}</div>
      <h2>${escapeHtml(item.what)}</h2>
      <div class="step-badges"><span class="kind-label">${escapeHtml(kindLabel(item.kind))}</span><span class="tag-label tag-${escapeHtml(item.tag || "free")}">${escapeHtml(tagLabel(item.tag))}</span>${item.verify ? `<span class="verify-label">${escapeHtml(item.verify)}</span>` : ""}</div>
      <p class="step-note">${escapeHtml(item.note || "按现场情况执行；如果出现不确定性，先停下来核对官方信息。")}</p>
      <div class="step-support-row"><span>今天走 ${escapeHtml(walking.km)}</span><span>${escapeHtml(walking.label)}</span><span>${day.travel_day ? "交通缓冲优先" : "累了就删可选"}</span></div>
      <div class="step-actions">
        <button class="primary-button ${done ? "is-complete" : ""}" data-toggle-step="${index}" type="button">${done ? "已完成 · 点此取消" : "完成当前步骤"}</button>
        <a class="outline-button" href="${navigationUrl(item)}" target="_blank" rel="noreferrer">打开导航 ↗</a>
        ${officialUrl(item) ? `<a class="secondary-button" href="${escapeHtml(officialUrl(item))}" target="_blank" rel="noreferrer">${officialLinkLabel(item)}</a>` : ""}
      </div>
    </section>

    ${isTransfer ? `<section class="step-image-card"><img src="./assets/trip/route-map.jpg" alt="三城路线示意" loading="lazy" /><div><span class="section-kicker">KEEP THE BUFFER</span><p>交通日不追景点。先核对车票、站台、行李和入住地址，晚到就删掉所有弹性项目。</p></div></section>` : ""}

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
      <h3>这一步不确定怎么办？</h3>
      <p>${escapeHtml(day.late_cut || "保留主线、删除可删项；不要在陌生城市为了一张照片跨区折返。")}</p>
      <a href="${navigationUrl(item)}" target="_blank" rel="noreferrer">用 Google Maps 重新核对路线 ↗</a>
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
}

function completedCount(day) {
  return day.timeline.filter((_, index) => isComplete(day, index)).length;
}

function bindTodayEvents() {
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
  renderDayPicker();
  renderTabs();
  if (state.selectedTab === "step") renderStep(day);
  else renderToday(day);
}

function setTab(tab) {
  state.selectedTab = tab;
  saveNavigation();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function applyTextSize() {
  document.documentElement.classList.toggle("large-text", state.largeText);
  elements.fontSizeButton.setAttribute("aria-pressed", String(state.largeText));
  elements.fontSizeButton.textContent = state.largeText ? "标准字" : "大字";
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
  if (tab === "today" || tab === "step") state.selectedTab = tab;
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
  elements.fontSizeButton.addEventListener("click", () => {
    state.largeText = !state.largeText;
    saveDisplayPreferences();
    applyTextSize();
    showToast(state.largeText ? "已放大文字" : "已恢复标准文字");
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
    readHash();
    applyTextSize();
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
applyTextSize();
updateConnectionState();
registerServiceWorker();
loadPlan();
