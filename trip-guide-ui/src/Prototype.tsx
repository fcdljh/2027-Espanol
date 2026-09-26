import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRightIcon,
  BackpackIcon,
  CalendarIcon,
  CameraIcon,
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  ExternalLinkIcon,
  HomeIcon,
  LightningBoltIcon,
  GlobeIcon,
  ReaderIcon,
  SewingPinFilledIcon,
  SunIcon,
} from "@radix-ui/react-icons";
import { Carousel } from "./mobile/Carousel";
import { MobileScroll } from "./mobile";

type PlanTimeline = {
  t: string;
  what: string;
  kind: string;
  note?: string;
  tag?: string;
  verify?: string;
  link?: string;
};

type PlanDay = {
  date: string;
  city: string;
  label: string;
  ribbon: string;
  rain_alt: string;
  late_cut: string;
  walking_km?: { total?: number; how?: string };
  timeline: PlanTimeline[];
  sun?: string;
};

type GuideItem = PlanTimeline & {
  id: string;
  title: string;
  description: string;
  kindLabel: string;
};

type GuideDay = {
  date: string;
  city: string;
  cityEn: string;
  label: string;
  ribbon: string;
  rainAlt: string;
  lateCut: string;
  walking: string;
  sun: string;
  dayNumber: number;
  items: GuideItem[];
};

type PrepItem = {
  id: string;
  label?: string;
  title?: string;
  note?: string;
};

type PrepGroup = {
  id: string;
  title: string;
  subtitle?: string;
  items: PrepItem[];
  link?: string;
  link_text?: string;
};

type PrepStep = PrepItem & {
  phase: string;
  title: string;
  tag: string;
};

type PreDeparture = {
  updated_at: string;
  basis: string;
  visa: {
    title: string;
    status: string;
    summary: string;
    window: string;
    steps: PrepStep[];
    materials: PrepGroup[];
    sources: { label: string; url: string; note: string }[];
  };
  baggage: {
    title: string;
    summary: string;
    hard_rules: string[];
    groups: PrepGroup[];
    sources: { label: string; url: string; note: string }[];
  };
};

type Tab = "today" | "current" | "prep";
type CompletionState = Record<string, string[]>;
type PreparationState = Record<string, boolean>;

const PROGRESS_KEY = "spain-guide-ui-progress-v1";
const PREPARATION_KEY = "spain-guide-ui-preparation-v1";

const CITY_NAMES: Record<string, { zh: string; en: string }> = {
  Barcelona: { zh: "巴塞罗那", en: "Barcelona" },
  Granada: { zh: "格拉纳达", en: "Granada" },
  Seville: { zh: "塞维利亚", en: "Seville" },
  Madrid: { zh: "马德里", en: "Madrid" },
};

const KIND_LABELS: Record<string, string> = {
  arrival: "抵达",
  check: "复核",
  hop: "交通",
  lodging: "入住",
  meal: "吃饭",
  photo: "拍照",
  anchor: "景点",
  rest: "休息",
  free: "散步",
};

