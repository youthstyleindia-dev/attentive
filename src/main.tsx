import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  Bookmark,
  ChartNoAxesCombined,
  Clock,
  Download,
  ExternalLink,
  Globe,
  Layers,
  Pause,
  Play,
  Plus,
  Settings,
  ShieldCheck,
  Sidebar,
  Trash2,
  X,
  Sparkles,
  Edit3,
  BarChart2,
  Check,
  AlertTriangle,
  LogOut,
  ArrowRight,
  Search,
  Camera,
  Zap,
  Home,
  Radio,
  Target,
} from "lucide-react";
import { initial, demoState, metrics, type State, type Stream, type Snapshot } from "./model";
import {
  loadState,
  loadTraces,
  loadWorkstreams,
  loadUser,
  saveUser,
  startLiveTracker,
  stopLiveTracker,
  handleWebAction,
  type AtentivUser,
  DEFAULT_USER,
} from "./webTracker";
import { WorkstreamMap } from "./dashboard/WorkstreamMap";
import { DecisionTraceModal } from "./dashboard/DecisionTraceModal";
import { FeedbackModal } from "./dashboard/FeedbackModal";
import type { DecisionTraceRecord, WorkstreamRecord, ProductivityType } from "./db/schemas";
import "./style.css";

const extension = typeof chrome !== "undefined" && !!chrome.runtime?.id;
const duration = (n: number) =>
  n < 60000
    ? `${Math.round(n / 1000)}s`
    : `${Math.floor(n / 3600000) ? Math.floor(n / 3600000) + "h " : ""}${Math.floor(n / 60000) % 60}m ${Math.round((n % 60000) / 1000)}s`;