const FALLBACK_DAYS: GuideDay[] = [
  {
    date: "2027-01-26",
    city: "巴塞罗那",
    cityEn: "Barcelona",
    label: "抵达与入住缓冲",
    ribbon: "入境取行李 → 定位至 Barcelona → 入住 → 附近补给",
    rainAlt: "大雨或晚到时只执行入住、买水和附近简餐。",
    lateCut: "延误时不硬接同日城际车，删除当天所有景点。",
    walking: "机场/车站与住宿附近短距离",
    sun: "天亮 07:59 · 日落 18:25 · CET",
    dayNumber: 1,
    items: [
      fallbackItem("落地–H+1:30", "入境、取行李、确认航站楼和三人行李", "arrival", "不要在到达层临时分散。"),
      fallbackItem("H+1:30–H+2:00", "决定是否执行当天定位交通", "check", "晚到就顺延，不强接下一段。"),
      fallbackItem("H+3:00–H+5:00", "入住或寄存行李，确认门禁和暖气", "lodging", ""),
    ],
  },
  ...[
    ["2027-01-27", "巴塞罗那", "Barcelona", "圣家堂 · Sant Pau", "08:45", "前往 Sagrada Família，先到入口附近", "hop"],
    ["2027-01-28", "巴塞罗那", "Barcelona", "现代主义 / Gothic-Born 备选", "09:15", "看当日票面和阳光，决定今天走哪条线", "check"],
    ["2027-01-29", "巴塞罗那", "Barcelona", "Barcelona Sants → Granada", "07:45", "前往 Barcelona Sants，按车票上的出发地执行", "hop"],
    ["2027-01-30", "格拉纳达", "Granada", "Alhambra 纳斯里德宫", "08:15", "到 Alhambra 后找入口，票面时间前留缓冲", "check"],
    ["2027-01-31", "格拉纳达", "Granada", "Granada → Seville", "08:15", "去铁路站或 Bus Station，车票站名优先", "hop"],
    ["2027-02-01", "塞维利亚", "Seville", "阿尔卡萨宫 · 主教堂 · Santa Cruz", "08:30", "步行或按 T1 接近老城，找正确入口队列", "hop"],
    ["2027-02-02", "塞维利亚", "Seville", "Plaza de España · Arenal · Triana", "09:15", "先看风雨和能见度，再决定户外线", "check"],
    ["2027-02-03", "塞维利亚", "Seville", "返程机场 / Madrid 起飞", "起飞前约 5 小时", "退房并按机场和航站楼倒推离开时间", "check"],
  ].map(([date, city, cityEn, label, time, title, kind], index) => makeFallbackDay({
    date,
    city,
    cityEn,
    label,
    time,
    title,
    kind,
    dayNumber: index + 2,
  })),
];

function fallbackItem(t: string, what: string, kind: string, note: string): GuideItem {
  return {
    id: `fallback-${t}-${what}`,
    t,
    what,
    kind,
    note,
    tag: "pinned",
    title: what,
    description: note || "按当天实际情况执行；动态开放信息出发前复核。",
    kindLabel: KIND_LABELS[kind] ?? "安排",
  };
}

function makeFallbackDay(input: {
  date: string;
  city: string;
  cityEn: string;
  label: string;
  time: string;
  title: string;
  kind: string;
  dayNumber: number;
}): GuideDay {
  return {
    date: input.date,
    city: input.city,
    cityEn: input.cityEn,
    label: input.label,
    ribbon: `${input.city} · ${input.label}`,
    rainAlt: "雨天时削减室外拍照和长距离散步，优先保留已购票的室内景点。",
    lateCut: "迟到时优先保留当前城市的第一项锚点，不追赶被错过的活动。",
    walking: "步行距离按当天地图和体力动态调整",
    sun: "日出/日落：出发前复核",
    dayNumber: input.dayNumber,
    items: [
      fallbackItem(input.time, input.title, input.kind, "先完成这一项，再决定是否追加下一项。"),
      fallbackItem("下一步", "确认交通、门票或入口规则", "check", "只把已核验的动态信息当作确定安排。"),
      fallbackItem("午后", "附近午餐与短休", "meal", "不为网红店穿城，排队过久就换店。"),
      fallbackItem("下午", "拍照机位或雨天备用线", "photo", "人多时拍细节，不把空场当作保证。"),
    ],
  };
}

function parseCity(raw: string): { zh: string; en: string } {
  const last = raw.split("→").at(-1)?.trim() ?? raw;
  return CITY_NAMES[last] ?? { zh: last, en: last };
}

function shortenTitle(value: string): string {
  const firstClause = value.split("；")[0].trim();
  return firstClause.length > 27 ? `${firstClause.slice(0, 27)}…` : firstClause;
}

function toGuideDay(day: PlanDay, index: number): GuideDay {
  const city = parseCity(day.city);
  return {
    date: day.date,
    city: city.zh,
    cityEn: city.en,
    label: day.label,
    ribbon: day.ribbon,
    rainAlt: day.rain_alt,
    lateCut: day.late_cut,
    walking: day.walking_km?.how ?? "按当天地图和体力动态调整",
    sun: day.sun ?? "日出/日落：出发前复核",
    dayNumber: index + 1,
    items: day.timeline.map((item, itemIndex) => ({
      ...item,
      id: `${day.date}-${itemIndex}`,
      title: shortenTitle(item.what),
      description: item.note ?? item.what,
      kindLabel: KIND_LABELS[item.kind] ?? "安排",
    })),
  };
}

function formatDate(date: string): { month: string; day: string; weekday: string } {
  const parsed = new Date(`${date}T12:00:00+08:00`);
  const weekday = new Intl.DateTimeFormat("zh-CN", { weekday: "short", timeZone: "Asia/Hong_Kong" }).format(parsed);
  return { month: `${parsed.getMonth() + 1}月`, day: `${parsed.getDate()}`, weekday };
}

function itemIcon(kind: string) {
  if (kind === "meal") return <LightningBoltIcon aria-hidden="true" />;
  if (kind === "photo") return <CameraIcon aria-hidden="true" />;
  if (kind === "hop") return <ArrowRightIcon aria-hidden="true" />;
  if (kind === "anchor") return <HomeIcon aria-hidden="true" />;
  if (kind === "check") return <ReaderIcon aria-hidden="true" />;
  if (kind === "rest" || kind === "lodging") return <BackpackIcon aria-hidden="true" />;
  return <SewingPinFilledIcon aria-hidden="true" />;
}

function mapSearchUrl(item: GuideItem, day: GuideDay): string {
  const query = encodeURIComponent(`${item.what} ${day.cityEn} Spain`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export default function Prototype() {
  const [days, setDays] = useState<GuideDay[]>(FALLBACK_DAYS);
  const [selectedDate, setSelectedDate] = useState("2027-02-01");
  const [tab, setTab] = useState<Tab>("today");
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [preDeparture, setPreDeparture] = useState<PreDeparture | null>(null);
  const [completed, setCompleted] = useState<CompletionState>(() => {
    try {
      return JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? "{}") as CompletionState;
    } catch {
      return {};
    }
  });
  const [preparation, setPreparation] = useState<PreparationState>(() => {
    try {
      return JSON.parse(window.localStorage.getItem(PREPARATION_KEY) ?? "{}") as PreparationState;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    let cancelled = false;
    fetch("./plan.geo.json", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("plan unavailable"))))
      .then((plan: { days?: PlanDay[] }) => {
        if (!cancelled && plan.days?.length) setDays(plan.days.map(toGuideDay));
      })
      .catch(() => undefined);
    fetch("./pre-departure.json?updated=2026-09-27", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("pre-departure unavailable"))))
      .then((data: PreDeparture) => {
        if (!cancelled) setPreDeparture(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed));
  }, [completed]);

  useEffect(() => {
    window.localStorage.setItem(PREPARATION_KEY, JSON.stringify(preparation));
  }, [preparation]);

  const selectedDay = useMemo(
    () => days.find((day) => day.date === selectedDate) ?? days[0],
    [days, selectedDate],
  );
  const doneIds = completed[selectedDay.date] ?? [];
  const doneSet = useMemo(() => new Set(doneIds), [doneIds]);
  const activeItem = selectedDay.items.find((item) => item.id === activeItemId)
    ?? selectedDay.items.find((item) => !doneSet.has(item.id))
    ?? selectedDay.items.at(-1)
    ?? selectedDay.items[0];
  const progress = selectedDay.items.length ? Math.round((doneIds.length / selectedDay.items.length) * 100) : 0;

  const chooseDay = (date: string) => {
    setSelectedDate(date);
    setActiveItemId(null);
    setTab("today");
  };
  const chooseItem = (item: GuideItem) => {
    setActiveItemId(item.id);
    setTab("current");
  };
  const toggleCompleted = (item: GuideItem) => {
    setCompleted((current) => {
      const existing = current[selectedDay.date] ?? [];
      const next = existing.includes(item.id)
        ? existing.filter((id) => id !== item.id)
        : [...existing, item.id];
      return { ...current, [selectedDay.date]: next };
    });
  };
  const togglePreparation = (id: string) => {
    setPreparation((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <div className="prototype-root">
      <MobileScroll className="app-screen guide-scroll">
        <main className="guide-content" aria-label="冬日西行西班牙旅行攻略">
          <Hero day={selectedDay} />
          <section className="mode-tabs" aria-label="攻略视图">
            <button className={tab === "today" ? "mode-tab is-active" : "mode-tab"} onClick={() => setTab("today")} type="button">
              <CalendarIcon aria-hidden="true" /><span>今日安排</span>
            </button>
            <button className={tab === "current" ? "mode-tab is-active" : "mode-tab"} onClick={() => setTab("current")} type="button">
              <GlobeIcon aria-hidden="true" /><span>当前步骤</span>
            </button>
            <button className={tab === "prep" ? "mode-tab is-active" : "mode-tab"} onClick={() => setTab("prep")} type="button">
              <ReaderIcon aria-hidden="true" /><span>出发前</span>
            </button>
          </section>
          {tab !== "prep" ? <DayPicker days={days} selectedDate={selectedDay.date} onChoose={chooseDay} /> : null}
          {tab === "today" ? (
            <TodayView day={selectedDay} doneSet={doneSet} progress={progress} onChooseItem={chooseItem} onToggleCompleted={toggleCompleted} onOpenCurrent={() => setTab("current")} />
          ) : tab === "current" ? (
            <CurrentView day={selectedDay} item={activeItem} doneSet={doneSet} onToggleCompleted={toggleCompleted} onOpenToday={() => setTab("today")} />
          ) : preDeparture ? (
            <PreDepartureView data={preDeparture} completed={preparation} onToggle={togglePreparation} />
          ) : (
            <section className="prep-load-error"><p>正在载入出发前清单…</p></section>
          )}
          <footer className="guide-disclaimer">
            <span className="disclaimer-dot" />
            <p>门票、开放时间、车次和餐厅营业状态都标为「出发前复核」；此页面只做跟随，不代替官方确认。</p>
          </footer>
        </main>
      </MobileScroll>
      <nav className="guide-bottom-nav" aria-label="快捷导航">
        <button className={tab === "today" ? "bottom-nav-item is-active" : "bottom-nav-item"} onClick={() => setTab("today")} type="button"><CalendarIcon aria-hidden="true" /><span>今日</span></button>
        <button className={tab === "current" ? "bottom-nav-item is-active" : "bottom-nav-item"} onClick={() => setTab("current")} type="button"><GlobeIcon aria-hidden="true" /><span>地图</span></button>
        <button className={tab === "prep" ? "bottom-nav-item is-active" : "bottom-nav-item"} onClick={() => setTab("prep")} type="button"><ReaderIcon aria-hidden="true" /><span>出发前</span></button>
      </nav>
    </div>
  );
}

function Hero({ day }: { day: GuideDay }) {
  return (
    <header className="guide-hero">
      <img className="hero-image" src="./assets/trip/seville-hero.png" alt="塞维利亚城市天际线与橙树" />
      <div className="hero-overlay" />
      <div className="hero-copy">
        <p className="eyebrow">WINTER SPAIN · 2027</p>
        <h1>冬日西行</h1>
        <p className="hero-route">Barcelona → Granada → Seville</p>
        <div className="hero-meta"><span><CalendarIcon aria-hidden="true" /> 1/26 — 2/3</span><span><SewingPinFilledIcon aria-hidden="true" /> {day.city}</span></div>
      </div>
    </header>
  );
}

function DayPicker({ days, selectedDate, onChoose }: { days: GuideDay[]; selectedDate: string; onChoose: (date: string) => void }) {
  return (
    <section className="day-picker" aria-label="选择旅行日">
      <div className="section-heading compact-heading"><div><p className="eyebrow">TRIP DAYS</p><h2>选择旅日</h2></div><span className="tiny-status"><SunIcon aria-hidden="true" /> 9 天</span></div>
      <Carousel ariaLabel="选择旅行日" className="day-carousel" contentClassName="day-carousel-track">
        {days.map((day) => {
          const date = formatDate(day.date);
          const active = day.date === selectedDate;
          return <button key={day.date} className={active ? "day-chip is-active" : "day-chip"} onClick={() => onChoose(day.date)} type="button" aria-pressed={active}>
            <span className="day-chip-number">D{day.dayNumber}</span><strong>{date.month}{date.day}</strong><small>{date.weekday} · {day.city}</small>
          </button>;
        })}
      </Carousel>
    </section>
  );
}

function TodayView({ day, doneSet, progress, onChooseItem, onToggleCompleted, onOpenCurrent }: { day: GuideDay; doneSet: Set<string>; progress: number; onChooseItem: (item: GuideItem) => void; onToggleCompleted: (item: GuideItem) => void; onOpenCurrent: () => void }) {
  const firstItem = day.items.find((item) => !doneSet.has(item.id)) ?? day.items[0];
  const mealItem = day.items.find((item) => item.kind === "meal");
  const photoItem = day.items.find((item) => item.kind === "photo");
  return (
    <>
      <section className="route-preview" aria-label="西班牙路线图">
        <img src="./assets/trip/route-map.png" alt="Barcelona、Granada、Seville 与 Madrid 路线图" />
        <div className="route-preview-caption"><span><GlobeIcon aria-hidden="true" /> {day.cityEn}</span><button type="button" onClick={onOpenCurrent}>看当前路线 <ChevronRightIcon aria-hidden="true" /></button></div>
      </section>
      <section className="day-heading-block"><div><p className="eyebrow">DAY {day.dayNumber} · {day.cityEn.toUpperCase()}</p><h2>{formatDate(day.date).month}{formatDate(day.date).day} <small>{formatDate(day.date).weekday}</small></h2><p className="day-heading-subtitle">{day.label}</p></div><div className="day-heading-pin"><SewingPinFilledIcon aria-hidden="true" /><span>{day.city}</span></div></section>
      <section className="day-progress" aria-label={`今日完成 ${progress}%`}><div className="progress-copy"><span>今日进度</span><strong>{doneSet.size} / {day.items.length} 步</strong></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></section>
      <section className="timeline-section" aria-label="今日时间线">
        <div className="section-heading"><div><p className="eyebrow">FOLLOW ALONG</p><h2>今天这样走</h2></div><span className="verify-pill"><ClockIcon aria-hidden="true" /> 动态复核</span></div>
        <div className="timeline-list">
          {day.items.map((item) => {
            const done = doneSet.has(item.id);
            const current = item.id === firstItem.id;
            return <article className={current ? "timeline-row is-current" : "timeline-row"} key={item.id}>
              <button type="button" className={done ? "check-button is-done" : "check-button"} aria-label={done ? `取消完成：${item.title}` : `完成：${item.title}`} onClick={() => onToggleCompleted(item)}>{done ? <CheckIcon aria-hidden="true" /> : null}</button>
              <button type="button" className="timeline-main" onClick={() => onChooseItem(item)}><span className="timeline-time">{item.t}</span><span className="timeline-text"><span className="timeline-title-line"><span className="item-icon">{itemIcon(item.kind)}</span><strong>{item.title}</strong></span><small>{item.description}</small></span><ChevronRightIcon className="timeline-chevron" aria-hidden="true" /></button>
            </article>;
          })}
        </div>
      </section>
      <section className="quick-actions" aria-label="吃饭和拍照快捷入口">
        <QuickAction image="./assets/trip/tapas.png" icon={<LightningBoltIcon aria-hidden="true" />} title="找一顿饭" subtitle="附近候选 · 先看菜单" onClick={() => mealItem && onChooseItem(mealItem)} />
        <QuickAction image="./assets/trip/seville-pose.jpg" icon={<CameraIcon aria-hidden="true" />} title="拍照机位" subtitle="先看人像动作 · 再看现场光线" onClick={() => photoItem && onChooseItem(photoItem)} />
      </section>
      <section className="next-step-banner"><div className="next-step-icon"><ArrowRightIcon aria-hidden="true" /></div><div><span>下一步</span><strong>{firstItem?.title ?? "今天已完成"}</strong></div><button type="button" onClick={onOpenCurrent}>查看路线 <ChevronRightIcon aria-hidden="true" /></button></section>
      <PlanningNotes day={day} />
    </>
  );
}

function QuickAction({ image, icon, title, subtitle, onClick }: { image: string; icon: ReactNode; title: string; subtitle: string; onClick: () => void }) {
  return <button className="quick-action" type="button" onClick={onClick}><img src={image} alt="" /><span className="quick-action-copy"><span className="quick-action-title">{icon} {title}</span><small>{subtitle}</small></span><ChevronRightIcon aria-hidden="true" /></button>;
}

function CurrentView({ day, item, doneSet, onToggleCompleted, onOpenToday }: { day: GuideDay; item: GuideItem; doneSet: Set<string>; onToggleCompleted: (item: GuideItem) => void; onOpenToday: () => void }) {
  const done = doneSet.has(item.id);
  return <section className="current-view" aria-label="当前步骤详情">
    <div className="current-kicker"><span className="live-dot" /> 当前步骤 <span>· {day.city}</span></div>
    <h2>{item.title}</h2>
    <div className="current-meta"><span><ClockIcon aria-hidden="true" /> {item.t}</span><span className="kind-tag">{item.kindLabel}</span></div>
    <div className="current-map-frame"><img src="./assets/trip/route-map.png" alt="当前城市在西班牙路线中的位置" /><div className="map-float-label"><GlobeIcon aria-hidden="true" /> {day.cityEn} · 当前位置</div></div>
    <div className="step-detail"><div className="step-detail-icon">{itemIcon(item.kind)}</div><div><p className="eyebrow">现在要做</p><p className="step-detail-body">{item.what}</p>{item.note ? <p className="step-detail-note">{item.note}</p> : null}</div></div>
    {item.verify ? <div className="review-callout"><ReaderIcon aria-hidden="true" /><div><strong>出发前复核</strong><span>这是动态信息；以官方页面、票面或现场指引为准。</span></div></div> : null}
    <div className="current-actions"><a className="primary-action" href={item.link ?? mapSearchUrl(item, day)} target="_blank" rel="noreferrer"><ExternalLinkIcon aria-hidden="true" /> 打开地图路线</a><button className={done ? "secondary-action is-done" : "secondary-action"} type="button" onClick={() => onToggleCompleted(item)}>{done ? <CheckIcon aria-hidden="true" /> : <span className="empty-action-circle" />}{done ? "已完成" : "完成这一步"}</button></div>
    <div className="current-lower-actions"><button type="button" onClick={onOpenToday}><ArrowRightIcon aria-hidden="true" /> 回到今日安排</button><span>完成后自动进入下一步</span></div>
    <PlanningNotes day={day} />
  </section>;
}

function prepItemLabel(item: PrepItem): string {
  return item.label ?? item.title ?? "未命名清单项";
}

function prepEntries(data: PreDeparture): PrepItem[] {
  return [
    ...data.visa.steps,
    ...data.visa.materials.flatMap((group) => group.items),
    ...data.baggage.groups.flatMap((group) => group.items),
  ];
}

function PreDepartureView({ data, completed, onToggle }: { data: PreDeparture; completed: PreparationState; onToggle: (id: string) => void }) {
  const entries = prepEntries(data);
  const doneCount = entries.filter((entry) => completed[entry.id]).length;
  const visaDone = data.visa.steps.filter((step) => completed[step.id]).length;
  const baggageItems = data.baggage.groups.flatMap((group) => group.items);
  const baggageDone = baggageItems.filter((item) => completed[item.id]).length;
  const progress = entries.length ? Math.round((doneCount / entries.length) * 100) : 0;

  return <section className="predeparture-view" aria-label="出发前签证与行李清单">
    <section className="prep-hero-card">
      <div className="prep-hero-top"><span className="eyebrow">PRE-DEPARTURE · {data.updated_at}</span><span className="prep-status">{doneCount}/{entries.length} 已完成</span></div>
      <h2>出发前，先把两件大事做完</h2>
      <p>{data.basis}</p>
      <div className="prep-progress-track" aria-label={`行前清单完成度 ${progress}%`}><span style={{ width: `${progress}%` }} /></div>
      <div className="prep-hero-meta"><span>签证：{data.visa.status}</span><span>行李：三人冬季转场</span></div>
    </section>

    <section className="prep-section visa-prep-section">
      <div className="prep-section-heading"><div><span className="eyebrow">01 · VISA</span><h3>{data.visa.title}</h3></div><span className="prep-count">{visaDone}/{data.visa.steps.length}</span></div>
      <p className="prep-summary">{data.visa.summary}</p>
      <div className="prep-window"><span className="prep-window-icon">!</span><p>{data.visa.window}</p></div>
      <div className="prep-timeline">
        {data.visa.steps.map((step, index) => {
          const done = Boolean(completed[step.id]);
          return <article className={done ? "prep-timeline-row is-done" : "prep-timeline-row"} key={step.id}>
            <button className="prep-step-check" type="button" onClick={() => onToggle(step.id)} aria-label={`${done ? "取消完成" : "标记完成"}：${step.title}`}>{done ? "✓" : String(index + 1).padStart(2, "0")}</button>
            <div className="prep-timeline-copy"><div className="prep-step-meta"><span>{step.phase}</span><b>{step.tag}</b></div><h4>{step.title}</h4><p>{step.note}</p></div>
          </article>;
        })}
      </div>
      <div className="prep-materials">
        <div className="prep-subheading"><strong>递交材料 checklist</strong><span>点开逐项勾选</span></div>
        {data.visa.materials.map((group, index) => <PrepGroup key={group.id} group={group} completed={completed} onToggle={onToggle} open={index === 0} />)}
      </div>
      <PrepSources sources={data.visa.sources} />
    </section>

    <section className="prep-section baggage-prep-section">
      <div className="prep-section-heading"><div><span className="eyebrow">02 · PACKING</span><h3>{data.baggage.title}</h3></div><span className="prep-count">{baggageDone}/{baggageItems.length}</span></div>
      <p className="prep-summary">{data.baggage.summary}</p>
      <div className="prep-hard-rules">{data.baggage.hard_rules.map((rule) => <p key={rule}><span>✓</span>{rule}</p>)}</div>
      <div className="prep-baggage-groups">
        {data.baggage.groups.map((group, index) => <PrepGroup key={group.id} group={group} completed={completed} onToggle={onToggle} open={index < 2} />)}
      </div>
      <PrepSources sources={data.baggage.sources} />
    </section>

    <section className="prep-footer-note"><span className="eyebrow">KEEP IT LOCAL</span><p>勾选进度只保存在这台手机的浏览器本地。它不会保存护照号、申请号、保单号或支付资料；签证、航班、行李和安检规则仍以出发前官方页面为准。</p></section>
  </section>;
}

function PrepGroup({ group, completed, onToggle, open }: { group: PrepGroup; completed: PreparationState; onToggle: (id: string) => void; open: boolean }) {
  const done = group.items.filter((item) => completed[item.id]).length;
  return <details className="prep-details" open={open}>
    <summary><span><strong>{group.title}</strong><small>{group.subtitle ? `${group.subtitle} · ` : ""}{done}/{group.items.length} 完成</small></span><b>＋</b></summary>
    <div className="prep-check-list">
      {group.items.map((item) => {
        const isDone = Boolean(completed[item.id]);
        return <label className={isDone ? "prep-check-row is-done" : "prep-check-row"} key={item.id}>
          <input type="checkbox" checked={isDone} onChange={() => onToggle(item.id)} />
          <span className="prep-check-box" aria-hidden="true">{isDone ? "✓" : ""}</span>
          <span className="prep-check-copy"><strong>{prepItemLabel(item)}</strong>{item.note ? <small>{item.note}</small> : null}</span>
        </label>;
      })}
    </div>
    {group.link ? <a className="prep-official-link" href={group.link} target="_blank" rel="noreferrer">{group.link_text ?? "打开当期官方清单"} ↗</a> : null}
  </details>;
}

function PrepSources({ sources }: { sources: { label: string; url: string; note: string }[] }) {
  return <div className="prep-sources"><div className="prep-subheading"><strong>官方入口 / 小红书参考</strong><span>出发前重新打开</span></div>{sources.map((source) => <a className="prep-source" href={source.url} target="_blank" rel="noreferrer" key={source.url}><span><strong>{source.label}</strong><small>{source.note}</small></span><span aria-hidden="true">↗</span></a>)}</div>;
}

function PlanningNotes({ day }: { day: GuideDay }) {
  return <section className="planning-notes" aria-label="弹性调整提醒">
    <div className="note-card rain-note"><span className="note-icon">☂</span><div><strong>如果下雨</strong><p>{day.rainAlt}</p></div></div>
    <div className="note-card late-note"><span className="note-icon">↺</span><div><strong>如果晚到</strong><p>{day.lateCut}</p></div></div>
    <div className="walking-note"><BackpackIcon aria-hidden="true" /><span>{day.walking}</span><small>{day.sun}</small></div>
  </section>;
}