// ── Focus score ring component ────────────────────────────────────────────
function FocusRing({ score, label, size, stroke }: { score: number; label?: string; size: number; stroke: number }) {
  const r = size / 2 - stroke;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * Math.max(0, Math.min(100, score)) / 100);
  const cx = size / 2;
  const uid = `gr${size}`;
  const displayText = label !== undefined ? label : String(score);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: "block" }}>
      <defs>
        <linearGradient id={uid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={`url(#${uid})`} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={label ? circ : offset}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cx})`} />
      <text x={cx} y={cx + (size > 70 ? 7 : 5)} textAnchor="middle" fill="white"
        fontSize={size > 70 ? 20 : 14} fontWeight="800" fontFamily="monospace">{displayText}</text>
      {size > 70 && !label && (
        <text x={cx} y={cx + 22} textAnchor="middle" fill="#475569" fontSize={10}>/100</text>
      )}
    </svg>
  );
}

function App() {
  const [user, setUser] = useState<AtentivUser>(() => loadUser());
  const [showLoginWelcome, setShowLoginWelcome] = useState(false);
  const [state, setState] = useState<State>(() => loadState());
  const [page, setPage] = useState(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("page");
      if (p) return p;
      const path = window.location.pathname.toLowerCase();
      if (path.includes("dashboard")) return "Analytics";
      if (path.includes("options")) return "Settings";
      if (path.includes("sidepanel")) return "Overview";
    }
    return "Overview";
  });
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [range, setRange] = useState("today");
  const [modal, setModal] = useState("");
  const [now, setNow] = useState(Date.now());

  // Form states
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [logUrl, setLogUrl] = useState("");
  const [logTitle, setLogTitle] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newDomainType, setNewDomainType] = useState<"productive" | "unproductive">("productive");
  const [rules, setRules] = useState<Stream[]>([]);
  const [blocked, setBlocked] = useState("");

  // Snapshot modal state
  const [snapshotTargetId, setSnapshotTargetId] = useState<string | null>(null);
  const [availableTabs, setAvailableTabs] = useState<Array<{ title: string; url: string; checked: boolean }>>([]);

  // Analytics toggle
  const [analyticsPieMode, setAnalyticsPieMode] = useState<"workstream" | "domain">("workstream");

  // Modals & inspectors
  const [selectedTrace, setSelectedTrace] = useState<DecisionTraceRecord | null>(null);
  const [traces, setTraces] = useState<DecisionTraceRecord[]>(() => loadTraces());
  const [activeWorkstreams, setActiveWorkstreams] = useState<WorkstreamRecord[]>(() => loadWorkstreams());
  const [feedbackTarget, setFeedbackTarget] = useState<{
    domain: string;
    currentCategory: string;
    currentActivity: string;
    currentProductivity: ProductivityType;
    sessionId?: string;
  } | null>(null);

  // HUD data from background service worker
  const [hudData, setHudData] = useState<any>(null);
  const [sessionStart] = useState(Date.now());
  const [openTabsList, setOpenTabsList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ── Unified Call Handler ───────────────────────────────────────────────
  async function call(message: Record<string, unknown>) {
    setError("");
    try {
      if (extension && !demo) {
        const r = await chrome.runtime.sendMessage(message);
        if (r?.error) throw Error(r.error);
        if (r?.state) setState(r.state);
        if (r?.traces) setTraces(r.traces);
        if (r?.activeWorkstreams) setActiveWorkstreams(r.activeWorkstreams);
        return r?.state;
      } else {
        const r = handleWebAction(message as any);
        setState(r.state);
        setTraces(r.traces);
        setActiveWorkstreams(r.activeWorkstreams);
        return r.state;
      }
    } catch (e) {
      setError(String(e));
    }
  }

  // ── Live Tracker Subscription ──────────────────────────────────────────
  useEffect(() => {
    if (!extension) {
      startLiveTracker((s, tr, ws) => {
        setState(s);
        setTraces(tr);
        setActiveWorkstreams(ws);
      });
      return () => stopLiveTracker();
    }
    if (demo) {
      setState(demoState());
      setTraces(loadTraces());
      setActiveWorkstreams(loadWorkstreams());
      return;
    }
    void call({ type: "read" });
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.state) setState(changes.state.newValue);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [demo]);

  // ── 1-second ticker ───────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Poll HUD state from background & track open tabs ───────────────────
  useEffect(() => {
    if (!extension) return;
    const poll = async () => {
      try {
        const r = await chrome.runtime.sendMessage({ type: "GET_HUD_STATE" });
        if (r && !r.error) {
          setHudData(r);
          if (Array.isArray(r.openTabs) && r.openTabs.length > 0) {
            setOpenTabsList(r.openTabs);
          }
        }
      } catch {}
      try {
        if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.query) {
          const tabs = await chrome.tabs.query({});
          const valid = tabs
            .filter((t) => {
              const u = t.url || (t as any).pendingUrl || "";
              return !u.startsWith("chrome://") && !u.startsWith("chrome-extension://") && !u.startsWith("edge://");
            })
            .map((t) => {
              let domain = "";
              try { domain = new URL(t.url || (t as any).pendingUrl || "").hostname.replace(/^www\./, ""); } catch {}
              return {
                id: t.id,
                title: t.title || domain || t.url || "Open Tab",
                url: t.url || (t as any).pendingUrl || "",
                domain,
                favIconUrl: t.favIconUrl,
                active: t.active,
              };
            });
          if (valid.length > 0) {
            setOpenTabsList(valid);
          }
        }
      } catch {}
    };
    poll();
    const id = setInterval(poll, 3000);

    const onTabChange = () => { poll(); };
    try {
      if (typeof chrome !== "undefined" && chrome.tabs) {
        chrome.tabs.onCreated?.addListener(onTabChange);
        chrome.tabs.onRemoved?.addListener(onTabChange);
        chrome.tabs.onUpdated?.addListener(onTabChange);
        chrome.tabs.onActivated?.addListener(onTabChange);
      }
    } catch {}

    return () => {
      clearInterval(id);
      try {
        if (typeof chrome !== "undefined" && chrome.tabs) {
          chrome.tabs.onCreated?.removeListener(onTabChange);
          chrome.tabs.onRemoved?.removeListener(onTabChange);
          chrome.tabs.onUpdated?.removeListener(onTabChange);
          chrome.tabs.onActivated?.removeListener(onTabChange);
        }
      } catch {}
    };
  }, []);

  // ── Derived Metrics ────────────────────────────────────────────────────
  const start = range === "today" ? new Date(now).setHours(0, 0, 0, 0) : now - 7 * 86400000;
  const m = metrics(
    state.visits, start, now, undefined,
    state.productiveDomains, state.unproductiveDomains, state.idleSeconds,
  );
  const stream = (id: string) => state.streams.find((s) => s.id === id) || state.streams[state.streams.length - 1];
  const rows = state.visits.filter((v) => v.end > start).slice().reverse();

  // HUD-derived values
  const hud = hudData || {};
  const tm = hud.todayMetrics || {};
  const ct = hud.currentTab || {};
  const isUntrackable = Boolean(hud.status?.isUntrackable);
  const isIdle = Boolean(hud.status?.isIdle);
  const hudProductiveMs = tm.productiveTime ?? m.productiveTime ?? 0;
  const hudNeutralMs = tm.neutralTime ?? m.neutralTime ?? 0;
  const hudDistractingMs = tm.unproductiveTime ?? m.unproductiveTime ?? 0;
  const hudSwitches = tm.switches ?? m.switches ?? 0;
  const hudTotal = hudProductiveMs + hudNeutralMs + hudDistractingMs;
  const hasFocusData = tm.hasData ?? (hudTotal > 0 || m.total > 0);
  const hudScore = typeof tm.score === "number" ? tm.score : (m.score ?? 0);
  const pct = (v: number) => hudTotal > 0 ? Math.round((v / hudTotal) * 100) : 0;
  const hudWorkstreams: any[] = hud.activeWorkstreams || [];
  const hudRecentTabs: any[] = hud.recentTabs || [];
  const isTracking = hud.status?.isEnabled !== undefined
    ? Boolean(hud.status.isEnabled)
    : (hud.status?.isRecording ?? state.enabled);

  const handleToggleTracking = async () => {
    const target = !isTracking;
    await call({ type: "TOGGLE_RECORDING", enabled: target });
    await call({ type: "settings", enabled: target, excluded: state.excluded });
    setState((prev) => ({ ...prev, enabled: target }));
    try {
      const h = await chrome.runtime.sendMessage({ type: "GET_HUD_STATE" });
      if (h && !h.error) setHudData(h);
    } catch {}
  };

  // Session timer
  const sessionSeconds = Math.floor((now - sessionStart) / 1000);
  const sh = String(Math.floor(sessionSeconds / 3600)).padStart(2, "0");
  const sm2 = String(Math.floor((sessionSeconds % 3600) / 60)).padStart(2, "0");
  const ss2 = String(sessionSeconds % 60).padStart(2, "0");
  const sessionTimer = `${sh}:${sm2}:${ss2}`;

  // Decision traces display
  const displayTraces: DecisionTraceRecord[] =
    traces.length > 0
      ? traces
      : state.visits.slice().reverse().slice(0, 30).map((v) => {
          let domain = "";
          try { domain = new URL(v.url).hostname.replace(/^www\./, ""); } catch { domain = v.url; }
          const s = stream(v.stream);
          return {
            decision_id: `auto-${v.id}`, session_id: v.id, timestamp: v.start,
            rule_matches: [], domain_match: { domain, category: s.name, activity: "General Browsing" },
            keyword_matches: v.title.toLowerCase().split(/\s+/).slice(0, 4),
            model_predictions: [{ label: s.name, score: 0.9 }, { label: "Technology", score: 0.65 }],
            model_confidence: 0.9, selected_activity: "General Browsing",
            selected_productivity: ((v as any).productivity || "productive") as ProductivityType,
            selected_workstream: s.name, workstream_scores: { [s.name]: 0.9 },
            final_reason: [`Domain matched: ${domain}`, `Classified via domain + keyword rules`],
            model_version: "1.0.0", feature_schema_version: "1.0.0", total_latency_ms: 0.05,
          };
        });

  function exportData() {
    const blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), mode: demo ? "demo" : "live", user, ...state, metrics: m, traces, activeWorkstreams }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "atentiv-export.json"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function openSnapshotModal(existingSnapshot?: Snapshot) {
    if (existingSnapshot) {
      setSnapshotTargetId(existingSnapshot.id);
      setName(existingSnapshot.name);
      setNote(existingSnapshot.note);
      const checkedUrls = new Set(existingSnapshot.tabs.map((t) => t.url));
      const candidates: Array<{ title: string; url: string; checked: boolean }> = [
        ...existingSnapshot.tabs.map((t) => ({ title: t.title, url: t.url, checked: true })),
      ];
      for (const v of state.visits.slice(-6).reverse()) {
        if (!checkedUrls.has(v.url)) {
          candidates.push({ title: v.title, url: v.url, checked: false });
          checkedUrls.add(v.url);
        }
      }
      setAvailableTabs(candidates);
    } else {
      setSnapshotTargetId(null);
      setName(`Workspace — ${new Date().toLocaleDateString([], { month: "short", day: "numeric" })}`);
      setNote("");
      let candidateList: Array<{ title: string; url: string; checked: boolean }> = [];
      if (extension && typeof chrome !== "undefined" && chrome.tabs?.query) {
        try {
          const openTabs = await chrome.tabs.query({});
          for (const t of openTabs) {
            const u = t.url || (t as any).pendingUrl || "";
            if (u && !u.startsWith("chrome-extension://") && !u.startsWith("chrome://") && !u.startsWith("edge://")) {
              candidateList.push({ title: t.title || u, url: u, checked: true });
            }
          }
        } catch {}
      }
      if (candidateList.length === 0 && openTabsList.length > 0) {
        for (const t of openTabsList) {
          if (t.url) candidateList.push({ title: t.title || t.url, url: t.url, checked: true });
        }
      }
      if (candidateList.length === 0) {
        const recent = state.visits.slice(-8).reverse();
        const seen = new Set<string>();
        for (const v of recent) {
          if (!seen.has(v.url)) { seen.add(v.url); candidateList.push({ title: v.title, url: v.url, checked: true }); }
        }
      }
      setAvailableTabs(candidateList);
    }
    setModal("save");
  }

  // ── LOGIN PAGE ─────────────────────────────────────────────────────────
  if (!user.loggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-brand">
            <div className="login-logo"><Activity size={30} /></div>
            <h1>Atentiv</h1>
            <p>Privacy-Preserving Browser Activity Intelligence</p>
          </div>
          <form className="login-form" onSubmit={(e) => {
            e.preventDefault();
            const updated = { ...user, loggedIn: true, loginTime: Date.now() };
            saveUser(updated); setUser(updated); setShowLoginWelcome(true);
          }}>
            <label>
              Username / Workspace Email
              <input type="text" required defaultValue={user.username} placeholder="e.g. divya or divya@atentiv.ai" />
            </label>
            <label>
              Master Password
              <input type="password" required defaultValue="password123" placeholder="••••••••" />
            </label>
            <div className="login-actions">
              <button type="submit" className="btn-quick-login">Sign In to Atentiv</button>
              <button type="button" className="btn-subtle-login" onClick={() => {
                const updated = { ...DEFAULT_USER, loggedIn: true, loginTime: Date.now() };
                saveUser(updated); setUser(updated); setShowLoginWelcome(true);
              }}>
                1-Click Continue as Divya (Personal)
              </button>
            </div>
          </form>
          <div style={{ marginTop: 24, fontSize: 11, color: "#94a3b8", textAlign: "center" }}>
            <ShieldCheck size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
            100% on-device local storage · Zero cloud uploads
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN APP SHELL (image-2 3-column layout) ───────────────────────────
  return (
    <div className="app-shell">

      {/* ══ LEFT SIDEBAR ════════════════════════════════════════════════════ */}
      <aside className="left-sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-row">
            <div className="sidebar-logo"><Activity size={18} /></div>
            <div>
              <div className="sidebar-brand-name">Atentiv</div>
              <div className="sidebar-brand-sub">Browse Mindfully</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {([
            [Home,        "Home",         "Home"],
            [Radio,       "Live View",    "Live View"],
            [Layers,      "Workstreams",  "Workstreams"],
            [BarChart2,   "Analytics",    "Analytics"],
            [Target,      "Productivity", "Productive Sites"],
            [Clock,       "History",      "Decision traces"],
            [Zap,         "Rules",        "Productive Sites"],
            [Camera,      "Snapshots",    "Context resume"],
            [Settings,    "Settings",     "Settings"],
          ] as [React.ComponentType<{ size: number }>, string, string][]).map(([Icon, label, pageKey]) => {
            const isActive =
              page === pageKey ||
              (label === "Home" && (page === "Home" || page === "Overview")) ||
              (label === "Snapshots" && (page === "Snapshots" || page === "Context resume")) ||
              (label === "Productivity" && (page === "Productivity" || page === "Productive Sites")) ||
              (label === "Rules" && page === "Rules") ||
              (label === "History" && (page === "History" || page === "Decision traces"));
            return (
              <button key={label}
                className={`nav-item${isActive ? " active" : ""}`}
                onClick={() => setPage(pageKey)}>
                <Icon size={14} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom: live tracking stats */}
        <div className="sidebar-bottom">
          <div className="tracking-indicator">
            <span className="tracking-dot"
              style={{ background: isUntrackable ? "#64748b" : isTracking ? "#10b981" : isIdle ? "#f59e0b" : "#ef4444" }} />
            <span className="tracking-label">
              {isUntrackable ? "UNTRACKABLE PAGE" : isTracking ? "TRACKING ACTIVE" : isIdle ? "PAUSED — INACTIVE" : "TRACKING PAUSED"}
            </span>
          </div>
          {isTracking && (
            <div className="tracking-since">
              Since {new Date(sessionStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
          <div className="session-timer">{sessionTimer}</div>
          <div className="focus-ring-label">TODAY'S FOCUS</div>
          <div className="focus-ring-small" title={hasFocusData ? `Focus Score: ${hudScore}/100` : "Focus score unavailable: no tracked browsing dwell time recorded yet."}>
            <FocusRing score={hasFocusData ? hudScore : 0} label={hasFocusData ? undefined : "—"} size={60} stroke={6} />
          </div>
          <button className={`btn-pause ${!isTracking ? "paused" : ""}`}
            onClick={handleToggleTracking}>
            {isTracking ? <><Pause size={13} /> Pause Tracking</> : <><Play size={13} /> Resume Tracking</>}
          </button>
          <button className="btn-open-dashboard"
            onClick={() => extension && chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") })}>
            Open Dashboard
          </button>
        </div>
      </aside>

      {/* ══ MAIN + RIGHT wrapper ════════════════════════════════════════════ */}
      <div className="main-and-right">

        {/* ── TOP HEADER ──────────────────────────────────────────────────── */}
        <header className="top-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0" }}>Atentiv</span>
            <span style={{ fontSize: 11, color: "#475569" }}>Browse Mindfully</span>
          </div>
          <div style={{ flex: 1, maxWidth: 400 }}>
            <div className="header-search">
              <Search size={13} style={{ color: "#475569", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search tabs, workstreams, or anything..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", color: "#e2e8f0", fontSize: 12, flex: 1, width: "100%" }}
              />
              <span style={{ marginLeft: "auto", fontSize: 10, color: "#334155", background: "#0f1117", borderRadius: 4, padding: "1px 5px" }}>⌘K</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
            <div className="header-time">
              {new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              <span style={{ fontSize: 10, color: "#475569", marginLeft: 6, fontWeight: 400 }}>
                {new Date(now).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            <div className="tracking-badge">
              <span className="tracking-dot"
                style={{ background: isTracking ? "#10b981" : "#f59e0b", width: 8, height: 8 }} />
              {isTracking ? "Tracking Active" : "Paused"}
              <span style={{ fontFamily: "monospace", marginLeft: 6, color: "#64748b", fontSize: 11 }}>
                {sessionTimer}
              </span>
            </div>
            <button className="quiet icon-btn" title="Settings" onClick={() => setPage("Settings")}>
              <Settings size={15} />
            </button>
            {extension && (
              <button className="quiet icon-btn" title="Pop out"
                onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") })}>
                <ExternalLink size={15} />
              </button>
            )}
          </div>
        </header>

        {/* ── CONTENT + RIGHT PANEL row ────────────────────────────────────── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ── MAIN CONTENT AREA ─────────────────────────────────────────── */}
          <main className="main-area">
            <div className="content-area">
              {error && <div role="alert" className="error">{error}</div>}
              {notice && (
                <div role="status" className="banner">
                  {notice}
                  <button className="quiet" onClick={() => setNotice("")} aria-label="Dismiss">
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* ── OVERVIEW / LIVE VIEW — image-2 cards ────────────────── */}
              {(page === "Overview" || page === "Live View" || page === "Home") && (
                <div className="overview-live">

                  {/* CURRENT ACTIVITY */}
                  <section className="card current-activity-card">
                    <div className="card-label">CURRENT ACTIVITY</div>
                    <div className="ca-row">
                      <div className="ca-left">
                        <Globe size={20} style={{ color: isUntrackable ? "#64748b" : "#3b82f6", flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <div className="domain-name" style={{ color: isUntrackable ? "#94a3b8" : "#3b82f6" }}>
                            {ct.domain || (isUntrackable ? "Restricted Browser Page" : "—")}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                            {ct.title || (isUntrackable ? "Tracking unavailable on internal browser page (chrome://, edge://, about:). Atentiv will resume automatically on a supported webpage." : "No active tab tracked yet")}
                          </div>
                          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                            {ct.category && <span className="tag tag-tech">{ct.category}</span>}
                            {ct.activity && <span className="tag tag-coding">{ct.activity}</span>}
                            {ct.productivity && (
                              <span className={`tag ${
                                ct.productivity === "productive" ? "tag-productive"
                                : ct.productivity === "distracting" ? "tag-distracting"
                                : "tag-neutral"}`}>
                                {ct.productivity}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ca-right">
                        <div className="dwell-time">
                          {ct.activeDwellTime ? duration(ct.activeDwellTime) : "—"}
                        </div>
                        {isUntrackable ? (
                          <div className="active-indicator" style={{ color: "#94a3b8" }}>
                            <span className="tracking-dot"
                              style={{ width: 7, height: 7, background: "#64748b" }} />
                            Untrackable page
                          </div>
                        ) : isTracking ? (
                          <div className="active-indicator">
                            <span className="tracking-dot"
                              style={{ width: 7, height: 7, background: "#10b981" }} />
                            Active in current tab
                          </div>
                        ) : isIdle ? (
                          <div className="active-indicator" style={{ color: "#f59e0b" }}>
                            <span className="tracking-dot"
                              style={{ width: 7, height: 7, background: "#f59e0b" }} />
                            Paused — inactive
                          </div>
                        ) : (
                          <div className="active-indicator" style={{ color: "#64748b" }}>
                            <span className="tracking-dot"
                              style={{ width: 7, height: 7, background: "#64748b" }} />
                            Tracking paused
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* TODAY AT A GLANCE */}
                  <section className="card glance-section">
                    <div className="glance-header">
                      <div className="card-label">TODAY AT A GLANCE</div>
                      <div className="glance-focus-ring" title={hasFocusData ? `Focus Score: ${hudScore}/100` : "Focus score unavailable: no tracked browsing dwell time recorded yet."}>
                        <div style={{ fontSize: 9, color: "#475569", textAlign: "center", marginBottom: 4, letterSpacing: 1 }}>
                          FOCUS SCORE
                        </div>
                        <FocusRing score={hasFocusData ? hudScore : 0} label={hasFocusData ? undefined : "—"} size={80} stroke={6} />
                      </div>
                    </div>
                    <div className="glance-metrics">
                      <div className="glance-metric">
                        <div className="metric-value productive">{duration(hudProductiveMs)}</div>
                        <div className="metric-label">PRODUCTIVE</div>
                        <div className="metric-pct">{pct(hudProductiveMs)}%</div>
                      </div>
                      <div className="glance-metric">
                        <div className="metric-value neutral">{duration(hudNeutralMs)}</div>
                        <div className="metric-label">NEUTRAL</div>
                        <div className="metric-pct">{pct(hudNeutralMs)}%</div>
                      </div>
                      <div className="glance-metric">
                        <div className="metric-value distracting">{duration(hudDistractingMs)}</div>
                        <div className="metric-label">DISTRACTING</div>
                        <div className="metric-pct">{pct(hudDistractingMs)}%</div>
                      </div>
                      <div className="glance-metric">
                        <div className="metric-value switches">{hudSwitches}</div>
                        <div className="metric-label">CONTEXT SWITCHES</div>
                        <div className="metric-pct">today</div>
                      </div>
                    </div>
                  </section>

                  {/* WORKSTREAMS LIVE */}
                  <section className="card workstreams-section">
                    <div className="ws-header">
                      <div className="card-label">WORKSTREAMS LIVE</div>
                      <button className="ws-view-all" onClick={() => setPage("Workstreams")}>View all →</button>
                    </div>
                    {hudWorkstreams.length === 0 && state.streams.length === 0 && (
                      <div style={{ color: "#475569", fontSize: 12, padding: "8px 0" }}>
                        No active workstreams yet.
                      </div>
                    )}
                    {(hudWorkstreams.length > 0 ? hudWorkstreams : state.streams.slice(0, 5))
                      .map((ws: any, i: number) => (
                        <div className="ws-row" key={ws.workstream_id || ws.id || i}>
                          <Layers size={13} style={{ color: "#475569", flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {ws.name}
                            </div>
                            {ws.category && (
                              <div style={{ fontSize: 10, color: "#475569" }}>{ws.category}</div>
                            )}
                          </div>
                          <span className="ws-time">
                            {ws.total_active_seconds ? duration(ws.total_active_seconds * 1000) : "0s"}
                          </span>
                        </div>
                      ))}
                  </section>

                  {/* RECENT ACTIVITY */}
                  <section className="card workstreams-section">
                    <div className="ws-header">
                      <div className="card-label">RECENT ACTIVITY</div>
                      <button className="ws-view-all" onClick={() => setPage("Analytics")}>See all →</button>
                    </div>
                    {hudRecentTabs.length === 0 && rows.length === 0 && (
                      <div style={{ color: "#475569", fontSize: 12, padding: "8px 0" }}>
                        No activity recorded yet.
                      </div>
                    )}
                    {(hudRecentTabs.length > 0
                      ? hudRecentTabs.slice(0, 6)
                      : rows.slice(0, 6).map((v: any) => {
                          let dom = "";
                          try { dom = new URL(v.url).hostname.replace(/^www\./, ""); } catch { dom = v.url; }
                          return { domain: dom, title: v.title, productivity: (v as any).productivity || "neutral", category: (v as any).category || "", dwellTime: v.end - v.start };
                        })
                    ).map((t: any, i: number) => (
                      <div className="ws-row" key={i}>
                        <Globe size={13} style={{ color: "#475569", flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {t.domain || t.title}
                          </div>
                          {t.category && <div style={{ fontSize: 10, color: "#475569" }}>{t.category}</div>}
                        </div>
                        <span className={`tag ${
                          t.productivity === "productive" ? "tag-productive"
                          : t.productivity === "distracting" ? "tag-distracting"
                          : "tag-neutral"}`}
                          style={{ fontSize: 10, marginRight: 8 }}>
                          {t.productivity || "neutral"}
                        </span>
                        <span className="ws-time">{t.dwellTime ? duration(t.dwellTime) : ""}</span>
                      </div>
                    ))}
                  </section>
                </div>
              )}

              {/* ── ANALYTICS PAGE ─────────────────────────────────────────── */}
              {page === "Analytics" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="section-top">
                    <h2 style={{ color: "#e2e8f0" }}>Behavioral & Multitasking Graphs</h2>
                    <select aria-label="Time range" value={range} onChange={(e) => setRange(e.target.value)}
                      style={{ background: "#1a1d2e", border: "1px solid #252836", color: "#e2e8f0", borderRadius: 6, padding: "4px 8px" }}>
                      <option value="today">Today</option>
                      <option value="week">Last 7 days</option>
                    </select>
                  </div>

                  {/* Time distribution ring */}
                  <section className="card">
                    <div className="section-top">
                      <div>
                        <h2 style={{ color: "#e2e8f0" }}>Where your time went</h2>
                        <p>Visual time distribution across activities</p>
                      </div>
                      <div className="chart-toggle-group">
                        <button className={`chart-toggle-btn ${analyticsPieMode === "workstream" ? "active" : ""}`}
                          onClick={() => setAnalyticsPieMode("workstream")}>By Workstream</button>
                        <button className={`chart-toggle-btn ${analyticsPieMode === "domain" ? "active" : ""}`}
                          onClick={() => setAnalyticsPieMode("domain")}>By Domain</button>
                      </div>
                    </div>
                    <div className="distribution">
                      <div className="ring" style={{
                        background: m.total ? `conic-gradient(${(() => {
                          let pos = 0;
                          if (analyticsPieMode === "workstream") {
                            return state.streams.map((s) => {
                              const a = pos;
                              pos += ((m.durations[s.id] || 0) / m.total) * 100;
                              return `${s.color} ${a}% ${pos}%`;
                            }).join(",");
                          } else {
                            const dc = ["#6366f1","#10b981","#f59e0b","#ec4899","#06b6d4","#8b5cf6","#64748b"];
                            return Object.entries(m.domainDurations).slice(0, 7).map(([_, dur], idx) => {
                              const a = pos; pos += (dur / m.total) * 100;
                              return `${dc[idx % dc.length]} ${a}% ${pos}%`;
                            }).join(",");
                          }
                        })()})` : "#1e293b",
                      }}>
                        <div>
                          <strong>{duration(m.total)}</strong>
                          <small>total active time</small>
                        </div>
                      </div>
                      <div className="legend">
                        {analyticsPieMode === "workstream"
                          ? state.streams.map((s) => (
                              <div key={s.id}><span><i style={{ background: s.color }} />{s.name}</span><b>{duration(m.durations[s.id] || 0)}</b></div>
                            ))
                          : Object.entries(m.domainDurations).slice(0, 6).map(([dom, dur], idx) => {
                              const dc = ["#6366f1","#10b981","#f59e0b","#ec4899","#06b6d4","#8b5cf6"];
                              return (<div key={dom}><span><i style={{ background: dc[idx % dc.length] }} />{dom}</span><b>{duration(dur)}</b></div>);
                            })}
                      </div>
                    </div>
                  </section>

                  {/* Context Switches bar chart */}
                  <section className="card">
                    <div className="section-top">
                      <div>
                        <h2 style={{ color: "#e2e8f0" }}>Context Switches vs Time (Per Hour)</h2>
                        <p>Frequency of tab switches across the day</p>
                      </div>
                      <span className="pill">{m.switches} Total Switches</span>
                    </div>
                    <div className="hourly-chart-container">
                      <div className="hourly-bars-grid">
                        {m.hourlySwitches.map((count, hour) => {
                          const maxSwitch = Math.max(1, ...m.hourlySwitches);
                          const heightPercent = Math.max(6, (count / maxSwitch) * 100);
                          return (
                            <div className="hourly-bar-col" key={hour} title={`${hour}:00 - ${count} tab switches`}>
                              <div className={`hourly-bar-fill ${count > 4 ? "active-switches" : ""}`}
                                style={{ height: `${heightPercent}%` }} />
                              <span className="hourly-bar-label">{hour % 3 === 0 ? `${hour}h` : ""}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>

                  {/* Activity trail */}
                  <section className="card activity">
                    <div className="section-top">
                      <div>
                        <h2 style={{ color: "#e2e8f0" }}>Your activity trail</h2>
                        <p>A record of context with explainable intelligence</p>
                      </div>
                      <button className="quiet" onClick={exportData}><Download size={16} /> Export</button>
                    </div>
                    {!rows.length ? (
                      <div className="empty">
                        <Activity />
                        <h3>A fresh start.</h3>
                        <p>Your activity will appear here after you enable tracking.</p>
                      </div>
                    ) : (
                      <div className="activity-list">
                        {rows.slice(0, 30).map((v) => {
                          let domain = "";
                          try { domain = new URL(v.url).hostname.replace(/^www\./, ""); } catch { domain = v.url; }
                          const prodType = (v as any).productivity || "productive";
                          const catName = (v as any).category || stream(v.stream).name;
                          const actName = (v as any).activity || "General Browsing";
                          return (
                            <div className="activity-item" key={v.id}>
                              <div className="activity-item-main">
                                <div className="page-cell">
                                  <span className="site-icon" style={{ color: stream(v.stream).color, background: stream(v.stream).color + "18", borderColor: stream(v.stream).color + "30" }}>
                                    {domain.replace(/^www\./, "")[0]?.toUpperCase() || "A"}
                                  </span>
                                  <div><b>{v.title}</b><small>{domain}</small></div>
                                </div>
                                <span className="tag" style={{ color: stream(v.stream).color, background: stream(v.stream).color + "16", fontWeight: 600 }}>
                                  {stream(v.stream).name}
                                </span>
                              </div>
                              <div className="activity-item-sub">
                                <span className="activity-duration">{duration(Math.max(1000, v.end - v.start))}</span>
                                <span className="table-action-btns">
                                  <button className="action-btn-sm" title="Inspect" onClick={() => setSelectedTrace(displayTraces.find(t => t.session_id === v.id) || displayTraces[0])}>
                                    <Sparkles size={11} /> Trace
                                  </button>
                                  <button className="action-btn-sm" title="Correct" onClick={() => setFeedbackTarget({ domain, currentCategory: catName, currentActivity: actName, currentProductivity: prodType as ProductivityType, sessionId: v.id })}>
                                    <Edit3 size={11} /> Correct
                                  </button>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* ── PRODUCTIVE SITES PAGE ─────────────────────────────────── */}
              {page === "Productive Sites" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <section className="card">
                    <h2 style={{ color: "#e2e8f0" }}>Add Domain to Focus Classification</h2>
                    <p style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>
                      Classify websites as productive or unproductive.
                    </p>
                    <div className="quick-presets">
                      {["geeksforgeeks.org","docs.google.com","wikipedia.org","canva.com","notion.so"].map((dom) => (
                        <button key={dom} type="button" className="quick-preset-btn"
                          onClick={() => { call({ type: "ADD_PRODUCTIVE_DOMAIN", domain: dom }); setNotice(`Added ${dom} to Productive Sites.`); }}>
                          + {dom}
                        </button>
                      ))}
                    </div>
                    <form style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newDomain.trim()) return;
                        if (newDomainType === "productive") {
                          call({ type: "ADD_PRODUCTIVE_DOMAIN", domain: newDomain.trim() });
                          setNotice(`Added ${newDomain.trim()} to Productive Sites.`);
                        } else {
                          call({ type: "ADD_UNPRODUCTIVE_DOMAIN", domain: newDomain.trim() });
                          setNotice(`Added ${newDomain.trim()} to Unproductive Sites.`);
                        }
                        setNewDomain("");
                      }}>
                      <input type="text" required style={{ flex: 1, minWidth: 220, padding: "8px 12px", borderRadius: 8, border: "1px solid #252836", background: "#0f1117", color: "#e2e8f0" }}
                        placeholder="e.g. geeksforgeeks.org" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} />
                      <select style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #252836", background: "#0f1117", color: "#e2e8f0" }}
                        value={newDomainType} onChange={(e) => setNewDomainType(e.target.value as any)}>
                        <option value="productive">Productive (+ Focus)</option>
                        <option value="unproductive">Unproductive (Distraction Alert)</option>
                      </select>
                      <button type="submit" className="primary"><Plus size={16} /> Add Domain</button>
                    </form>
                  </section>
                  <div className="sites-manager-grid">
                    <div className="sites-column-card productive-col">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div><h3 style={{ margin: 0, color: "#10b981" }}>Productive Sites</h3><small style={{ color: "#64748b" }}>Boosts focus score</small></div>
                        <span className="pill" style={{ background: "#064e3b22", color: "#10b981" }}>{state.productiveDomains.length} Active</span>
                      </div>
                      <div className="sites-chip-list">
                        {state.productiveDomains.map((dom) => (
                          <span className="site-domain-chip productive" key={dom}>
                            <Check size={12} />{dom}
                            <button className="btn-remove-chip" onClick={() => call({ type: "REMOVE_DOMAIN_OVERRIDE", domain: dom })}>&times;</button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="sites-column-card unproductive-col">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div><h3 style={{ margin: 0, color: "#ef4444" }}>Unproductive Sites</h3><small style={{ color: "#64748b" }}>Triggers distraction alert</small></div>
                        <span className="pill" style={{ background: "#7f1d1d22", color: "#ef4444" }}>{state.unproductiveDomains.length} Monitored</span>
                      </div>
                      <div className="sites-chip-list">
                        {state.unproductiveDomains.map((dom) => (
                          <span className="site-domain-chip unproductive" key={dom}>
                            <AlertTriangle size={12} />{dom}
                            <button className="btn-remove-chip" onClick={() => call({ type: "REMOVE_DOMAIN_OVERRIDE", domain: dom })}>&times;</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── WORKSTREAMS PAGE ───────────────────────────────────────── */}
              {page === "Workstreams" && (
                <>
                  <WorkstreamMap
                    workstreams={activeWorkstreams.length > 0 ? activeWorkstreams : state.streams.map((s) => ({
                      workstream_id: s.id, name: s.name,
                      category: s.name.includes("Research") ? "Education" : s.name.includes("Design") ? "Technology" : "Chat",
                      created_at: Date.now() - 86400000, updated_at: Date.now(),
                      first_seen: Date.now() - 86400000, last_active: Date.now(),
                      total_active_seconds: Math.round(state.visits.filter((v) => v.stream === s.id).reduce((a, v) => a + (v.end - v.start), 0) / 1000),
                      confidence: 0.94, status: "active" as const,
                    }))}
                    sessions={state.visits.map((v) => {
                      let dom = "";
                      try { dom = new URL(v.url).hostname; } catch { dom = v.url; }
                      return { session_id: v.id, workstream_id: v.stream, domain: dom, dwell_time: Math.max(1000, v.end - v.start), title: v.title, url: v.url, activity_type: (v as any).activity || "General Browsing", category: (v as any).category || stream(v.stream).name, productivity_type: (v as any).productivity || "productive" } as any;
                    })}
                    onOpenTab={(url) => extension && chrome.tabs.create({ url })}
                  />
                  <section className="card" style={{ marginTop: 16 }}>
                    <div className="section-top">
                      <div><h2 style={{ color: "#e2e8f0" }}>Workstream rules</h2><p>Rules connecting related pages into task clusters.</p></div>
                      <button className="primary" onClick={() => { setRules(structuredClone(state.streams)); setModal("rules"); }}>Edit rules</button>
                    </div>
                  </section>
                </>
              )}

              {/* ── CONTEXT RESUME / SNAPSHOTS PAGE ───────────────────────── */}
              {(page === "Context resume" || page === "Snapshots") && (
                <div className="snapshots-container">
                  <div className="snapshots-topbar">
                    <div>
                      <h2 style={{ color: "#e2e8f0", margin: 0, fontSize: 18 }}>Context Snapshots</h2>
                      <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 12 }}>
                        Save and restore workspaces, open tab collections, and working context.
                      </p>
                    </div>
                    <button className="primary" onClick={() => openSnapshotModal()} style={{ whiteSpace: "nowrap" }}>
                      <Plus size={16} /> Save current workspace
                    </button>
                  </div>

                  {state.snapshots.length > 0 ? (
                    <div className="snapshots-grid">
                      {state.snapshots.map((s) => (
                        <div className="snapshot-card" key={s.id}>
                          <div className="snapshot-header">
                            <div className="snapshot-title-group">
                              <h3 className="snapshot-title" title={s.name}>{s.name}</h3>
                              <span className="snapshot-date">
                                Saved {new Date(s.created).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <span className="pill" style={{ flexShrink: 0 }}>{s.tabs.length} tabs</span>
                          </div>
                          {s.note && <div className="snapshot-note">{s.note}</div>}
                          <div className="snapshot-tabs-list">
                            {s.tabs.map((t, idx) => (
                              <div className="snapshot-tab-item" key={idx}>
                                <Globe size={13} />
                                <a href={t.url} target="_blank" rel="noreferrer" title={t.title || t.url}>
                                  {t.title || t.url}
                                </a>
                              </div>
                            ))}
                          </div>
                          <div className="snapshot-actions">
                            <button className="secondary" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => openSnapshotModal(s)}>
                              <Edit3 size={13} /> Update tabs
                            </button>
                            <div className="snapshot-actions-right">
                              <button className="danger" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => call({ type: "delete_snapshot", id: s.id })}>
                                <Trash2 size={13} /> Delete
                              </button>
                              <button className="primary" style={{ padding: "6px 14px", fontSize: 12 }} onClick={async () => {
                                await call({ type: "restore", id: s.id });
                                setNotice(`Restored workspace "${s.name}".`);
                              }}>
                                <Play size={13} /> Restore ({s.tabs.length})
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty">
                      <Bookmark size={36} />
                      <h3>No saved workspaces yet</h3>
                      <p>Click "Save current workspace" to capture your open tabs.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── DECISION TRACES PAGE ───────────────────────────────────── */}
              {page === "Decision traces" && (
                <section className="card">
                  <div className="section-top">
                    <div><h2 style={{ color: "#e2e8f0" }}>Explainable Decision Trace Stream</h2><p>Every categorization is auditable and locally grounded.</p></div>
                    <span className="pill">{displayTraces.length} Recorded Traces</span>
                  </div>
                  <div className="table">
                    <div className="tr th">
                      <span>TIMESTAMP</span><span>DOMAIN</span><span>CATEGORY</span>
                      <span>ACTIVITY</span><span>PRODUCTIVITY</span><span>LATENCY</span><span>ACTION</span>
                    </div>
                    {displayTraces.slice(0, 30).map((tr) => (
                      <div className="tr" key={tr.decision_id}>
                        <span>{new Date(tr.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        <span><b>{tr.domain_match?.domain || "web page"}</b></span>
                        <span><span className="trace-pill category-pill">{tr.model_predictions[0]?.label || "Technology"} ({Math.round((tr.model_predictions[0]?.score || 0.9) * 100)}%)</span></span>
                        <span>{tr.selected_activity}</span>
                        <span><span className={`productivity-tag ${tr.selected_productivity}`}>{tr.selected_productivity}</span></span>
                        <span><small>{tr.total_latency_ms} ms</small></span>
                        <span><button className="action-btn-sm" onClick={() => setSelectedTrace(tr)}><Sparkles size={12} /> Inspect</button></span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── SETTINGS PAGE ──────────────────────────────────────────── */}
              {page === "Settings" && (
                <>
                  <section className="card settings">
                    <h2 style={{ color: "#e2e8f0" }}>Local Intelligence & fastText ML Engine</h2>
                    <div className="setting-row">
                      <div>
                        <h3>On-Device fastText Classifier</h3>
                        <p>Model: <b>atentiv-page-category.ftz</b> (1.80 MB) · WASM · 0 network requests</p>
                      </div>
                      <span className="model-badge"><ShieldCheck size={13} /> Active & Quantized</span>
                    </div>
                  </section>
                  <section className="card settings">
                    <h2 style={{ color: "#e2e8f0" }}>Inactivity & Idle Threshold</h2>
                    <div className="setting-row">
                      <div>
                        <h3>Idle Threshold Timeout</h3>
                        <p>Current idle time today: <b>{duration(m.idleTime)}</b></p>
                      </div>
                      <select style={{ background: "#0f1117", border: "1px solid #252836", color: "#e2e8f0", borderRadius: 6, padding: "8px 14px" }}
                        value={state.idleThresholdSeconds}
                        onChange={(e) => call({ type: "settings", enabled: state.enabled, excluded: state.excluded, idleThresholdSeconds: Number(e.target.value) })}>
                        <option value={60}>1 minute</option>
                        <option value={120}>2 minutes</option>
                        <option value={180}>3 minutes (Default)</option>
                        <option value={300}>5 minutes</option>
                        <option value={600}>10 minutes</option>
                      </select>
                    </div>
                  </section>
                  <section className="card settings">
                    <h2 style={{ color: "#e2e8f0" }}>Privacy & Tracking</h2>
                    <div className="setting-row">
                      <div><h3>Local activity tracking</h3><p>Record page titles, sanitized URLs, workstream labels and active dwell time.</p></div>
                      <button className={isTracking ? "secondary" : "primary"}
                        onClick={handleToggleTracking}>
                        {isTracking ? <><Pause size={16} /> Pause tracking</> : <><Play size={16} /> Enable tracking</>}
                      </button>
                    </div>
                    <div className="setting-row">
                      <div><h3>Excluded websites</h3><p>Comma-separated domains. Subdomains included.</p></div>
                      <button className="secondary" onClick={() => { setBlocked(state.excluded); setModal("exclude"); }}>Edit exclusions</button>
                    </div>
                    <div className="setting-row">
                      <div><h3>Take your data with you</h3><p>Export recorded activity as JSON.</p></div>
                      <button className="secondary" onClick={exportData}><Download size={16} /> Export</button>
                    </div>
                    <div className="setting-row">
                      <div><h3>Delete activity and saved contexts</h3><p>Clears all recorded activity.</p></div>
                      <button className="danger" onClick={() => setModal("clear")}>Delete data</button>
                    </div>
                  </section>
                </>
              )}

              <footer style={{ padding: "12px 0", color: "#334155", fontSize: 11, display: "flex", gap: 12, alignItems: "center" }}>
                <ShieldCheck size={14} />
                <span>Stored on this device · Built for intentional browsing</span>
              </footer>
            </div>
          </main>

          {/* ══ RIGHT PANEL ════════════════════════════════════════════════ */}
          <aside className="right-panel">
            {/* Open Tabs */}
            <div>
              {(() => {
                const currentOpenTabs = openTabsList.length > 0 ? openTabsList : (hud.openTabs || []);
                return (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="rp-section-label">OPEN TABS</span>
                        <span className="rp-badge">{currentOpenTabs.length}</span>
                      </div>
                      <select style={{ background: "#1a1d2e", border: "1px solid #252836", color: "#64748b", borderRadius: 4, fontSize: 10, padding: "2px 4px" }}>
                        <option>Group by Workstream</option>
                        <option>Group by Domain</option>
                      </select>
                    </div>
                    {currentOpenTabs.length === 0 ? (
                      <div style={{ color: "#334155", fontSize: 12, textAlign: "center", padding: "12px 0" }}>No open tabs</div>
                    ) : currentOpenTabs.filter((t: any) => !searchTerm || (t.title || t.url || "").toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 10).map((t: any, i: number) => (
                      <div key={t.id ?? i}
                        onClick={() => {
                          if (t.id && typeof chrome !== "undefined" && chrome.tabs?.update) {
                            chrome.tabs.update(t.id, { active: true });
                          }
                        }}
                        style={{ fontSize: 11, color: t.active ? "#e2e8f0" : "#94a3b8", padding: "6px 4px", borderBottom: "1px solid #1a2232", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                        title={t.title || t.url}>
                        <Globe size={11} style={{ flexShrink: 0, color: t.active ? "#10b981" : "#64748b" }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", flex: 1, minWidth: 0 }}>{t.title || t.url}</span>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>

            {/* Tab Groups */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="rp-section-label">TAB GROUPS</span>
                <button
                  onClick={() => openSnapshotModal()}
                  style={{ background: "#7c3aed22", border: "1px solid #7c3aed44", color: "#8b5cf6", borderRadius: 4, fontSize: 10, padding: "2px 8px", cursor: "pointer" }}>
                  + New Group
                </button>
              </div>
              <div style={{ color: "#334155", fontSize: 12, textAlign: "center", padding: "12px 0" }}>No groups</div>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="rp-section-label" style={{ marginBottom: 10 }}>QUICK ACTIONS</div>
              <div className="quick-actions-grid">
                <button className="quick-action-btn" onClick={() => openSnapshotModal()}>
                  <Camera size={18} style={{ color: "#8b5cf6" }} />
                  <span>Take Snapshot</span>
                </button>
                <button className="quick-action-btn" onClick={async () => {
                  if (extension) {
                    try {
                      const res: any = await chrome.runtime.sendMessage({ type: "CLOSE_BACKGROUND_TABS" });
                      setNotice(`Focus Mode: closed ${res?.closedCount ?? 0} background tabs.`);
                    } catch {
                      setNotice("Focus Mode activated.");
                    }
                  }
                }}>
                  <Zap size={18} style={{ color: "#ef4444" }} />
                  <span>Focus Mode</span>
                </button>
                <button className="quick-action-btn" onClick={handleToggleTracking}>
                  {isTracking ? <Pause size={18} style={{ color: "#64748b" }} /> : <Play size={18} style={{ color: "#10b981" }} />}
                  <span>{isTracking ? "Pause Tracking" : "Resume"}</span>
                </button>
                <button className="quick-action-btn" onClick={() => extension && chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") })}>
                  <ExternalLink size={18} style={{ color: "#64748b" }} />
                  <span>Open Dashboard</span>
                </button>
              </div>
            </div>
          </aside>

        </div>{/* end content+right row */}
      </div>{/* end main-and-right */}

      {/* ── Decision Trace Modal ── */}
      {selectedTrace && <DecisionTraceModal trace={selectedTrace} onClose={() => setSelectedTrace(null)} />}

      {/* ── Feedback Modal ── */}
      {feedbackTarget && (
        <FeedbackModal
          domain={feedbackTarget.domain}
          currentCategory={feedbackTarget.currentCategory}
          currentActivity={feedbackTarget.currentActivity}
          currentProductivity={feedbackTarget.currentProductivity}
          onClose={() => setFeedbackTarget(null)}
          onSubmit={async (feedback) => {
            await call({ type: "USER_FEEDBACK", domain: feedbackTarget.domain, sessionId: feedbackTarget.sessionId, userCategory: feedback.userCategory, userActivity: feedback.userActivity, userProductivity: feedback.userProductivity, reason: feedback.reason });
            setNotice(`Rule created for ${feedbackTarget.domain}. Future visits classified as ${feedback.userCategory} (${feedback.userProductivity}).`);
            setFeedbackTarget(null);
          }}
        />
      )}

      {/* ── Modal Dialogs ── */}
      {modal && (
        <div className="overlay" onClick={() => setModal("")}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={modal}>
            <div className="section-top">
              <h2 style={{ color: "#e2e8f0" }}>
                {modal === "save" ? (snapshotTargetId ? "Update Workspace Tabs" : "Save Current Workspace")
                  : modal === "exclude" ? "Excluded Websites"
                  : modal === "rules" ? "Workstream Rules"
                  : modal === "clear" ? "Delete All Data"
                  : "Log a Page Visit"}
              </h2>
              <button className="quiet icon-btn" onClick={() => setModal("")} aria-label="Close"><X size={18} /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (modal === "save") {
                const selectedTabs = availableTabs.filter((t) => t.checked);
                if (snapshotTargetId) {
                  await call({ type: "update_snapshot", id: snapshotTargetId, name, note, tabs: selectedTabs });
                  setNotice(`Updated workspace "${name}".`);
                } else {
                  await call({ type: "save", name, note, tabs: selectedTabs });
                  setNotice(`Saved workspace "${name}".`);
                }
              } else if (modal === "exclude") {
                await call({ type: "settings", enabled: state.enabled, excluded: blocked });
              } else if (modal === "rules") {
                await call({ type: "rules", streams: rules });
              } else if (modal === "clear") {
                await call({ type: "clear" });
              } else if (modal === "logpage") {
                if (logUrl.trim()) {
                  await call({ type: "log", url: logUrl.trim(), title: logTitle.trim() || logUrl.trim() });
                  setNotice(`Logged and classified: ${logUrl.trim()}`);
                }
              }
              setModal("");
            }}>
              {modal === "save" && (
                <>
                  <label>Workspace name<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cognitive Load Experiment" /></label>
                  <label>Where should you pick up?<textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Continue comparing approaches..." /></label>
                  <div style={{ marginTop: 14 }}>
                    <div className="tab-select-helpers">
                      <span>Select tabs ({availableTabs.filter((t) => t.checked).length} selected):</span>
                      <div>
                        <button type="button" onClick={() => setAvailableTabs(availableTabs.map((t) => ({ ...t, checked: true })))}>Select all</button>
                        <span>·</span>
                        <button type="button" onClick={() => setAvailableTabs(availableTabs.map((t) => ({ ...t, checked: false })))}>Deselect all</button>
                      </div>
                    </div>
                    <div className="tabs-checkbox-list">
                      {availableTabs.map((tab, idx) => (
                        <div key={idx} className="tab-checkbox-item" onClick={() => setAvailableTabs(availableTabs.map((t, i) => i === idx ? { ...t, checked: !t.checked } : t))}>
                          <input type="checkbox" checked={tab.checked} onChange={() => {}} />
                          <span className="tab-title">{tab.title}</span>
                          <span className="tab-url">{tab.url}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {modal === "exclude" && (
                <label>Domains<textarea value={blocked} onChange={(e) => setBlocked(e.target.value)} placeholder="bank.example, health.example" /></label>
              )}
              {modal === "rules" && rules.filter((s) => s.id !== "other").map((s) => (
                <fieldset key={s.id}>
                  <legend>{s.name}</legend>
                  {(["name", "domains", "keywords"] as const).map((key) => (
                    <label key={key}>{key}<input required={key === "name"} value={s[key]} onChange={(e) => setRules(rules.map((x) => x.id === s.id ? { ...x, [key]: e.target.value } : x))} /></label>
                  ))}
                </fieldset>
              ))}
              {modal === "clear" && <p>This permanently deletes your activity and saved workspaces. Rules and preferences are kept.</p>}
              {modal === "logpage" && (
                <>
                  <div className="quick-presets">
                    {[
                      { title: "GeeksforGeeks — Binary Search Tree", url: "https://www.geeksforgeeks.org/binary-search-tree-data-structure/" },
                      { title: "Stack Overflow — TypeScript generics", url: "https://stackoverflow.com/questions/typescript-generics" },
                      { title: "YouTube — System Architecture Lecture", url: "https://youtube.com/watch?v=sys-design" },
                    ].map((p) => (
                      <button key={p.title} type="button" className="quick-preset-btn" onClick={() => { setLogUrl(p.url); setLogTitle(p.title); }}>
                        + {p.title.split(" — ")[0]}
                      </button>
                    ))}
                  </div>
                  <label>Page URL<input autoFocus required type="url" value={logUrl} onChange={(e) => setLogUrl(e.target.value)} placeholder="https://example.com/article" /></label>
                  <label>Page title (optional)<input value={logTitle} onChange={(e) => setLogTitle(e.target.value)} placeholder="e.g. GeeksforGeeks Data Structures" /></label>
                </>
              )}
              <div className="modal-actions">
                <button type="button" className="quiet" onClick={() => setModal("")}>Cancel</button>
                <button type="submit" className={modal === "clear" ? "danger" : "primary"}>
                  {modal === "clear" ? "Delete data" : modal === "save" ? (snapshotTargetId ? "Update workspace" : "Save workspace") : modal === "logpage" ? "Log it" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
