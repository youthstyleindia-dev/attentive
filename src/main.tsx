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
  Volume2,
  Sliders,
  Palette,
  Database,
  RefreshCw,
  Eye,
  Lock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  initial,
  demoState,
  metrics,
  classify,
  type State,
  type Stream,
  type Snapshot,
} from "./model";

const CATEGORY_COLORS: Record<string, string> = {
  Technology: "#6366f1",
  Education: "#10b981",
  Work: "#3b82f6",
  Chat: "#f59e0b",
  Entertainment: "#ec4899",
  Shop: "#8b5cf6",
  News: "#06b6d4",
  Government: "#64748b",
  Health: "#ef4444",
  Travel: "#14b8a6",
  Uncategorized: "#94a3b8",
};
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
import type {
  DecisionTraceRecord,
  WorkstreamRecord,
  ProductivityType,
  UserRuleRecord,
  UserRuleCondition,
  TabSessionRecord,
} from "./db/schemas";
import { db } from "./db/database";
import { RuleRepository } from "./db/repositories/ruleRepository";
import {
  AudioClassifier,
  type AudioClassificationResult,
  type AudioPlatform,
} from "./ml/audioClassifier";
import "./style.css";

const extension = typeof chrome !== "undefined" && !!chrome.runtime?.id;
const duration = (n: number) =>
  n < 60000
    ? `${Math.round(n / 1000)}s`
    : `${Math.floor(n / 3600000) ? Math.floor(n / 3600000) + "h " : ""}${Math.floor(n / 60000) % 60}m ${Math.round((n % 60000) / 1000)}s`;

// ── Focus score ring component ────────────────────────────────────────────
function FocusRing({
  score,
  label,
  size,
  stroke,
}: {
  score: number;
  label?: string;
  size: number;
  stroke: number;
}) {
  const r = size / 2 - stroke;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * Math.max(0, Math.min(100, score))) / 100;
  const cx = size / 2;
  const uid = `gr${size}`;
  const displayText = label !== undefined ? label : String(score);
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={uid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke="#1e293b"
        strokeWidth={stroke}
      />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={`url(#${uid})`}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={label ? circ : offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
      />
      <text
        x={cx}
        y={cx + (size > 70 ? 7 : 5)}
        textAnchor="middle"
        fill="white"
        fontSize={size > 70 ? 20 : 14}
        fontWeight="800"
        fontFamily="monospace"
      >
        {displayText}
      </text>
      {size > 70 && !label && (
        <text
          x={cx}
          y={cx + 22}
          textAnchor="middle"
          fill="#475569"
          fontSize={10}
        >
          /100
        </text>
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
  const [newDomainType, setNewDomainType] = useState<
    "productive" | "unproductive"
  >("productive");
  const [rules, setRules] = useState<Stream[]>([]);
  const [blocked, setBlocked] = useState("");

  // Full Settings & Configuration states
  type SettingsTab =
    "general" | "rules" | "exclusions" | "audio" | "appearance" | "data";
  const [settingsTab, setSettingsTab] = useState<SettingsTab>(() => {
    if (typeof window !== "undefined") {
      const t = new URLSearchParams(window.location.search).get(
        "tab",
      ) as SettingsTab;
      if (
        t &&
        [
          "general",
          "rules",
          "exclusions",
          "audio",
          "appearance",
          "data",
        ].includes(t)
      ) {
        return t;
      }
    }
    return "general";
  });

  const [customRules, setCustomRules] = useState<UserRuleRecord[]>([]);
  const [ruleName, setRuleName] = useState("");
  const [ruleConditionType, setRuleConditionType] = useState<
    "domain_exact" | "domain_contains" | "title_contains" | "url_prefix"
  >("domain_exact");
  const [ruleValue, setRuleValue] = useState("");
  const [ruleCategory, setRuleCategory] = useState("Education");
  const [ruleProductivity, setRuleProductivity] =
    useState<ProductivityType>("productive");
  const [rulePriority, setRulePriority] = useState(150);

  const [exclDomain, setExclDomain] = useState("");
  const [exclReason, setExclReason] = useState("");

  const [audioTrackingEnabled, setAudioTrackingEnabled] = useState(true);
  const [audioThreshold, setAudioThreshold] = useState(60);

  const [accentColor, setAccentColor] = useState("#7c3aed");
  const [themeMode, setThemeMode] = useState("dark");
  const [focusGoal, setFocusGoal] = useState(80);
  const [hudEnabled, setHudEnabled] = useState(true);
  const [hudAudioEnabled, setHudAudioEnabled] = useState(true);
  const [hudWorkstreamEnabled, setHudWorkstreamEnabled] = useState(true);
  const [autoSnapSwitch, setAutoSnapSwitch] = useState(true);
  const [autoSnapTabLimit, setAutoSnapTabLimit] = useState(true);
  const [autoSnapHourly, setAutoSnapHourly] = useState(true);

  const refreshRules = async () => {
    try {
      const list = await RuleRepository.listAll();
      setCustomRules(list);
    } catch {
      // IndexedDB query fallback
    }
  };

  useEffect(() => {
    refreshRules();
  }, []);

  // Audio Classification page state
  const [activeAudioSessions, setActiveAudioSessions] = useState<any[]>([]);
  const [historyAudioSessions, setHistoryAudioSessions] = useState<
    TabSessionRecord[]
  >([]);
  const [audioInputUrl, setAudioInputUrl] = useState(
    "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
  );
  const [audioInputTitle, setAudioInputTitle] = useState(
    "Lofi Hip Hop Radio - Beats to Relax/Study to (Chillhop)",
  );
  const [audioResult, setAudioResult] =
    useState<AudioClassificationResult | null>(null);
  const [isAudioClassifying, setIsAudioClassifying] = useState(false);
  const [isPlayingTestTone, setIsPlayingTestTone] = useState(false);
  const [testToneTitle, setTestToneTitle] = useState("");

  const audioCtxRef = React.useRef<any>(null);
  const oscRef = React.useRef<any>(null);

  const startTone = (
    frequency = 260,
    title = "Synthetic Lo-Fi Ambient Tone",
  ) => {
    stopTone();
    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      audioCtxRef.current = ctx;
      oscRef.current = osc;
      setIsPlayingTestTone(true);
      setTestToneTitle(title);
      setNotice(`Audible tone started (${title}). Tab is now audible!`);
    } catch (e) {
      console.error("Web Audio tone start error:", e);
    }
  };

  const stopTone = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
      } catch {}
      oscRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
    setIsPlayingTestTone(false);
    setTestToneTitle("");
  };

  const refreshAudioSessions = async () => {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      try {
        chrome.runtime.sendMessage({ type: "GET_AUDIO_SESSIONS" }, (resp) => {
          if (resp?.activeAudioSessions) {
            setActiveAudioSessions(resp.activeAudioSessions);
          }
        });
      } catch {}
    }

    try {
      const sessions = await db.tab_sessions
        .filter((s) => Boolean(s.is_audio_session))
        .reverse()
        .limit(10)
        .toArray();
      setHistoryAudioSessions(sessions);
    } catch {}
  };

  const handleRunAudioClassification = async (url: string, title: string) => {
    setIsAudioClassifying(true);
    try {
      const result = await AudioClassifier.classifyAudio(url, title);
      setAudioResult(result);
    } catch (e) {
      console.error("Audio classification error:", e);
    } finally {
      setIsAudioClassifying(false);
    }
  };

  useEffect(() => {
    refreshAudioSessions();
    handleRunAudioClassification(audioInputUrl, audioInputTitle);
    const interval = setInterval(refreshAudioSessions, 3000);
    return () => clearInterval(interval);
  }, []);

  // Snapshot modal state
  const [snapshotTargetId, setSnapshotTargetId] = useState<string | null>(null);
  const [availableTabs, setAvailableTabs] = useState<
    Array<{ title: string; url: string; checked: boolean }>
  >([]);

  // Analytics toggle
  const [analyticsPieMode, setAnalyticsPieMode] = useState<
    "workstream" | "domain"
  >("workstream");

  // Open Tabs grouping
  const [openTabGroupBy, setOpenTabGroupBy] = useState<
    "workstream" | "domain" | "none"
  >("workstream");
  const [collapsedTabGroups, setCollapsedTabGroups] = useState<
    Record<string, boolean>
  >({});

  // Modals & inspectors
  const [selectedTrace, setSelectedTrace] =
    useState<DecisionTraceRecord | null>(null);
  const [traces, setTraces] = useState<DecisionTraceRecord[]>(() =>
    loadTraces(),
  );
  const [activeWorkstreams, setActiveWorkstreams] = useState<
    WorkstreamRecord[]
  >(() => loadWorkstreams());
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
    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
    ) => {
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
              return (
                !u.startsWith("chrome://") &&
                !u.startsWith("chrome-extension://") &&
                !u.startsWith("edge://")
              );
            })
            .map((t) => {
              let domain = "";
              try {
                domain = new URL(
                  t.url || (t as any).pendingUrl || "",
                ).hostname.replace(/^www\./, "");
              } catch {}
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

    const onTabChange = () => {
      poll();
    };
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
  const start =
    range === "today" ? new Date(now).setHours(0, 0, 0, 0) : now - 7 * 86400000;
  const m = metrics(
    state.visits,
    start,
    now,
    undefined,
    state.productiveDomains,
    state.unproductiveDomains,
    state.idleSeconds,
  );
  const stream = (id: string) =>
    state.streams.find((s) => s.id === id) ||
    state.streams[state.streams.length - 1];
  const rows = state.visits
    .filter((v) => v.end > start)
    .slice()
    .reverse();

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
  const pct = (v: number) =>
    hudTotal > 0 ? Math.round((v / hudTotal) * 100) : 0;
  const hudWorkstreams: any[] = hud.activeWorkstreams || [];
  const hudRecentTabs: any[] = hud.recentTabs || [];
  const isTracking =
    hud.status?.isEnabled !== undefined
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

  // ── FR-19: Context-Switch Penalty Reports (>6 switches in 10 minutes) ──
  const switchVisits = state.visits
    .filter((v) => v.switched && v.start >= start && v.start <= now)
    .sort((a, b) => a.start - b.start);

  interface SwitchPenaltyCluster {
    startTime: number;
    endTime: number;
    switches: number;
    cspPercent: number;
    costSeconds: number;
    severity: "amber" | "red";
  }

  const penaltyClusters: SwitchPenaltyCluster[] = [];
  const WINDOW_MS = 10 * 60 * 1000;
  let sIdx = 0;
  while (sIdx < switchVisits.length) {
    const winStart = switchVisits[sIdx].start;
    const winEnd = winStart + WINDOW_MS;
    const inWin = switchVisits.filter(
      (v) => v.start >= winStart && v.start <= winEnd,
    );
    if (inWin.length > 6) {
      const switchesCount = inWin.length;
      const costSec = switchesCount * 25;
      const cspPercent = Math.min(100, Math.round((costSec / 600) * 100));
      penaltyClusters.push({
        startTime: winStart,
        endTime: Math.min(winEnd, inWin[inWin.length - 1].start + 30000),
        switches: switchesCount,
        cspPercent,
        costSeconds: costSec,
        severity: switchesCount > 10 ? "red" : "amber",
      });
      sIdx += inWin.length;
    } else {
      sIdx++;
    }
  }

  // Decision traces display
  const displayTraces: DecisionTraceRecord[] =
    traces.length > 0
      ? traces
      : state.visits
          .slice()
          .reverse()
          .slice(0, 30)
          .map((v) => {
            let domain = "";
            try {
              domain = new URL(v.url).hostname.replace(/^www\./, "");
            } catch {
              domain = v.url;
            }
            const s = stream(v.stream);
            return {
              decision_id: `auto-${v.id}`,
              session_id: v.id,
              timestamp: v.start,
              rule_matches: [],
              domain_match: {
                domain,
                category: s.name,
                activity: "General Browsing",
              },
              keyword_matches: v.title.toLowerCase().split(/\s+/).slice(0, 4),
              model_predictions: [
                { label: s.name, score: 0.9 },
                { label: "Technology", score: 0.65 },
              ],
              model_confidence: 0.9,
              selected_activity: "General Browsing",
              selected_productivity: ((v as any).productivity ||
                "productive") as ProductivityType,
              selected_workstream: s.name,
              workstream_scores: { [s.name]: 0.9 },
              final_reason: [
                `Domain matched: ${domain}`,
                `Classified via domain + keyword rules`,
              ],
              model_version: "1.0.0",
              feature_schema_version: "1.0.0",
              total_latency_ms: 0.05,
            };
          });

  function exportData() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            mode: demo ? "demo" : "live",
            user,
            ...state,
            metrics: m,
            traces,
            activeWorkstreams,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "atentiv-export.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function openSnapshotModal(
    existingSnapshot?: Snapshot,
    preset?: { name: string; tabs: Array<{ title: string; url: string }> },
  ) {
    if (preset) {
      setSnapshotTargetId(null);
      setName(preset.name);
      setNote(`Captured cluster from ${preset.name}.`);
      setAvailableTabs(
        preset.tabs.map((t) => ({
          title: t.title || t.url,
          url: t.url,
          checked: true,
        })),
      );
      setModal("save");
      return;
    }
    if (existingSnapshot) {
      setSnapshotTargetId(existingSnapshot.id);
      setName(existingSnapshot.name);
      setNote(existingSnapshot.note);
      const checkedUrls = new Set(existingSnapshot.tabs.map((t) => t.url));
      const candidates: Array<{
        title: string;
        url: string;
        checked: boolean;
      }> = [
        ...existingSnapshot.tabs.map((t) => ({
          title: t.title,
          url: t.url,
          checked: true,
        })),
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
      setName(
        `Workspace — ${new Date().toLocaleDateString([], { month: "short", day: "numeric" })}`,
      );
      setNote("");
      let candidateList: Array<{
        title: string;
        url: string;
        checked: boolean;
      }> = [];
      if (extension && typeof chrome !== "undefined" && chrome.tabs?.query) {
        try {
          const openTabs = await chrome.tabs.query({});
          for (const t of openTabs) {
            const u = t.url || (t as any).pendingUrl || "";
            if (
              u &&
              !u.startsWith("chrome-extension://") &&
              !u.startsWith("chrome://") &&
              !u.startsWith("edge://")
            ) {
              candidateList.push({
                title: t.title || u,
                url: u,
                checked: true,
              });
            }
          }
        } catch {}
      }
      if (candidateList.length === 0 && openTabsList.length > 0) {
        for (const t of openTabsList) {
          if (t.url)
            candidateList.push({
              title: t.title || t.url,
              url: t.url,
              checked: true,
            });
        }
      }
      if (candidateList.length === 0) {
        const recent = state.visits.slice(-8).reverse();
        const seen = new Set<string>();
        for (const v of recent) {
          if (!seen.has(v.url)) {
            seen.add(v.url);
            candidateList.push({ title: v.title, url: v.url, checked: true });
          }
        }
      }
      setAvailableTabs(candidateList);
    }
    setModal("save");
  }

  // Check if opening options page or options mode
  const isOptionsMode =
    typeof window !== "undefined" &&
    (window.location.pathname.toLowerCase().includes("options") ||
      document.body.classList.contains("options-mode"));

  // ── LOGIN PAGE ─────────────────────────────────────────────────────────
  if (!user.loggedIn && !isOptionsMode) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-brand">
            <div className="login-logo">
              <Activity size={30} />
            </div>
            <h1>Atentiv</h1>
            <p>Privacy-Preserving Browser Activity Intelligence</p>
          </div>
          <form
            className="login-form"
            onSubmit={(e) => {
              e.preventDefault();
              const updated = {
                ...user,
                loggedIn: true,
                loginTime: Date.now(),
              };
              saveUser(updated);
              setUser(updated);
              setShowLoginWelcome(true);
            }}
          >
            <label>
              Username / Workspace Email
              <input
                type="text"
                required
                defaultValue={user.username}
                placeholder="e.g. divya or divya@atentiv.ai"
              />
            </label>
            <label>
              Master Password
              <input
                type="password"
                required
                defaultValue="password123"
                placeholder="••••••••"
              />
            </label>
            <div className="login-actions">
              <button type="submit" className="btn-quick-login">
                Sign In to Atentiv
              </button>
              <button
                type="button"
                className="btn-subtle-login"
                onClick={() => {
                  const updated = {
                    ...DEFAULT_USER,
                    loggedIn: true,
                    loginTime: Date.now(),
                  };
                  saveUser(updated);
                  setUser(updated);
                  setShowLoginWelcome(true);
                }}
              >
                1-Click Continue as Divya (Personal)
              </button>
            </div>
          </form>
          <div
            style={{
              marginTop: 24,
              fontSize: 11,
              color: "#94a3b8",
              textAlign: "center",
            }}
          >
            <ShieldCheck
              size={14}
              style={{
                display: "inline",
                verticalAlign: "middle",
                marginRight: 4,
              }}
            />
            100% on-device local storage · Zero cloud uploads
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN APP SHELL (image-2 3-column layout) ───────────────────────────
  return (
    <div className="app-shell">
      {/* ── Focus Score on Login Welcome Modal ── */}
      {showLoginWelcome && (
        <div className="overlay" onClick={() => setShowLoginWelcome(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 480 }}
          >
            <div className="welcome-focus-card" style={{ marginBottom: 16 }}>
              <div className="welcome-info">
                <h3>Welcome back, {user.name}!</h3>
                <p>Here is your current browser attention and focus score:</p>
                <div className="welcome-metrics">
                  <span>
                    🟢 Productive:{" "}
                    {duration(hudProductiveMs || m.productiveTime)}
                  </span>
                  <span>⚡ Switches: {hudSwitches || m.switches}</span>
                </div>
              </div>
              <div className="welcome-score-circle">
                <b>{hasFocusData ? hudScore : (m.score ?? 85)}</b>
                <small>FOCUS</small>
              </div>
            </div>
            <p
              style={{ fontSize: 13, color: "#64748b", margin: "12px 0 20px" }}
            >
              Atentiv tracks only the active tab on-device with zero telemetry.
            </p>
            <div
              className="modal-actions"
              style={{ justifyContent: "flex-end" }}
            >
              <button
                className="primary"
                onClick={() => setShowLoginWelcome(false)}
              >
                Enter Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ LEFT SIDEBAR ════════════════════════════════════════════════════ */}
      <aside className="left-sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-row">
            <div className="sidebar-logo">
              <Activity size={18} />
            </div>
            <div>
              <div className="sidebar-brand-name">Atentiv</div>
              <div className="sidebar-brand-sub">Browse Mindfully</div>
            </div>
          </div>
        </div>

        {/* User profile row with Logout button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 12px",
            borderBottom: "1px solid #1e293b",
            margin: "0 4px 8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 0,
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#7c3aed",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {user.avatar || "D"}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#e2e8f0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name}
            </span>
          </div>
          <button
            className="quiet icon-btn"
            title="Sign out"
            style={{ padding: 4 }}
            onClick={() => {
              const u = { ...user, loggedIn: false };
              saveUser(u);
              setUser(u);
            }}
          >
            <LogOut size={13} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {(
            [
              [Home, "Home", "Home"],
              [Activity, "Overview", "Overview"],
              [Radio, "Live View", "Live View"],
              [Layers, "Workstreams", "Workstreams"],
              [BarChart2, "Analytics", "Analytics"],
              [Target, "Productive Sites", "Productive Sites"],
              [Clock, "Decision traces", "Decision traces"],
              [Volume2, "Audio Classification", "Audio Classification"],
              [Zap, "Rules", "Rules"],
              [Bookmark, "Context resume", "Context resume"],
              [Settings, "Settings", "Settings"],
            ] as [React.ComponentType<{ size: number }>, string, string][]
          ).map(([Icon, label, pageKey]) => {
            const isActive =
              page === pageKey ||
              (label === "Home" && page === "Home") ||
              (label === "Overview" && page === "Overview") ||
              (label === "Live View" && page === "Live View") ||
              (label === "Audio Classification" &&
                (page === "Audio Classification" || page === "Audio")) ||
              (label === "Rules" &&
                (page === "Rules" ||
                  (page === "Settings" && settingsTab === "rules"))) ||
              (label === "Settings" &&
                page === "Settings" &&
                settingsTab !== "rules") ||
              (label === "Context resume" &&
                (page === "Snapshots" || page === "Context resume")) ||
              (label === "Productive Sites" &&
                (page === "Productivity" || page === "Productive Sites")) ||
              (label === "Decision traces" &&
                (page === "History" || page === "Decision traces"));
            return (
              <button
                key={label}
                className={`nav-item${isActive ? " active" : ""}`}
                onClick={() => {
                  if (label === "Rules") {
                    setPage("Settings");
                    setSettingsTab("rules");
                  } else {
                    setPage(pageKey);
                  }
                }}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom: live tracking stats */}
        <div className="sidebar-bottom">
          <div className="tracking-indicator">
            <span
              className="tracking-dot"
              style={{
                background: isUntrackable
                  ? "#64748b"
                  : isTracking
                    ? "#10b981"
                    : isIdle
                      ? "#f59e0b"
                      : "#ef4444",
              }}
            />
            <span className="tracking-label">
              {isUntrackable
                ? "UNTRACKABLE PAGE"
                : isTracking
                  ? "TRACKING ACTIVE"
                  : isIdle
                    ? "PAUSED — INACTIVE"
                    : "TRACKING PAUSED"}
            </span>
          </div>
          {isTracking && (
            <div className="tracking-since">
              Since{" "}
              {new Date(sessionStart).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
          <div className="session-timer">{sessionTimer}</div>
          <div className="focus-ring-label">TODAY'S FOCUS</div>
          <div
            className="focus-ring-small"
            title={
              hasFocusData
                ? `Focus Score: ${hudScore}/100`
                : "Focus score unavailable: no tracked browsing dwell time recorded yet."
            }
          >
            <FocusRing
              score={hasFocusData ? hudScore : 0}
              label={hasFocusData ? undefined : "—"}
              size={60}
              stroke={6}
            />
          </div>
          <button
            className={`btn-pause ${!isTracking ? "paused" : ""}`}
            onClick={handleToggleTracking}
          >
            {isTracking ? (
              <>
                <Pause size={13} /> Pause Tracking
              </>
            ) : (
              <>
                <Play size={13} /> Resume Tracking
              </>
            )}
          </button>
          <button
            className="btn-open-dashboard"
            onClick={() =>
              extension &&
              chrome.tabs.create({
                url: chrome.runtime.getURL("dashboard.html"),
              })
            }
          >
            Open Dashboard
          </button>
        </div>
      </aside>

      {/* ══ MAIN + RIGHT wrapper ════════════════════════════════════════════ */}
      <div className="main-and-right">
        {/* ── TOP HEADER ──────────────────────────────────────────────────── */}
        <header className="top-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0" }}>
              Atentiv
            </span>
            <span style={{ fontSize: 11, color: "#475569" }}>
              Browse Mindfully
            </span>
          </div>
          <div style={{ flex: 1, maxWidth: 360 }}>
            <div className="header-search">
              <Search size={13} style={{ color: "#475569", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search tabs, workstreams, or anything..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#e2e8f0",
                  fontSize: 12,
                  flex: 1,
                  width: "100%",
                }}
              />
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  color: "#334155",
                  background: "#0f1117",
                  borderRadius: 4,
                  padding: "1px 5px",
                }}
              >
                ⌘K
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginLeft: "auto",
            }}
          >
            {demo && (
              <span
                className="pill"
                style={{ background: "#8b5cf622", color: "#c4b5fd" }}
              >
                Demo workspace
              </span>
            )}
            <button className="quiet" onClick={() => setDemo(!demo)}>
              {demo ? "Exit demo" : "Explore demo"}
            </button>
            <div className="header-time">
              {new Date(now).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              <span
                style={{
                  fontSize: 10,
                  color: "#475569",
                  marginLeft: 6,
                  fontWeight: 400,
                }}
              >
                {new Date(now).toLocaleDateString([], {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="tracking-badge">
              <span
                className="tracking-dot"
                style={{
                  background: isTracking ? "#10b981" : "#f59e0b",
                  width: 8,
                  height: 8,
                }}
              />
              {isTracking ? "Tracking Active" : "Paused"}
              <span
                style={{
                  fontFamily: "monospace",
                  marginLeft: 6,
                  color: "#64748b",
                  fontSize: 11,
                }}
              >
                {sessionTimer}
              </span>
            </div>
            <button
              className="quiet icon-btn"
              title="Quick Settings"
              aria-label="Preferences"
              onClick={() => setPage("Settings")}
            >
              <Settings size={15} />
            </button>
            <button
              className="quiet icon-btn"
              title="Log out"
              onClick={() => {
                const u = { ...user, loggedIn: false };
                saveUser(u);
                setUser(u);
              }}
            >
              <LogOut size={15} />
            </button>
            {extension && (
              <button
                className="quiet icon-btn"
                title="Pop out"
                onClick={() =>
                  chrome.tabs.create({
                    url: chrome.runtime.getURL("dashboard.html"),
                  })
                }
              >
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
              {error && (
                <div role="alert" className="error">
                  {error}
                </div>
              )}
              {notice && (
                <div role="status" className="banner">
                  {notice}
                  <button
                    className="quiet"
                    onClick={() => setNotice("")}
                    aria-label="Dismiss"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* ── 0. SCENIC NEW TAB / HOME PAGE ── */}
              {page === "Home" && (
                <div className="scenic-home-container">
                  {/* Top-Left Clock & Greeting */}
                  <div className="scenic-top-widget">
                    <div className="scenic-clock">
                      {new Date(now).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="scenic-date">
                      {new Date(now).toLocaleDateString([], {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div className="scenic-greeting">
                      ☀️ Good{" "}
                      {(() => {
                        const h = new Date(now).getHours();
                        return h < 12
                          ? "morning"
                          : h < 17
                            ? "afternoon"
                            : "evening";
                      })()}
                      , {user.name}!
                    </div>
                    <div className="scenic-quote">
                      "Small steps today, bigger progress tomorrow."
                    </div>
                  </div>

                  {/* Center Google Search Bar & Quick Shortcuts */}
                  <div className="scenic-center-search">
                    <form
                      className="scenic-search-bar"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const input = form.elements.namedItem(
                          "search",
                        ) as HTMLInputElement;
                        const val = input.value.trim();
                        if (!val) return;
                        if (
                          val.startsWith("http://") ||
                          val.startsWith("https://")
                        ) {
                          window.open(val, "_blank");
                        } else if (val.includes(".") && !val.includes(" ")) {
                          window.open(`https://${val}`, "_blank");
                        } else {
                          window.open(
                            `https://www.google.com/search?q=${encodeURIComponent(val)}`,
                            "_blank",
                          );
                        }
                        input.value = "";
                      }}
                    >
                      <Search size={18} color="#64748b" />
                      <input
                        name="search"
                        type="text"
                        placeholder="Search Google or type a URL"
                      />
                    </form>

                    <div className="scenic-shortcuts">
                      {[
                        {
                          name: "GitHub",
                          url: "https://github.com",
                          icon: "https://github.githubassets.com/favicons/favicon.svg",
                        },
                        {
                          name: "Docs",
                          url: "https://docs.google.com",
                          icon: "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico",
                        },
                        {
                          name: "YouTube",
                          url: "https://youtube.com",
                          icon: "https://www.youtube.com/s/desktop/f2ea1298/img/favicon_32x32.png",
                        },
                        {
                          name: "Notion",
                          url: "https://notion.so",
                          icon: "https://www.notion.so/images/favicon.ico",
                        },
                      ].map((s) => (
                        <a
                          key={s.name}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="scenic-shortcut-item"
                        >
                          <div className="scenic-shortcut-icon">
                            <img
                              src={s.icon}
                              alt={s.name}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                          <span className="scenic-shortcut-title">
                            {s.name}
                          </span>
                        </a>
                      ))}
                      <div
                        className="scenic-shortcut-item"
                        onClick={() => {
                          const url = prompt("Enter URL to add shortcut:");
                          if (url)
                            window.open(
                              url.startsWith("http") ? url : `https://${url}`,
                              "_blank",
                            );
                        }}
                      >
                        <div
                          className="scenic-shortcut-icon"
                          style={{ borderStyle: "dashed" }}
                        >
                          <Plus size={18} color="#94a3b8" />
                        </div>
                        <span className="scenic-shortcut-title">Add</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Today's Focus Card & Floating Dock */}
                  <div className="scenic-bottom-row">
                    <div className="scenic-focus-card">
                      <div className="scenic-focus-header">Today's Focus</div>
                      <div className="scenic-focus-body">
                        <div className="scenic-gauge-wrap">
                          <svg
                            className="scenic-gauge-circle"
                            viewBox="0 0 100 100"
                          >
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke="rgba(255, 255, 255, 0.1)"
                              strokeWidth="8"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke="url(#focusGradient)"
                              strokeWidth="8"
                              strokeDasharray={251.3}
                              strokeDashoffset={
                                251.3 -
                                (251.3 *
                                  (hasFocusData ? hudScore : (m.score ?? 82))) /
                                  100
                              }
                              strokeLinecap="round"
                            />
                            <defs>
                              <linearGradient
                                id="focusGradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#38bdf8" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="scenic-gauge-score">
                            <strong>
                              {hasFocusData ? hudScore : (m.score ?? 82)}
                            </strong>
                            <small>/100</small>
                          </div>
                        </div>

                        <div className="scenic-breakdown-list">
                          <div className="scenic-breakdown-row">
                            <div className="scenic-breakdown-label">
                              <span className="scenic-dot productive"></span>
                              <span>Productive</span>
                            </div>
                            <span className="scenic-breakdown-val">
                              {duration(
                                hudProductiveMs || m.productiveTime || 15120000,
                              )}
                            </span>
                          </div>
                          <div className="scenic-breakdown-row">
                            <div className="scenic-breakdown-label">
                              <span className="scenic-dot unproductive"></span>
                              <span>Unproductive</span>
                            </div>
                            <span className="scenic-breakdown-val">
                              {duration(
                                hudDistractingMs ||
                                  m.unproductiveTime ||
                                  2280000,
                              )}
                            </span>
                          </div>
                          <div className="scenic-breakdown-row">
                            <div className="scenic-breakdown-label">
                              <span className="scenic-dot idle"></span>
                              <span>Idle</span>
                            </div>
                            <span className="scenic-breakdown-val">
                              {duration(m.idleTime || 2640000)}
                            </span>
                          </div>
                          <div className="scenic-breakdown-row">
                            <div className="scenic-breakdown-label">
                              <span className="scenic-dot remaining"></span>
                              <span>Remaining</span>
                            </div>
                            <span className="scenic-breakdown-val">
                              {duration(
                                Math.max(
                                  0,
                                  8 * 3600000 -
                                    (hudProductiveMs ||
                                      m.productiveTime ||
                                      15120000) -
                                    (hudDistractingMs ||
                                      m.unproductiveTime ||
                                      2280000),
                                ),
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Floating Navigation Dock */}
                    <div className="scenic-dock">
                      {[
                        { id: "Home", label: "Home", icon: Home },
                        {
                          id: "Analytics",
                          label: "Analytics",
                          icon: BarChart2,
                        },
                        {
                          id: "Workstreams",
                          label: "Workstreams",
                          icon: Layers,
                        },
                        {
                          id: "Audio Classification",
                          label: "Audio",
                          icon: Volume2,
                        },
                        {
                          id: "Context resume",
                          label: "Resume",
                          icon: Bookmark,
                        },
                        {
                          id: "Productive Sites",
                          label: "Sites",
                          icon: ShieldCheck,
                        },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          className={`scenic-dock-btn ${page === tab.id ? "active" : ""}`}
                          onClick={() => setPage(tab.id)}
                        >
                          {React.createElement(tab.icon, { size: 16 })}
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── OVERVIEW PAGE ─────────────────────────────────────────── */}
              {page === "Overview" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div className="section-top">
                    <h2 style={{ color: "#e2e8f0" }}>
                      Your attention, at a glance
                    </h2>
                    <select
                      aria-label="Time range"
                      value={range}
                      onChange={(e) => setRange(e.target.value)}
                      style={{
                        background: "#1a1d2e",
                        border: "1px solid #252836",
                        color: "#e2e8f0",
                        borderRadius: 6,
                        padding: "4px 8px",
                      }}
                    >
                      <option value="today">Today</option>
                      <option value="week">Last 7 days</option>
                    </select>
                  </div>

                  {/* KPI Cards: Pure Tab Switches, Focus Score, Active Coverage & Net Productive */}
                  <div className="stats">
                    <div className="stat">
                      <span>
                        Focus score <Activity size={17} />
                      </span>
                      <strong>
                        {m.score ?? "—"}
                        <small>/100</small>
                      </strong>
                      <p>100 × Productive / (Prod + Distract)</p>
                    </div>
                    <div className="stat">
                      <span>
                        Active coverage <ShieldCheck size={17} />
                      </span>
                      <strong>
                        {m.activeCoverage ?? 100}
                        <small>%</small>
                      </strong>
                      <p>Active browsing vs {duration(m.idleTime)} idle</p>
                    </div>
                    <div className="stat">
                      <span>
                        Context switches <Layers size={17} />
                      </span>
                      <strong>{m.switches}</strong>
                      <p>Pure tab switches between distinct web pages</p>
                    </div>
                    <div className="stat">
                      <span>
                        Net productive <Clock size={17} />
                      </span>
                      <strong>
                        {m.netProductiveTime !== undefined &&
                        m.netProductiveTime < 0
                          ? "-"
                          : "+"}
                        {duration(Math.abs(m.netProductiveTime ?? 0))}
                      </strong>
                      <p>Productive time − Unproductive time</p>
                    </div>
                  </div>

                  {/* Productivity & Focus Balance Card */}
                  <section className="productivity-balance-card">
                    <div className="balance-header">
                      <div>
                        <span
                          className="eyebrow"
                          style={{
                            color: "#6366f1",
                            fontSize: 10,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                          }}
                        >
                          FOCUS SCORE BREAKDOWN
                        </span>
                        <h3 style={{ margin: "4px 0 0", color: "#e2e8f0" }}>
                          Productive vs Unproductive Time
                        </h3>
                      </div>
                      <span className="model-badge">
                        <ShieldCheck size={12} /> Live Engine
                      </span>
                    </div>

                    {/* Progress Meter Bar */}
                    <div className="balance-meter">
                      <div
                        className="meter-fill-prod"
                        style={{
                          width: `${m.total > 0 ? (m.productiveTime / m.total) * 100 : 50}%`,
                        }}
                        title={`Productive: ${duration(m.productiveTime)}`}
                      />
                      <div
                        className="meter-fill-unprod"
                        style={{
                          width: `${m.total > 0 ? (m.unproductiveTime / m.total) * 100 : 20}%`,
                        }}
                        title={`Unproductive: ${duration(m.unproductiveTime)}`}
                      />
                      <div
                        className="meter-fill-neutral"
                        style={{
                          width: `${m.total > 0 ? (m.neutralTime / m.total) * 100 : 30}%`,
                        }}
                        title={`Neutral: ${duration(m.neutralTime)}`}
                      />
                    </div>

                    <div
                      className="balance-legend"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 12,
                        marginTop: 4,
                      }}
                    >
                      <div className="balance-legend-item">
                        <span>
                          <i style={{ background: "#10b981" }} /> Productive
                        </span>
                        <b>{duration(m.productiveTime)}</b>
                      </div>
                      <div className="balance-legend-item">
                        <span>
                          <i style={{ background: "#ef4444" }} /> Unproductive
                        </span>
                        <b>{duration(m.unproductiveTime)}</b>
                      </div>
                      <div className="balance-legend-item">
                        <span>
                          <i style={{ background: "#94a3b8" }} /> Neutral /
                          Other
                        </span>
                        <b>{duration(m.neutralTime)}</b>
                      </div>
                    </div>
                  </section>

                  {/* Live Overview Cards */}
                  <div className="overview-live">
                    {/* CURRENT ACTIVITY */}
                    <section className="card current-activity-card">
                      <div className="card-label">CURRENT ACTIVITY</div>
                      <div className="ca-row">
                        <div className="ca-left">
                          <Globe
                            size={20}
                            style={{
                              color: isUntrackable ? "#64748b" : "#3b82f6",
                              flexShrink: 0,
                              marginTop: 2,
                            }}
                          />
                          <div>
                            <div
                              className="domain-name"
                              style={{
                                color: isUntrackable ? "#94a3b8" : "#3b82f6",
                              }}
                            >
                              {ct.domain ||
                                (isUntrackable
                                  ? "Restricted Browser Page"
                                  : "—")}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#64748b",
                                marginTop: 2,
                              }}
                            >
                              {ct.title ||
                                (isUntrackable
                                  ? "Tracking unavailable on internal browser page (chrome://, edge://, about:). Atentiv will resume automatically on a supported webpage."
                                  : "No active tab tracked yet")}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                marginTop: 8,
                                flexWrap: "wrap",
                              }}
                            >
                              {ct.category && (
                                <span className="tag tag-tech">
                                  {ct.category}
                                </span>
                              )}
                              {ct.activity && (
                                <span className="tag tag-coding">
                                  {ct.activity}
                                </span>
                              )}
                              {ct.productivity && (
                                <span
                                  className={`tag ${
                                    ct.productivity === "productive"
                                      ? "tag-productive"
                                      : ct.productivity === "distracting"
                                        ? "tag-distracting"
                                        : "tag-neutral"
                                  }`}
                                >
                                  {ct.productivity}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="ca-right">
                          <div className="dwell-time">
                            {ct.activeDwellTime
                              ? duration(ct.activeDwellTime)
                              : "—"}
                          </div>
                          {isUntrackable ? (
                            <div
                              className="active-indicator"
                              style={{ color: "#94a3b8" }}
                            >
                              <span
                                className="tracking-dot"
                                style={{
                                  width: 7,
                                  height: 7,
                                  background: "#64748b",
                                }}
                              />
                              Untrackable page
                            </div>
                          ) : isTracking ? (
                            <div className="active-indicator">
                              <span
                                className="tracking-dot"
                                style={{
                                  width: 7,
                                  height: 7,
                                  background: "#10b981",
                                }}
                              />
                              Active in current tab
                            </div>
                          ) : isIdle ? (
                            <div
                              className="active-indicator"
                              style={{ color: "#f59e0b" }}
                            >
                              <span
                                className="tracking-dot"
                                style={{
                                  width: 7,
                                  height: 7,
                                  background: "#f59e0b",
                                }}
                              />
                              Paused — inactive
                            </div>
                          ) : (
                            <div
                              className="active-indicator"
                              style={{ color: "#64748b" }}
                            >
                              <span
                                className="tracking-dot"
                                style={{
                                  width: 7,
                                  height: 7,
                                  background: "#64748b",
                                }}
                              />
                              Tracking paused
                            </div>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* LIVE BACKGROUND AUDIO INTELLIGENCE */}
                    {hud.latestAudioSession &&
                      hud.latestAudioSession.isAudible && (
                        <section
                          className="card current-activity-card"
                          style={{
                            borderLeft: hud.latestAudioSession.isDistracting
                              ? "4px solid #ef4444"
                              : "4px solid #8b5cf6",
                            marginTop: 12,
                          }}
                        >
                          <div
                            className="card-label"
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span>BACKGROUND AUDIO STREAM</span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: hud.latestAudioSession.isDistracting
                                  ? "#f87171"
                                  : "#34d399",
                              }}
                            >
                              {hud.latestAudioSession.isDistracting
                                ? "⚠️ Distracting Media"
                                : "Focus Aid"}
                            </span>
                          </div>
                          <div className="ca-row">
                            <div className="ca-left">
                              <Radio
                                size={20}
                                style={{
                                  color: hud.latestAudioSession.isDistracting
                                    ? "#f87171"
                                    : "#8b5cf6",
                                  flexShrink: 0,
                                  marginTop: 2,
                                }}
                              />
                              <div>
                                <div
                                  className="domain-name"
                                  style={{
                                    color: hud.latestAudioSession.isDistracting
                                      ? "#f87171"
                                      : "#a78bfa",
                                  }}
                                >
                                  {hud.latestAudioSession.platform} Audio Stream
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "#f1f5f9",
                                    marginTop: 2,
                                    fontWeight: 500,
                                  }}
                                >
                                  {hud.latestAudioSession.title}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 6,
                                    marginTop: 8,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <span className="tag tag-tech">
                                    ML: {hud.latestAudioSession.category}
                                  </span>
                                  <span
                                    className={`tag ${
                                      hud.latestAudioSession.isDistracting
                                        ? "tag-distracting"
                                        : "tag-productive"
                                    }`}
                                  >
                                    Distraction Score:{" "}
                                    {hud.latestAudioSession.distractionScore}
                                    /100
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>
                      )}

                    {/* TODAY AT A GLANCE */}
                    <section className="card glance-section">
                      <div className="glance-header">
                        <div className="card-label">TODAY AT A GLANCE</div>
                        <div
                          className="glance-focus-ring"
                          title={
                            hasFocusData
                              ? `Focus Score: ${hudScore}/100`
                              : "Focus score unavailable: no tracked browsing dwell time recorded yet."
                          }
                        >
                          <div
                            style={{
                              fontSize: 9,
                              color: "#475569",
                              textAlign: "center",
                              marginBottom: 4,
                              letterSpacing: 1,
                            }}
                          >
                            FOCUS SCORE
                          </div>
                          <FocusRing
                            score={hasFocusData ? hudScore : 0}
                            label={hasFocusData ? undefined : "—"}
                            size={80}
                            stroke={6}
                          />
                        </div>
                      </div>
                      <div className="glance-metrics">
                        <div className="glance-metric">
                          <div className="metric-value productive">
                            {duration(hudProductiveMs)}
                          </div>
                          <div className="metric-label">PRODUCTIVE</div>
                          <div className="metric-pct">
                            {pct(hudProductiveMs)}%
                          </div>
                        </div>
                        <div className="glance-metric">
                          <div className="metric-value neutral">
                            {duration(hudNeutralMs)}
                          </div>
                          <div className="metric-label">NEUTRAL</div>
                          <div className="metric-pct">{pct(hudNeutralMs)}%</div>
                        </div>
                        <div className="glance-metric">
                          <div className="metric-value distracting">
                            {duration(hudDistractingMs)}
                          </div>
                          <div className="metric-label">DISTRACTING</div>
                          <div className="metric-pct">
                            {pct(hudDistractingMs)}%
                          </div>
                        </div>
                        <div className="glance-metric">
                          <div className="metric-value switches">
                            {hudSwitches}
                          </div>
                          <div className="metric-label">CONTEXT SWITCHES</div>
                          <div className="metric-pct">today</div>
                        </div>
                      </div>
                    </section>

                    {/* LIVE BACKGROUND AUDIO INTELLIGENCE */}
                    {hud.latestAudioSession &&
                      hud.latestAudioSession.isAudible && (
                        <section
                          className="card current-activity-card"
                          style={{
                            borderLeft: hud.latestAudioSession.isDistracting
                              ? "4px solid #ef4444"
                              : "4px solid #8b5cf6",
                            marginTop: 12,
                          }}
                        >
                          <div
                            className="card-label"
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span>BACKGROUND AUDIO STREAM</span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: hud.latestAudioSession.isDistracting
                                  ? "#f87171"
                                  : "#34d399",
                              }}
                            >
                              {hud.latestAudioSession.isDistracting
                                ? "⚠️ Distracting Media"
                                : "Focus Aid"}
                            </span>
                          </div>
                          <div className="ca-row">
                            <div className="ca-left">
                              <Radio
                                size={20}
                                style={{
                                  color: hud.latestAudioSession.isDistracting
                                    ? "#f87171"
                                    : "#8b5cf6",
                                  flexShrink: 0,
                                  marginTop: 2,
                                }}
                              />
                              <div>
                                <div
                                  className="domain-name"
                                  style={{
                                    color: hud.latestAudioSession.isDistracting
                                      ? "#f87171"
                                      : "#a78bfa",
                                  }}
                                >
                                  {hud.latestAudioSession.platform} Audio Stream
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "#f1f5f9",
                                    marginTop: 2,
                                    fontWeight: 500,
                                  }}
                                >
                                  {hud.latestAudioSession.title}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 6,
                                    marginTop: 8,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <span className="tag tag-tech">
                                    ML: {hud.latestAudioSession.category}
                                  </span>
                                  <span
                                    className={`tag ${
                                      hud.latestAudioSession.isDistracting
                                        ? "tag-distracting"
                                        : "tag-productive"
                                    }`}
                                  >
                                    Distraction Score:{" "}
                                    {hud.latestAudioSession.distractionScore}
                                    /100
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>
                      )}

                    {/* WORKSTREAMS LIVE */}
                    <section className="card workstreams-section">
                      <div className="ws-header">
                        <div className="card-label">WORKSTREAMS LIVE</div>
                        <button
                          className="ws-view-all"
                          onClick={() => setPage("Workstreams")}
                        >
                          View all →
                        </button>
                      </div>
                      {hudWorkstreams.length === 0 &&
                        state.streams.length === 0 && (
                          <div
                            style={{
                              color: "#475569",
                              fontSize: 12,
                              padding: "8px 0",
                            }}
                          >
                            No active workstreams yet.
                          </div>
                        )}
                      {(hudWorkstreams.length > 0
                        ? hudWorkstreams
                        : state.streams.slice(0, 5)
                      ).map((ws: any, i: number) => (
                        <div
                          className="ws-row"
                          key={ws.workstream_id || ws.id || i}
                        >
                          <Layers
                            size={13}
                            style={{ color: "#475569", flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 13,
                                color: "#e2e8f0",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {ws.name}
                            </div>
                            {ws.category && (
                              <div style={{ fontSize: 10, color: "#475569" }}>
                                {ws.category}
                              </div>
                            )}
                          </div>
                          <span className="ws-time">
                            {ws.total_active_seconds
                              ? duration(ws.total_active_seconds * 1000)
                              : "0s"}
                          </span>
                        </div>
                      ))}
                    </section>

                    {/* RECENT ACTIVITY */}
                    <section className="card workstreams-section">
                      <div className="ws-header">
                        <div className="card-label">RECENT ACTIVITY</div>
                        <button
                          className="ws-view-all"
                          onClick={() => setPage("Analytics")}
                        >
                          See all →
                        </button>
                      </div>
                      {hudRecentTabs.length === 0 && rows.length === 0 && (
                        <div
                          style={{
                            color: "#475569",
                            fontSize: 12,
                            padding: "8px 0",
                          }}
                        >
                          No activity recorded yet.
                        </div>
                      )}
                      {(hudRecentTabs.length > 0
                        ? hudRecentTabs.slice(0, 6)
                        : rows.slice(0, 6).map((v: any) => {
                            let dom = "";
                            try {
                              dom = new URL(v.url).hostname.replace(
                                /^www\./,
                                "",
                              );
                            } catch {
                              dom = v.url;
                            }
                            return {
                              domain: dom,
                              title: v.title,
                              productivity:
                                (v as any).productivity || "neutral",
                              category: (v as any).category || "",
                              dwellTime: v.end - v.start,
                            };
                          })
                      ).map((t: any, i: number) => (
                        <div className="ws-row" key={i}>
                          <Globe
                            size={13}
                            style={{ color: "#475569", flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 13,
                                color: "#e2e8f0",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {t.domain || t.title}
                            </div>
                            {t.category && (
                              <div style={{ fontSize: 10, color: "#475569" }}>
                                {t.category}
                              </div>
                            )}
                          </div>
                          <span
                            className={`tag ${
                              t.productivity === "productive"
                                ? "tag-productive"
                                : t.productivity === "distracting"
                                  ? "tag-distracting"
                                  : "tag-neutral"
                            }`}
                            style={{ fontSize: 10, marginRight: 8 }}
                          >
                            {t.productivity || "neutral"}
                          </span>
                          <span className="ws-time">
                            {t.dwellTime ? duration(t.dwellTime) : ""}
                          </span>
                        </div>
                      ))}
                    </section>
                  </div>
                </div>
              )}

              {/* ── LIVE VIEW PAGE ─────────────────────────────────────────── */}
              {page === "Live View" && (
                <div className="overview-live">
                  {/* CURRENT ACTIVITY */}
                  <section className="card current-activity-card">
                    <div className="card-label">CURRENT ACTIVITY</div>
                    <div className="ca-row">
                      <div className="ca-left">
                        <Globe
                          size={20}
                          style={{
                            color: isUntrackable ? "#64748b" : "#3b82f6",
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        />
                        <div>
                          <div
                            className="domain-name"
                            style={{
                              color: isUntrackable ? "#94a3b8" : "#3b82f6",
                            }}
                          >
                            {ct.domain ||
                              (isUntrackable ? "Restricted Browser Page" : "—")}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#64748b",
                              marginTop: 2,
                            }}
                          >
                            {ct.title ||
                              (isUntrackable
                                ? "Tracking unavailable on internal browser page (chrome://, edge://, about:). Atentiv will resume automatically on a supported webpage."
                                : "No active tab tracked yet")}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              marginTop: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            {ct.category && (
                              <span className="tag tag-tech">
                                {ct.category}
                              </span>
                            )}
                            {ct.activity && (
                              <span className="tag tag-coding">
                                {ct.activity}
                              </span>
                            )}
                            {ct.productivity && (
                              <span
                                className={`tag ${
                                  ct.productivity === "productive"
                                    ? "tag-productive"
                                    : ct.productivity === "distracting"
                                      ? "tag-distracting"
                                      : "tag-neutral"
                                }`}
                              >
                                {ct.productivity}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ca-right">
                        <div className="dwell-time">
                          {ct.activeDwellTime
                            ? duration(ct.activeDwellTime)
                            : "—"}
                        </div>
                        {isUntrackable ? (
                          <div
                            className="active-indicator"
                            style={{ color: "#94a3b8" }}
                          >
                            <span
                              className="tracking-dot"
                              style={{
                                width: 7,
                                height: 7,
                                background: "#64748b",
                              }}
                            />
                            Untrackable page
                          </div>
                        ) : isTracking ? (
                          <div className="active-indicator">
                            <span
                              className="tracking-dot"
                              style={{
                                width: 7,
                                height: 7,
                                background: "#10b981",
                              }}
                            />
                            Active in current tab
                          </div>
                        ) : isIdle ? (
                          <div
                            className="active-indicator"
                            style={{ color: "#f59e0b" }}
                          >
                            <span
                              className="tracking-dot"
                              style={{
                                width: 7,
                                height: 7,
                                background: "#f59e0b",
                              }}
                            />
                            Paused — inactive
                          </div>
                        ) : (
                          <div
                            className="active-indicator"
                            style={{ color: "#64748b" }}
                          >
                            <span
                              className="tracking-dot"
                              style={{
                                width: 7,
                                height: 7,
                                background: "#64748b",
                              }}
                            />
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
                      <div
                        className="glance-focus-ring"
                        title={
                          hasFocusData
                            ? `Focus Score: ${hudScore}/100`
                            : "Focus score unavailable: no tracked browsing dwell time recorded yet."
                        }
                      >
                        <div
                          style={{
                            fontSize: 9,
                            color: "#475569",
                            textAlign: "center",
                            marginBottom: 4,
                            letterSpacing: 1,
                          }}
                        >
                          FOCUS SCORE
                        </div>
                        <FocusRing
                          score={hasFocusData ? hudScore : 0}
                          label={hasFocusData ? undefined : "—"}
                          size={80}
                          stroke={6}
                        />
                      </div>
                    </div>
                    <div className="glance-metrics">
                      <div className="glance-metric">
                        <div className="metric-value productive">
                          {duration(hudProductiveMs)}
                        </div>
                        <div className="metric-label">PRODUCTIVE</div>
                        <div className="metric-pct">
                          {pct(hudProductiveMs)}%
                        </div>
                      </div>
                      <div className="glance-metric">
                        <div className="metric-value neutral">
                          {duration(hudNeutralMs)}
                        </div>
                        <div className="metric-label">NEUTRAL</div>
                        <div className="metric-pct">{pct(hudNeutralMs)}%</div>
                      </div>
                      <div className="glance-metric">
                        <div className="metric-value distracting">
                          {duration(hudDistractingMs)}
                        </div>
                        <div className="metric-label">DISTRACTING</div>
                        <div className="metric-pct">
                          {pct(hudDistractingMs)}%
                        </div>
                      </div>
                      <div className="glance-metric">
                        <div className="metric-value switches">
                          {hudSwitches}
                        </div>
                        <div className="metric-label">CONTEXT SWITCHES</div>
                        <div className="metric-pct">today</div>
                      </div>
                    </div>
                  </section>

                  {/* WORKSTREAMS LIVE */}
                  <section className="card workstreams-section">
                    <div className="ws-header">
                      <div className="card-label">WORKSTREAMS LIVE</div>
                      <button
                        className="ws-view-all"
                        onClick={() => setPage("Workstreams")}
                      >
                        View all →
                      </button>
                    </div>
                    {hudWorkstreams.length === 0 &&
                      state.streams.length === 0 && (
                        <div
                          style={{
                            color: "#475569",
                            fontSize: 12,
                            padding: "8px 0",
                          }}
                        >
                          No active workstreams yet.
                        </div>
                      )}
                    {(hudWorkstreams.length > 0
                      ? hudWorkstreams
                      : state.streams.slice(0, 5)
                    ).map((ws: any, i: number) => (
                      <div
                        className="ws-row"
                        key={ws.workstream_id || ws.id || i}
                      >
                        <Layers
                          size={13}
                          style={{ color: "#475569", flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#e2e8f0",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {ws.name}
                          </div>
                          {ws.category && (
                            <div style={{ fontSize: 10, color: "#475569" }}>
                              {ws.category}
                            </div>
                          )}
                        </div>
                        <span className="ws-time">
                          {ws.total_active_seconds
                            ? duration(ws.total_active_seconds * 1000)
                            : "0s"}
                        </span>
                      </div>
                    ))}
                  </section>

                  {/* RECENT ACTIVITY */}
                  <section className="card workstreams-section">
                    <div className="ws-header">
                      <div className="card-label">RECENT ACTIVITY</div>
                      <button
                        className="ws-view-all"
                        onClick={() => setPage("Analytics")}
                      >
                        See all →
                      </button>
                    </div>
                    {hudRecentTabs.length === 0 && rows.length === 0 && (
                      <div
                        style={{
                          color: "#475569",
                          fontSize: 12,
                          padding: "8px 0",
                        }}
                      >
                        No activity recorded yet.
                      </div>
                    )}
                    {(hudRecentTabs.length > 0
                      ? hudRecentTabs.slice(0, 6)
                      : rows.slice(0, 6).map((v: any) => {
                          let dom = "";
                          try {
                            dom = new URL(v.url).hostname.replace(/^www\./, "");
                          } catch {
                            dom = v.url;
                          }
                          return {
                            domain: dom,
                            title: v.title,
                            productivity: (v as any).productivity || "neutral",
                            category: (v as any).category || "",
                            dwellTime: v.end - v.start,
                          };
                        })
                    ).map((t: any, i: number) => (
                      <div className="ws-row" key={i}>
                        <Globe
                          size={13}
                          style={{ color: "#475569", flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#e2e8f0",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {t.domain || t.title}
                          </div>
                          {t.category && (
                            <div style={{ fontSize: 10, color: "#475569" }}>
                              {t.category}
                            </div>
                          )}
                        </div>
                        <span
                          className={`tag ${
                            t.productivity === "productive"
                              ? "tag-productive"
                              : t.productivity === "distracting"
                                ? "tag-distracting"
                                : "tag-neutral"
                          }`}
                          style={{ fontSize: 10, marginRight: 8 }}
                        >
                          {t.productivity || "neutral"}
                        </span>
                        <span className="ws-time">
                          {t.dwellTime ? duration(t.dwellTime) : ""}
                        </span>
                      </div>
                    ))}
                  </section>
                </div>
              )}

              {/* ── ANALYTICS PAGE ─────────────────────────────────────────── */}
              {page === "Analytics" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div className="section-top">
                    <h2 style={{ color: "#e2e8f0" }}>
                      Behavioral & Multitasking Graphs
                    </h2>
                    <select
                      aria-label="Time range"
                      value={range}
                      onChange={(e) => setRange(e.target.value)}
                      style={{
                        background: "#1a1d2e",
                        border: "1px solid #252836",
                        color: "#e2e8f0",
                        borderRadius: 6,
                        padding: "4px 8px",
                      }}
                    >
                      <option value="today">Today</option>
                      <option value="week">Last 7 days</option>
                    </select>
                  </div>

                  {/* Time distribution ring */}
                  <section className="card">
                    <div className="section-top">
                      <div>
                        <h2 style={{ color: "#e2e8f0" }}>
                          Where your time went
                        </h2>
                        <p>Visual time distribution across activities</p>
                      </div>
                      <div className="chart-toggle-group">
                        <button
                          className={`chart-toggle-btn ${analyticsPieMode === "workstream" ? "active" : ""}`}
                          onClick={() => setAnalyticsPieMode("workstream")}
                        >
                          By Workstream
                        </button>
                        <button
                          className={`chart-toggle-btn ${analyticsPieMode === "domain" ? "active" : ""}`}
                          onClick={() => setAnalyticsPieMode("domain")}
                        >
                          By Domain / Tab
                        </button>
                      </div>
                    </div>
                    <div className="distribution">
                      <div
                        className="ring"
                        style={{
                          background: m.total
                            ? `conic-gradient(${(() => {
                                let pos = 0;
                                if (analyticsPieMode === "workstream") {
                                  return state.streams
                                    .map((s) => {
                                      const a = pos;
                                      pos +=
                                        ((m.durations[s.id] || 0) / m.total) *
                                        100;
                                      return `${s.color} ${a}% ${pos}%`;
                                    })
                                    .join(",");
                                } else {
                                  const dc = [
                                    "#6366f1",
                                    "#10b981",
                                    "#f59e0b",
                                    "#ec4899",
                                    "#06b6d4",
                                    "#8b5cf6",
                                    "#64748b",
                                  ];
                                  return Object.entries(m.domainDurations)
                                    .slice(0, 7)
                                    .map(([_, dur], idx) => {
                                      const a = pos;
                                      pos += (dur / m.total) * 100;
                                      return `${dc[idx % dc.length]} ${a}% ${pos}%`;
                                    })
                                    .join(",");
                                }
                              })()})`
                            : "#1e293b",
                        }}
                      >
                        <div>
                          <strong>{duration(m.total)}</strong>
                          <small>total active time</small>
                        </div>
                      </div>
                      <div className="legend">
                        {analyticsPieMode === "workstream"
                          ? state.streams.map((s) => (
                              <div key={s.id}>
                                <span>
                                  <i style={{ background: s.color }} />
                                  {s.name}
                                </span>
                                <b>{duration(m.durations[s.id] || 0)}</b>
                              </div>
                            ))
                          : Object.entries(m.domainDurations)
                              .slice(0, 6)
                              .map(([dom, dur], idx) => {
                                const dc = [
                                  "#6366f1",
                                  "#10b981",
                                  "#f59e0b",
                                  "#ec4899",
                                  "#06b6d4",
                                  "#8b5cf6",
                                ];
                                return (
                                  <div key={dom}>
                                    <span>
                                      <i
                                        style={{
                                          background: dc[idx % dc.length],
                                        }}
                                      />
                                      {dom}
                                    </span>
                                    <b>{duration(dur)}</b>
                                  </div>
                                );
                              })}
                      </div>
                    </div>
                  </section>

                  {/* Context Switches bar chart */}
                  <section className="card">
                    <div className="section-top">
                      <div>
                        <h2 style={{ color: "#e2e8f0" }}>
                          Context Switches vs Time (Per Hour)
                        </h2>
                        <p>Frequency of tab switches across the day</p>
                      </div>
                      <span className="pill">{m.switches} Total Switches</span>
                    </div>
                    <div className="hourly-chart-container">
                      <div className="hourly-bars-grid">
                        {m.hourlySwitches.map((count, hour) => {
                          const maxSwitch = Math.max(1, ...m.hourlySwitches);
                          const heightPercent = Math.max(
                            6,
                            (count / maxSwitch) * 100,
                          );
                          return (
                            <div
                              className="hourly-bar-col"
                              key={hour}
                              title={`${hour}:00 - ${count} tab switches`}
                            >
                              <div
                                className={`hourly-bar-fill ${count > 4 ? "active-switches" : ""}`}
                                style={{ height: `${heightPercent}%` }}
                              />
                              <span className="hourly-bar-label">
                                {hour % 3 === 0 ? `${hour}h` : ""}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* FR-19 Context-Switch Penalty Reports */}
                    <div className="csp-report-container">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          Cognitive Switch Penalty (CSP) Report &middot; FR-19
                        </span>
                        <span style={{ fontSize: 10, color: "#64748b" }}>
                          Window: 10 min &middot; Threshold: &gt;6 switches
                        </span>
                      </div>

                      {penaltyClusters.length === 0 ? (
                        <div className="csp-optimal-card">
                          <Check
                            size={16}
                            style={{ color: "#10b981", flexShrink: 0 }}
                          />
                          <div>
                            <strong style={{ color: "#34d399" }}>
                              Optimal Cognitive Flow Maintained (&lt;6
                              switches/10m)
                            </strong>
                            <p
                              style={{
                                margin: "2px 0 0",
                                fontSize: 11,
                                color: "#a7f3d0",
                              }}
                            >
                              No excessive rapid tab thrashing detected.
                              Context-switch penalty is at nominal baseline.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          {penaltyClusters.map((c, idx) => (
                            <div
                              key={idx}
                              className={`csp-cluster-card ${c.severity}`}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                }}
                              >
                                <AlertTriangle
                                  size={16}
                                  style={{
                                    color:
                                      c.severity === "red"
                                        ? "#ef4444"
                                        : "#f59e0b",
                                    flexShrink: 0,
                                  }}
                                />
                                <div>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontWeight: 600,
                                        color: "#f1f5f9",
                                      }}
                                    >
                                      {new Date(c.startTime).toLocaleTimeString(
                                        [],
                                        { hour: "2-digit", minute: "2-digit" },
                                      )}{" "}
                                      –{" "}
                                      {new Date(c.endTime).toLocaleTimeString(
                                        [],
                                        { hour: "2-digit", minute: "2-digit" },
                                      )}
                                    </span>
                                    <span className={`csp-badge ${c.severity}`}>
                                      {c.severity === "red"
                                        ? "Severe Thrashing"
                                        : "Elevated Switching"}
                                    </span>
                                  </div>
                                  <p
                                    style={{
                                      margin: "2px 0 0",
                                      fontSize: 11,
                                      color: "#94a3b8",
                                    }}
                                  >
                                    {c.switches} tab switches in 10m &middot;
                                    Refocus burden: ~{c.costSeconds}s cognitive
                                    ramp-up
                                  </p>
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color:
                                      c.severity === "red"
                                        ? "#f87171"
                                        : "#fbbf24",
                                  }}
                                >
                                  CSP {c.cspPercent}%
                                </div>
                                <span
                                  style={{ fontSize: 10, color: "#64748b" }}
                                >
                                  Penalty index
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Sites Visited vs Time (Ascending Order) */}
                  <section className="card">
                    <div className="section-top">
                      <div>
                        <h2 style={{ color: "#e2e8f0" }}>
                          Sites Visited vs Time (Ascending Order)
                        </h2>
                        <p>
                          Breakdown of all domains grouped and ordered from
                          shortest to longest dwell duration
                        </p>
                      </div>
                      <span className="pill">
                        {m.domainTimeline.length} Domains
                      </span>
                    </div>

                    <div className="sites-ascending-list">
                      {m.domainTimeline.length === 0 ? (
                        <p style={{ color: "#94a3b8", fontSize: 12 }}>
                          No sites recorded yet for this period.
                        </p>
                      ) : (
                        m.domainTimeline.map((item) => {
                          const maxDur = Math.max(
                            1,
                            ...m.domainTimeline.map((d) => d.duration),
                          );
                          const barWidth = Math.max(
                            4,
                            (item.duration / maxDur) * 100,
                          );
                          return (
                            <div
                              className="site-ascending-row"
                              key={item.domain}
                            >
                              <div className="site-row-header">
                                <span className="site-row-title">
                                  <Globe
                                    size={13}
                                    style={{ color: "#6366f1" }}
                                  />
                                  {item.domain}
                                </span>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                  }}
                                >
                                  <span
                                    className={`productivity-tag ${item.productivity}`}
                                  >
                                    {item.productivity}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: "#e2e8f0",
                                    }}
                                  >
                                    {duration(item.duration)}
                                  </span>
                                </div>
                              </div>
                              <div className="site-row-bar-container">
                                <div
                                  className={`site-row-bar-fill ${item.productivity}`}
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </section>

                  {/* Activity trail */}
                  <section className="card activity">
                    <div className="section-top">
                      <div>
                        <h2 style={{ color: "#e2e8f0" }}>
                          Your activity trail
                        </h2>
                        <p>A record of context with explainable intelligence</p>
                      </div>
                      <button className="quiet" onClick={exportData}>
                        <Download size={16} /> Export
                      </button>
                    </div>
                    {!rows.length ? (
                      <div className="empty">
                        <Activity />
                        <h3>A fresh start.</h3>
                        <p>
                          Your activity will appear here after you enable
                          tracking.
                        </p>
                      </div>
                    ) : (
                      <div className="activity-list">
                        {rows.slice(0, 30).map((v) => {
                          let domain = "";
                          try {
                            domain = new URL(v.url).hostname.replace(
                              /^www\./,
                              "",
                            );
                          } catch {
                            domain = v.url;
                          }
                          const prodType =
                            (v as any).productivity || "productive";
                          const catName =
                            (v as any).category || stream(v.stream).name;
                          const actName =
                            (v as any).activity || "General Browsing";
                          return (
                            <div className="activity-item" key={v.id}>
                              <div className="activity-item-main">
                                <div className="page-cell">
                                  <span
                                    className="site-icon"
                                    style={{
                                      color: stream(v.stream).color,
                                      background: stream(v.stream).color + "18",
                                      borderColor:
                                        stream(v.stream).color + "30",
                                    }}
                                  >
                                    {domain
                                      .replace(/^www\./, "")[0]
                                      ?.toUpperCase() || "A"}
                                  </span>
                                  <div>
                                    <b>{v.title}</b>
                                    <small>{domain}</small>
                                  </div>
                                </div>
                                <span
                                  className="tag"
                                  style={{
                                    color: stream(v.stream).color,
                                    background: stream(v.stream).color + "16",
                                    fontWeight: 600,
                                  }}
                                >
                                  {stream(v.stream).name}
                                </span>
                              </div>
                              <div className="activity-item-sub">
                                <span className="activity-duration">
                                  {duration(Math.max(1000, v.end - v.start))}
                                </span>
                                <span className="table-action-btns">
                                  <button
                                    className="action-btn-sm"
                                    title="Inspect"
                                    onClick={() =>
                                      setSelectedTrace(
                                        displayTraces.find(
                                          (t) => t.session_id === v.id,
                                        ) || displayTraces[0],
                                      )
                                    }
                                  >
                                    <Sparkles size={11} /> Trace
                                  </button>
                                  <button
                                    className="action-btn-sm"
                                    title="Correct"
                                    onClick={() =>
                                      setFeedbackTarget({
                                        domain,
                                        currentCategory: catName,
                                        currentActivity: actName,
                                        currentProductivity:
                                          prodType as ProductivityType,
                                        sessionId: v.id,
                                      })
                                    }
                                  >
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
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <section className="card">
                    <h2 style={{ color: "#e2e8f0" }}>
                      Add Domain to Focus Classification
                    </h2>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        marginBottom: 14,
                      }}
                    >
                      Classify websites as productive or unproductive.
                    </p>
                    <div className="quick-presets">
                      {[
                        "geeksforgeeks.org",
                        "docs.google.com",
                        "wikipedia.org",
                        "canva.com",
                        "notion.so",
                      ].map((dom) => (
                        <button
                          key={dom}
                          type="button"
                          className="quick-preset-btn"
                          onClick={() => {
                            call({
                              type: "ADD_PRODUCTIVE_DOMAIN",
                              domain: dom,
                            });
                            setNotice(`Added ${dom} to Productive Sites.`);
                          }}
                        >
                          + {dom}
                        </button>
                      ))}
                    </div>
                    <form
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        alignItems: "center",
                        marginTop: 12,
                      }}
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newDomain.trim()) return;
                        if (newDomainType === "productive") {
                          call({
                            type: "ADD_PRODUCTIVE_DOMAIN",
                            domain: newDomain.trim(),
                          });
                          setNotice(
                            `Added ${newDomain.trim()} to Productive Sites.`,
                          );
                        } else {
                          call({
                            type: "ADD_UNPRODUCTIVE_DOMAIN",
                            domain: newDomain.trim(),
                          });
                          setNotice(
                            `Added ${newDomain.trim()} to Unproductive Sites.`,
                          );
                        }
                        setNewDomain("");
                      }}
                    >
                      <input
                        type="text"
                        required
                        style={{
                          flex: 1,
                          minWidth: 220,
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: "1px solid #252836",
                          background: "#0f1117",
                          color: "#e2e8f0",
                        }}
                        placeholder="e.g. geeksforgeeks.org or youtube.com"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                      />
                      <select
                        style={{
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: "1px solid #252836",
                          background: "#0f1117",
                          color: "#e2e8f0",
                        }}
                        value={newDomainType}
                        onChange={(e) =>
                          setNewDomainType(e.target.value as any)
                        }
                      >
                        <option value="productive">Productive (+ Focus)</option>
                        <option value="unproductive">
                          Unproductive (Distraction Alert)
                        </option>
                      </select>
                      <button type="submit" className="primary">
                        <Plus size={16} /> Add Domain
                      </button>
                    </form>
                  </section>
                  <div className="sites-manager-grid">
                    <div className="sites-column-card productive-col">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <h3 style={{ margin: 0, color: "#10b981" }}>
                            Productive Sites
                          </h3>
                          <small style={{ color: "#64748b" }}>
                            Boosts focus score
                          </small>
                        </div>
                        <span
                          className="pill"
                          style={{ background: "#064e3b22", color: "#10b981" }}
                        >
                          {state.productiveDomains.length} Active
                        </span>
                      </div>
                      <div className="sites-chip-list">
                        {state.productiveDomains.map((dom) => (
                          <span
                            className="site-domain-chip productive"
                            key={dom}
                          >
                            <Check size={12} />
                            {dom}
                            <button
                              className="btn-remove-chip"
                              onClick={() =>
                                call({
                                  type: "REMOVE_DOMAIN_OVERRIDE",
                                  domain: dom,
                                })
                              }
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="sites-column-card unproductive-col">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <h3 style={{ margin: 0, color: "#ef4444" }}>
                            Unproductive Sites
                          </h3>
                          <small style={{ color: "#64748b" }}>
                            Triggers distraction alert
                          </small>
                        </div>
                        <span
                          className="pill"
                          style={{ background: "#7f1d1d22", color: "#ef4444" }}
                        >
                          {state.unproductiveDomains.length} Monitored
                        </span>
                      </div>
                      <div className="sites-chip-list">
                        {state.unproductiveDomains.map((dom) => (
                          <span
                            className="site-domain-chip unproductive"
                            key={dom}
                          >
                            <AlertTriangle size={12} />
                            {dom}
                            <button
                              className="btn-remove-chip"
                              onClick={() =>
                                call({
                                  type: "REMOVE_DOMAIN_OVERRIDE",
                                  domain: dom,
                                })
                              }
                            >
                              &times;
                            </button>
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
                    workstreams={
                      activeWorkstreams.length > 0
                        ? activeWorkstreams
                        : state.streams.map((s) => ({
                            workstream_id: s.id,
                            name: s.name,
                            category: s.name.includes("Research")
                              ? "Education"
                              : s.name.includes("Design")
                                ? "Technology"
                                : "Chat",
                            created_at: Date.now() - 86400000,
                            updated_at: Date.now(),
                            first_seen: Date.now() - 86400000,
                            last_active: Date.now(),
                            total_active_seconds: Math.round(
                              state.visits
                                .filter((v) => v.stream === s.id)
                                .reduce((a, v) => a + (v.end - v.start), 0) /
                                1000,
                            ),
                            confidence: 0.94,
                            status: "active" as const,
                          }))
                    }
                    sessions={state.visits.map((v) => {
                      let dom = "";
                      try {
                        dom = new URL(v.url).hostname;
                      } catch {
                        dom = v.url;
                      }
                      return {
                        session_id: v.id,
                        workstream_id: v.stream,
                        domain: dom,
                        dwell_time: Math.max(1000, v.end - v.start),
                        title: v.title,
                        url: v.url,
                        activity_type:
                          (v as any).activity || "General Browsing",
                        category: (v as any).category || stream(v.stream).name,
                        productivity_type:
                          (v as any).productivity || "productive",
                      } as any;
                    })}
                    onOpenTab={(url) =>
                      extension && chrome.tabs.create({ url })
                    }
                  />
                  <section className="card" style={{ marginTop: 16 }}>
                    <div className="section-top">
                      <div>
                        <h2 style={{ color: "#e2e8f0" }}>Workstream rules</h2>
                        <p>
                          Rules connecting related pages into task clusters.
                        </p>
                      </div>
                      <button
                        className="primary"
                        onClick={() => {
                          setRules(structuredClone(state.streams));
                          setModal("rules");
                        }}
                      >
                        Edit rules
                      </button>
                    </div>
                  </section>
                </>
              )}

              {/* ── CONTEXT RESUME / SNAPSHOTS PAGE ───────────────────────── */}
              {(page === "Context resume" || page === "Snapshots") && (
                <div className="snapshots-container">
                  <div className="snapshots-topbar">
                    <div>
                      <h2 style={{ color: "#e2e8f0", margin: 0, fontSize: 18 }}>
                        Context Snapshots
                      </h2>
                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#64748b",
                          fontSize: 12,
                        }}
                      >
                        Save and restore workspaces, open tab collections, and
                        working context.
                      </p>
                    </div>
                    <button
                      className="primary"
                      onClick={() => openSnapshotModal()}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      <Plus size={16} /> Save current workspace
                    </button>
                  </div>

                  {state.snapshots.length > 0 ? (
                    <div className="snapshots-grid">
                      {state.snapshots.map((s) => (
                        <div className="snapshot-card" key={s.id}>
                          <div className="snapshot-header">
                            <div className="snapshot-title-group">
                              <h3 className="snapshot-title" title={s.name}>
                                {s.name}
                              </h3>
                              <span className="snapshot-date">
                                Saved{" "}
                                {new Date(s.created).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <span className="pill" style={{ flexShrink: 0 }}>
                              {s.tabs.length} tabs
                            </span>
                          </div>
                          {s.note && (
                            <div className="snapshot-note">{s.note}</div>
                          )}
                          <div className="snapshot-tabs-list">
                            {s.tabs.map((t, idx) => (
                              <div className="snapshot-tab-item" key={idx}>
                                <Globe size={13} />
                                <a
                                  href={t.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  title={t.title || t.url}
                                >
                                  {t.title || t.url}
                                </a>
                              </div>
                            ))}
                          </div>
                          <div className="snapshot-actions">
                            <button
                              className="secondary"
                              style={{ padding: "6px 10px", fontSize: 12 }}
                              onClick={() => openSnapshotModal(s)}
                            >
                              <Edit3 size={13} /> Update tabs
                            </button>
                            <div className="snapshot-actions-right">
                              <button
                                className="danger"
                                style={{ padding: "6px 10px", fontSize: 12 }}
                                onClick={() =>
                                  call({ type: "delete_snapshot", id: s.id })
                                }
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                              <button
                                className="primary"
                                style={{ padding: "6px 14px", fontSize: 12 }}
                                onClick={async () => {
                                  await call({ type: "restore", id: s.id });
                                  setNotice(`Restored workspace "${s.name}".`);
                                }}
                              >
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
                      <p>
                        Click "Save current workspace" to capture your open
                        tabs.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── DECISION TRACES PAGE ───────────────────────────────────── */}
              {page === "Decision traces" && (
                <section className="card">
                  <div className="section-top">
                    <div>
                      <h2 style={{ color: "#e2e8f0" }}>
                        Verify every classification.
                      </h2>
                      <p>
                        Every categorization is auditable and locally grounded.
                      </p>
                    </div>
                    <span className="pill">
                      {displayTraces.length} Recorded Traces
                    </span>
                  </div>
                  <div className="table">
                    <div className="tr th">
                      <span>TIMESTAMP</span>
                      <span>DOMAIN</span>
                      <span>CATEGORY</span>
                      <span>ACTIVITY</span>
                      <span>PRODUCTIVITY</span>
                      <span>LATENCY</span>
                      <span>ACTION</span>
                    </div>
                    {displayTraces.slice(0, 30).map((tr) => (
                      <div className="tr" key={tr.decision_id}>
                        <span>
                          {new Date(tr.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>
                          <b>{tr.domain_match?.domain || "web page"}</b>
                        </span>
                        <span>
                          <span className="trace-pill category-pill">
                            {tr.model_predictions[0]?.label || "Technology"} (
                            {Math.round(
                              (tr.model_predictions[0]?.score || 0.9) * 100,
                            )}
                            %)
                          </span>
                        </span>
                        <span>{tr.selected_activity}</span>
                        <span>
                          <span
                            className={`productivity-tag ${tr.selected_productivity}`}
                          >
                            {tr.selected_productivity}
                          </span>
                        </span>
                        <span>
                          <small>{tr.total_latency_ms} ms</small>
                        </span>
                        <span>
                          <button
                            className="action-btn-sm"
                            onClick={() => setSelectedTrace(tr)}
                          >
                            <Sparkles size={12} /> Inspect
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── AUDIO CLASSIFICATION & DISTRACTION PAGE ─────────────────── */}
              {(page === "Audio Classification" || page === "Audio") && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {/* Top Header */}
                  <div
                    className="section-top"
                    style={{
                      alignItems: "flex-start",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            color: "#e2e8f0",
                            margin: 0,
                            fontSize: 18,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Volume2 size={20} style={{ color: "#a78bfa" }} />
                          Audio Classification & Distraction Intelligence
                        </h2>
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: 12,
                            color: "#64748b",
                          }}
                        >
                          Decoupled concurrent background stream tracking with
                          local fastText WASM inference, platform detection, and
                          acoustic cognitive load scoring.
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span className="model-badge">
                          <ShieldCheck size={13} /> fastText WASM Active
                        </span>
                        <span
                          className="pill"
                          style={{
                            background:
                              activeAudioSessions.length > 0
                                ? "#065f46"
                                : "#1e293b",
                            color:
                              activeAudioSessions.length > 0
                                ? "#a7f3d0"
                                : "#94a3b8",
                          }}
                        >
                          <Radio size={12} /> {activeAudioSessions.length}{" "}
                          Audible Stream
                          {activeAudioSessions.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 1. Live Active Audio Streams */}
                  <section className="card settings">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <h2
                          style={{ color: "#e2e8f0", margin: 0, fontSize: 15 }}
                        >
                          Live Active Audio Streams in Browser
                        </h2>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 11,
                            color: "#64748b",
                          }}
                        >
                          Real-time telemetry from Chromium tabs with{" "}
                          <code>tab.audible === true</code>
                        </p>
                      </div>
                      <button
                        type="button"
                        className="secondary"
                        onClick={refreshAudioSessions}
                        style={{ fontSize: 11 }}
                      >
                        <RefreshCw size={12} /> Scan Tabs
                      </button>
                    </div>

                    {activeAudioSessions.length === 0 ? (
                      <div
                        style={{
                          background: "#090d16",
                          border: "1px dashed #1e293b",
                          borderRadius: 8,
                          padding: "24px 16px",
                          textAlign: "center",
                        }}
                      >
                        <Volume2
                          size={28}
                          style={{
                            color: "#475569",
                            display: "block",
                            margin: "0 auto 8px",
                          }}
                        />
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#cbd5e1",
                          }}
                        >
                          No Background Audio Stream Detected
                        </div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#64748b",
                            maxWidth: 460,
                            margin: "4px auto 14px",
                          }}
                        >
                          Play media in YouTube, Spotify, or any audio tab, or
                          trigger our synthetic Web Audio tone generator below
                          to simulate live audible playback.
                        </p>
                        <button
                          type="button"
                          className="primary"
                          onClick={() =>
                            startTone(
                              260,
                              "Spotify Lo-Fi Study Beats (Simulated Stream)",
                            )
                          }
                          style={{ fontSize: 11 }}
                        >
                          <Play size={13} /> Simulate Audible Tab Audio
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        {activeAudioSessions.map((session, idx) => (
                          <div
                            key={session.sessionId || idx}
                            style={{
                              background: "#090d16",
                              border: "1px solid #1e293b",
                              borderRadius: 10,
                              padding: "14px 16px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 12,
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 220 }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  marginBottom: 4,
                                }}
                              >
                                <span
                                  className="pill"
                                  style={{
                                    background: "#7c3aed22",
                                    color: "#c4b5fd",
                                    fontWeight: 600,
                                  }}
                                >
                                  🎵 {session.platform}
                                </span>
                                <span
                                  className="pill"
                                  style={{
                                    background: "#3b82f622",
                                    color: "#60a5fa",
                                  }}
                                >
                                  ML: {session.category}
                                </span>
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: "#10b981",
                                    fontWeight: 600,
                                  }}
                                >
                                  ● Audible Active
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "#f1f5f9",
                                }}
                              >
                                {session.title}
                              </div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "#64748b",
                                  marginTop: 2,
                                }}
                              >
                                {session.distractionReason}
                              </div>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                              }}
                            >
                              <div style={{ textAlign: "right" }}>
                                <div
                                  style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: session.isDistracting
                                      ? "#f43f5e"
                                      : "#10b981",
                                  }}
                                >
                                  {session.distractionScore}
                                  <small
                                    style={{
                                      fontSize: 11,
                                      color: "#64748b",
                                      fontWeight: 400,
                                    }}
                                  >
                                    /100
                                  </small>
                                </div>
                                <div style={{ fontSize: 10, color: "#94a3b8" }}>
                                  Distraction Score
                                </div>
                              </div>

                              <span
                                className={`badge ${
                                  session.isDistracting
                                    ? "b-distracting"
                                    : "b-productive"
                                }`}
                                style={{ padding: "6px 12px", fontSize: 11 }}
                              >
                                {session.isDistracting
                                  ? "⚠️ Distracting"
                                  : "Focus Aid"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* 2. Interactive Live Audio Classifier & Sandbox */}
                  <section className="card settings">
                    <h2
                      style={{
                        color: "#e2e8f0",
                        margin: "0 0 4px",
                        fontSize: 15,
                      }}
                    >
                      Interactive Audio Classifier & Distraction Sandbox
                    </h2>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        margin: "0 0 14px",
                      }}
                    >
                      Enter any media URL and title or pick a realistic scenario
                      below to run live FastText WebAssembly inference and
                      acoustic scoring.
                    </p>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleRunAudioClassification(
                          audioInputUrl,
                          audioInputTitle,
                        );
                      }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(280px, 1fr))",
                          gap: 10,
                        }}
                      >
                        <label
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            fontSize: 11,
                            color: "#94a3b8",
                          }}
                        >
                          Media Stream URL
                          <input
                            type="text"
                            required
                            value={audioInputUrl}
                            onChange={(e) => setAudioInputUrl(e.target.value)}
                            placeholder="e.g. https://open.spotify.com/track/... or https://youtube.com/watch?v=..."
                            style={{
                              background: "#0f1117",
                              border: "1px solid #252836",
                              color: "#e2e8f0",
                              borderRadius: 6,
                              padding: "8px 10px",
                              fontSize: 12,
                            }}
                          />
                        </label>

                        <label
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            fontSize: 11,
                            color: "#94a3b8",
                          }}
                        >
                          Stream Title / Video Name
                          <input
                            type="text"
                            required
                            value={audioInputTitle}
                            onChange={(e) => setAudioInputTitle(e.target.value)}
                            placeholder="e.g. Lofi Hip Hop Radio - Beats to Study to"
                            style={{
                              background: "#0f1117",
                              border: "1px solid #252836",
                              color: "#e2e8f0",
                              borderRadius: 6,
                              padding: "8px 10px",
                              fontSize: 12,
                            }}
                          />
                        </label>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 10,
                          marginTop: 4,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <button
                            type="submit"
                            className="primary"
                            disabled={isAudioClassifying}
                          >
                            <Sparkles size={14} />{" "}
                            {isAudioClassifying
                              ? "Classifying..."
                              : "Classify Audio Stream"}
                          </button>

                          {isPlayingTestTone ? (
                            <button
                              type="button"
                              className="danger"
                              onClick={stopTone}
                            >
                              <Pause size={14} /> Stop Audible Tone
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="secondary"
                              onClick={() =>
                                startTone(260, audioInputTitle || "Test Tone")
                              }
                            >
                              <Play size={14} /> Play Audible Tone
                            </button>
                          )}
                        </div>

                        {isPlayingTestTone && (
                          <span
                            className="pill"
                            style={{
                              background: "#065f46",
                              color: "#a7f3d0",
                              fontSize: 11,
                            }}
                          >
                            🔊 Tab is Audible ({testToneTitle})
                          </span>
                        )}
                      </div>
                    </form>

                    {/* Presets */}
                    <div style={{ marginTop: 16 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        Quick Interactive Scenarios
                      </div>
                      <div className="audio-preset-grid">
                        {[
                          {
                            icon: "🎓",
                            name: "MIT Deep Learning Lecture",
                            platform: "YouTube",
                            url: "https://youtube.com/watch?v=mit-6s191-lecture-deep-learning",
                            title:
                              "MIT 6.S191 Deep Learning & Neural Networks Lecture 1",
                            desc: "Instructional pedagogy (-25 pts modifier)",
                            expected: "Focus Aid · 15/100",
                          },
                          {
                            icon: "☕",
                            name: "Spotify Lo-Fi Study Beats",
                            platform: "Spotify",
                            url: "https://open.spotify.com/track/lofi-study-chillhop",
                            title:
                              "Lo-Fi Instrumental Beats for Coding & Deep Focus",
                            desc: "Acoustic focus mask (-35 pts modifier)",
                            expected: "Focus Aid · 15/100",
                          },
                          {
                            icon: "🎮",
                            name: "Twitch GTA V Livestream",
                            platform: "Twitch",
                            url: "https://twitch.tv/ninja",
                            title:
                              "GTA V Funny Moments, Reactions & Crazy Gameplay",
                            desc: "Distraction amplifier (+25 pts modifier)",
                            expected: "⚠️ Distracting · 95/100",
                          },
                          {
                            icon: "🎙️",
                            name: "Lex Fridman AI Podcast",
                            platform: "Apple Podcasts",
                            url: "https://podcasts.apple.com/us/podcast/lex-fridman-ai",
                            title:
                              "Lex Fridman Podcast: Autonomous AI Agents Deep Dive",
                            desc: "Spoken educational audio (-10 platform discount)",
                            expected: "Focus Aid · 25/100",
                          },
                          {
                            icon: "💼",
                            name: "Engineering Standup",
                            platform: "Voice / Meeting",
                            url: "https://meet.google.com/abc-defg-hij",
                            title: "Sprint Planning & Engineering Standup Call",
                            desc: "Collaborative workspace (clamped base 25)",
                            expected: "Collaborative · 25/100",
                          },
                          {
                            icon: "🎬",
                            name: "Netflix Stranger Things",
                            platform: "Netflix",
                            url: "https://netflix.com/watch/stranger-things",
                            title:
                              "Stranger Things Season 4 Episode 1 Full Drama",
                            desc: "Video streaming platform (+15 modifier)",
                            expected: "⚠️ Distracting · 85/100",
                          },
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            className="audio-preset-btn"
                            onClick={() => {
                              setAudioInputUrl(preset.url);
                              setAudioInputTitle(preset.title);
                              handleRunAudioClassification(
                                preset.url,
                                preset.title,
                              );
                              setNotice(`Simulated: ${preset.name}`);
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%",
                                marginBottom: 4,
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: "#f1f5f9",
                                  fontSize: 12,
                                }}
                              >
                                {preset.icon} {preset.name}
                              </span>
                              <span
                                className="pill"
                                style={{
                                  background: "#1e2235",
                                  fontSize: 9,
                                  padding: "2px 6px",
                                }}
                              >
                                {preset.platform}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "#94a3b8",
                                lineHeight: 1.3,
                              }}
                            >
                              {preset.desc}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "#38bdf8",
                                marginTop: 6,
                                fontWeight: 500,
                              }}
                            >
                              Expected: {preset.expected}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* 3. Live Classification Result Breakdown */}
                  {audioResult && (
                    <section className="card settings">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 12,
                        }}
                      >
                        <h2
                          style={{ color: "#e2e8f0", margin: 0, fontSize: 15 }}
                        >
                          Model Classification & Explainability Result
                        </h2>
                        <span
                          className={`badge ${
                            audioResult.isDistracting
                              ? "b-distracting"
                              : "b-productive"
                          }`}
                          style={{ padding: "6px 14px", fontSize: 11 }}
                        >
                          {audioResult.isDistracting
                            ? "⚠️ Distracting Media"
                            : "Focus Aid"}
                        </span>
                      </div>

                      <div className="settings-grid-2">
                        {/* Score Gauge */}
                        <div
                          style={{
                            background: "#090d16",
                            border: "1px solid #1e293b",
                            borderRadius: 10,
                            padding: "16px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <span style={{ fontSize: 11, color: "#64748b" }}>
                              QUANTITATIVE DISTRACTION SCORE
                            </span>
                            <span
                              className="pill"
                              style={{
                                background:
                                  audioResult.distractionLevel === "low"
                                    ? "#065f46"
                                    : audioResult.distractionLevel ===
                                        "moderate"
                                      ? "#1e293b"
                                      : "#831843",
                                color:
                                  audioResult.distractionLevel === "low"
                                    ? "#a7f3d0"
                                    : audioResult.distractionLevel ===
                                        "moderate"
                                      ? "#cbd5e1"
                                      : "#fbcfe8",
                                textTransform: "uppercase",
                              }}
                            >
                              Level: {audioResult.distractionLevel}
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "baseline",
                              gap: 6,
                              margin: "10px 0 4px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 36,
                                fontWeight: 800,
                                color: audioResult.isDistracting
                                  ? "#f43f5e"
                                  : "#10b981",
                              }}
                            >
                              {audioResult.distractionScore}
                            </span>
                            <span style={{ fontSize: 14, color: "#64748b" }}>
                              / 100
                            </span>
                          </div>

                          <div className="audio-score-meter">
                            <div
                              className="audio-score-fill"
                              style={{
                                width: `${audioResult.distractionScore}%`,
                                background: audioResult.isDistracting
                                  ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                                  : "linear-gradient(90deg, #10b981, #06b6d4)",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 10,
                              color: "#64748b",
                            }}
                          >
                            <span>0 (Pure Focus Aid)</span>
                            <span>40 (Neutral)</span>
                            <span>60 (Cutoff)</span>
                            <span>100 (Max Distraction)</span>
                          </div>
                        </div>

                        {/* Inference Details */}
                        <div
                          style={{
                            background: "#090d16",
                            border: "1px solid #1e293b",
                            borderRadius: 10,
                            padding: "16px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            fontSize: 11,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span style={{ color: "#64748b" }}>Platform:</span>
                            <span style={{ fontWeight: 600, color: "#a78bfa" }}>
                              🎵 {audioResult.platform}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span style={{ color: "#64748b" }}>
                              fastText Category:
                            </span>
                            <span style={{ fontWeight: 600, color: "#38bdf8" }}>
                              {audioResult.category} (
                              {(audioResult.confidence * 100).toFixed(0)}%
                              confidence)
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span style={{ color: "#64748b" }}>
                              Productivity Type:
                            </span>
                            <span
                              style={{
                                fontWeight: 600,
                                textTransform: "capitalize",
                                color:
                                  audioResult.productivityType === "productive"
                                    ? "#10b981"
                                    : audioResult.productivityType ===
                                        "distracting"
                                      ? "#f43f5e"
                                      : "#94a3b8",
                              }}
                            >
                              {audioResult.productivityType}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span style={{ color: "#64748b" }}>
                              Model Version:
                            </span>
                            <span style={{ color: "#cbd5e1" }}>
                              {audioResult.modelVersion} (quantized WASM)
                            </span>
                          </div>
                          <div
                            style={{
                              borderTop: "1px solid #1e2235",
                              paddingTop: 8,
                              marginTop: 4,
                            }}
                          >
                            <span
                              style={{ color: "#64748b", display: "block" }}
                            >
                              Decision Trace:
                            </span>
                            <span
                              style={{
                                color: "#cbd5e1",
                                fontSize: 10,
                                lineHeight: 1.4,
                              }}
                            >
                              {audioResult.distractionReason}
                            </span>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* 4. Historical Audio Sessions in IndexedDB */}
                  <section className="card settings">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <h2
                          style={{ color: "#e2e8f0", margin: 0, fontSize: 15 }}
                        >
                          Logged Audio Sessions (IndexedDB)
                        </h2>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 11,
                            color: "#64748b",
                          }}
                        >
                          Persistent audio session records stored locally in{" "}
                          <code>db.tab_sessions</code>
                        </p>
                      </div>
                    </div>

                    {historyAudioSessions.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "20px 0",
                          color: "#64748b",
                          fontSize: 12,
                        }}
                      >
                        No historical audio sessions logged yet. Audio sessions
                        are automatically created when audible tabs play media.
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table className="rules-table">
                          <thead>
                            <tr>
                              <th>Platform</th>
                              <th>Stream Title</th>
                              <th>Category</th>
                              <th>Audible Duration</th>
                              <th>Distraction Score</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historyAudioSessions.map((s) => (
                              <tr key={s.session_id}>
                                <td>
                                  <span
                                    className="pill"
                                    style={{
                                      background: "#7c3aed22",
                                      color: "#c4b5fd",
                                    }}
                                  >
                                    {s.audio_platform || "Audio"}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    fontWeight: 600,
                                    color: "#f1f5f9",
                                    maxWidth: 240,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                  title={s.title}
                                >
                                  {s.title}
                                </td>
                                <td>
                                  <span
                                    className="pill"
                                    style={{
                                      background: "#3b82f622",
                                      color: "#60a5fa",
                                    }}
                                  >
                                    {s.category}
                                  </span>
                                </td>
                                <td>{duration(s.dwell_time || 0)}</td>
                                <td style={{ fontWeight: 600 }}>
                                  <span
                                    style={{
                                      color: s.is_distracting
                                        ? "#f43f5e"
                                        : "#10b981",
                                    }}
                                  >
                                    {s.distraction_score ?? 50}/100
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`badge ${
                                      s.is_distracting
                                        ? "b-distracting"
                                        : "b-productive"
                                    }`}
                                    style={{ fontSize: 10 }}
                                  >
                                    {s.is_distracting
                                      ? "⚠️ Distracting"
                                      : "Focus Aid"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>

                  {/* 5. Acoustic & Semantic Scoring Reference */}
                  <section className="card settings">
                    <h2
                      style={{
                        color: "#e2e8f0",
                        margin: "0 0 10px",
                        fontSize: 15,
                      }}
                    >
                      Acoustic & Semantic Distraction Modifier Rules
                    </h2>
                    <div className="settings-grid-2">
                      <div className="audio-matrix-card">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              color: "#10b981",
                              fontSize: 12,
                            }}
                          >
                            🎵 Ambient & Focus Aids
                          </span>
                          <span
                            className="badge b-productive"
                            style={{ fontSize: 10 }}
                          >
                            -35 Points
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            margin: 0,
                            lineHeight: 1.4,
                          }}
                        >
                          Lo-Fi, ambient soundscapes, classical piano,
                          instrumental tracks, binaural frequencies, white
                          noise, nature rain, and study beats mask distracting
                          external noises.
                        </p>
                      </div>

                      <div className="audio-matrix-card">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              color: "#38bdf8",
                              fontSize: 12,
                            }}
                          >
                            🎓 Educational Spoken Audio
                          </span>
                          <span
                            className="badge b-productive"
                            style={{ fontSize: 10 }}
                          >
                            -25 Points
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            margin: 0,
                            lineHeight: 1.4,
                          }}
                        >
                          Lectures, courses, keynotes, tutorials, technical
                          seminars, audiobooks, and walkthroughs represent
                          structured pedagogical learning.
                        </p>
                      </div>

                      <div className="audio-matrix-card">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              color: "#ef4444",
                              fontSize: 12,
                            }}
                          >
                            ⚠️ Distraction Amplifiers
                          </span>
                          <span
                            className="badge b-distracting"
                            style={{ fontSize: 10 }}
                          >
                            +25 Points
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            margin: 0,
                            lineHeight: 1.4,
                          }}
                        >
                          Gaming livestreams, reaction videos, sitcoms, esports,
                          and official music videos cause heavy multitasking
                          cognitive drag.
                        </p>
                      </div>

                      <div className="audio-matrix-card">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              color: "#a855f7",
                              fontSize: 12,
                            }}
                          >
                            🌐 Platform Biases
                          </span>
                          <span
                            className="badge b-neutral"
                            style={{ fontSize: 10 }}
                          >
                            Contextual
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            margin: 0,
                            lineHeight: 1.4,
                          }}
                        >
                          Google Meet / Zoom clamped to base 25 (collaborative
                          work); Netflix / Twitch +15 (entertainment); Audible
                          -10.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* ── SETTINGS PAGE ──────────────────────────────────────────── */}
              {(page === "Settings" || page === "Rules") && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {/* Top Header */}
                  <div
                    className="section-top"
                    style={{
                      alignItems: "flex-start",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            color: "#e2e8f0",
                            margin: 0,
                            fontSize: 18,
                          }}
                        >
                          Settings & Options Center
                        </h2>
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: 12,
                            color: "#64748b",
                          }}
                        >
                          Configure local intelligence, custom classification
                          rules, privacy exclusions, audio distraction scoring,
                          and data retention.
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span className="model-badge">
                          <ShieldCheck size={13} /> 100% On-Device · Zero
                          Telemetry
                        </span>
                      </div>
                    </div>

                    {/* Sub-Navigation Tabs */}
                    <div
                      className="settings-subnav"
                      style={{ width: "100%", marginTop: 8 }}
                    >
                      <button
                        type="button"
                        className={`settings-subnav-btn ${settingsTab === "general" ? "active" : ""}`}
                        onClick={() => setSettingsTab("general")}
                      >
                        <Settings size={14} /> General & Inactivity
                      </button>
                      <button
                        type="button"
                        className={`settings-subnav-btn ${settingsTab === "rules" ? "active" : ""}`}
                        onClick={() => setSettingsTab("rules")}
                      >
                        <Zap size={14} /> Tracking Rules{" "}
                        {customRules.length > 0 && (
                          <span
                            className="pill"
                            style={{ fontSize: 10, padding: "1px 6px" }}
                          >
                            {customRules.length}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        className={`settings-subnav-btn ${settingsTab === "exclusions" ? "active" : ""}`}
                        onClick={() => setSettingsTab("exclusions")}
                      >
                        <Lock size={14} /> Exclusions & Privacy
                      </button>
                      <button
                        type="button"
                        className={`settings-subnav-btn ${settingsTab === "audio" ? "active" : ""}`}
                        onClick={() => setSettingsTab("audio")}
                      >
                        <Volume2 size={14} /> Audio & Distraction
                      </button>
                      <button
                        type="button"
                        className={`settings-subnav-btn ${settingsTab === "appearance" ? "active" : ""}`}
                        onClick={() => setSettingsTab("appearance")}
                      >
                        <Palette size={14} /> Appearance & HUD
                      </button>
                      <button
                        type="button"
                        className={`settings-subnav-btn ${settingsTab === "data" ? "active" : ""}`}
                        onClick={() => setSettingsTab("data")}
                      >
                        <Database size={14} /> Data Management
                      </button>
                    </div>
                  </div>

                  {/* ── 1. GENERAL TAB ── */}
                  {settingsTab === "general" && (
                    <>
                      <section className="card settings">
                        <h2 style={{ color: "#e2e8f0" }}>
                          Local Activity Tracking
                        </h2>
                        <div className="setting-row">
                          <div>
                            <h3>Activity Tracking Status</h3>
                            <p>
                              Continuously monitors the focused active tab,
                              calculates dwell times, and clusters tabs into
                              workstreams with zero cloud upload.
                            </p>
                          </div>
                          <button
                            className={isTracking ? "secondary" : "primary"}
                            onClick={handleToggleTracking}
                          >
                            {isTracking ? (
                              <>
                                <Pause size={16} /> Pause tracking
                              </>
                            ) : (
                              <>
                                <Play size={16} /> Enable tracking
                              </>
                            )}
                          </button>
                        </div>
                      </section>

                      <section className="card settings">
                        <h2 style={{ color: "#e2e8f0" }}>
                          Inactivity & Idle Threshold
                        </h2>
                        <div className="setting-row">
                          <div>
                            <h3>Idle Threshold Timeout</h3>
                            <p>
                              Stops dwell accumulation when no keyboard, mouse,
                              or scroll activity occurs for this duration.
                              Today's recorded idle time:{" "}
                              <b>{duration(m.idleTime)}</b>
                            </p>
                          </div>
                          <select
                            style={{
                              background: "#0f1117",
                              border: "1px solid #252836",
                              color: "#e2e8f0",
                              borderRadius: 6,
                              padding: "8px 14px",
                            }}
                            value={state.idleThresholdSeconds}
                            onChange={(e) =>
                              call({
                                type: "settings",
                                enabled: state.enabled,
                                excluded: state.excluded,
                                idleThresholdSeconds: Number(e.target.value),
                              })
                            }
                          >
                            <option value={60}>1 minute (60s)</option>
                            <option value={120}>2 minutes (120s)</option>
                            <option value={180}>
                              3 minutes (180s - Default)
                            </option>
                            <option value={240}>4 minutes (240s)</option>
                            <option value={300}>5 minutes (300s)</option>
                            <option value={600}>10 minutes (600s)</option>
                          </select>
                        </div>
                        <div className="setting-row">
                          <div>
                            <h3>Daily Focus Target</h3>
                            <p>
                              Target percentage of active browsing dedicated to
                              productive workstreams.
                            </p>
                          </div>
                          <select
                            style={{
                              background: "#0f1117",
                              border: "1px solid #252836",
                              color: "#e2e8f0",
                              borderRadius: 6,
                              padding: "8px 14px",
                            }}
                            value={focusGoal}
                            onChange={(e) => {
                              setFocusGoal(Number(e.target.value));
                              setNotice(
                                `Focus goal updated to ${e.target.value}%.`,
                              );
                            }}
                          >
                            <option value={70}>70% Target</option>
                            <option value={75}>75% Target</option>
                            <option value={80}>80% Target (Recommended)</option>
                            <option value={85}>85% High Focus</option>
                            <option value={90}>90% Deep Work</option>
                          </select>
                        </div>
                      </section>

                      <section className="card settings">
                        <h2 style={{ color: "#e2e8f0" }}>
                          Automated Snapshot Triggers
                        </h2>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                            marginTop: 8,
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              fontSize: 12,
                              color: "#cbd5e1",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={autoSnapSwitch}
                              onChange={(e) =>
                                setAutoSnapSwitch(e.target.checked)
                              }
                            />
                            Auto-capture workspace snapshot on major context
                            switch (unrelated workstream)
                          </label>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              fontSize: 12,
                              color: "#cbd5e1",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={autoSnapTabLimit}
                              onChange={(e) =>
                                setAutoSnapTabLimit(e.target.checked)
                              }
                            />
                            Prompt workspace preservation when opening &gt; 10
                            tabs simultaneously
                          </label>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              fontSize: 12,
                              color: "#cbd5e1",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={autoSnapHourly}
                              onChange={(e) =>
                                setAutoSnapHourly(e.target.checked)
                              }
                            />
                            Periodic checkpoint every 60 minutes of active
                            browsing
                          </label>
                        </div>
                      </section>

                      <section className="card settings">
                        <h2 style={{ color: "#e2e8f0" }}>
                          Local Intelligence & fastText ML Engine
                        </h2>
                        <div className="setting-row">
                          <div>
                            <h3>On-Device fastText Classifier</h3>
                            <p>
                              Model: <b>atentiv-classifier.ftz</b> (~3.58 MB
                              binary) · Compiled to WebAssembly · 0 external
                              network requests
                            </p>
                          </div>
                          <span className="model-badge">
                            <ShieldCheck size={13} /> Active & Quantized
                          </span>
                        </div>
                      </section>

                      <section className="card settings">
                        <h2 style={{ color: "#e2e8f0" }}>
                          Privacy & Data Management
                        </h2>
                        <div className="setting-row">
                          <div>
                            <h3>Excluded websites</h3>
                            <p>Comma-separated domains. Subdomains included.</p>
                          </div>
                          <button
                            className="secondary"
                            onClick={() => {
                              setBlocked(state.excluded);
                              setModal("exclude");
                            }}
                          >
                            Edit exclusions
                          </button>
                        </div>
                        <div className="setting-row">
                          <div>
                            <h3>Take your data with you</h3>
                            <p>Export recorded activity as JSON.</p>
                          </div>
                          <button className="secondary" onClick={exportData}>
                            <Download size={16} /> Export
                          </button>
                        </div>
                        <div className="setting-row">
                          <div>
                            <h3>Delete activity and saved contexts</h3>
                            <p>Clears all recorded activity.</p>
                          </div>
                          <button
                            className="danger"
                            onClick={() => setModal("clear")}
                          >
                            Delete data
                          </button>
                        </div>
                      </section>
                    </>
                  )}

                  {/* ── 2. RULES TAB ── */}
                  {settingsTab === "rules" && (
                    <>
                      <section className="card settings">
                        <h2 style={{ color: "#e2e8f0" }}>
                          Add Custom Classification Rule
                        </h2>
                        <p
                          style={{
                            fontSize: 12,
                            color: "#94a3b8",
                            margin: "4px 0 14px",
                          }}
                        >
                          User-defined rules take strict precedence over ML
                          models, curated databases, and heuristics.
                        </p>
                        <form
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: 12,
                          }}
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const val = ruleValue.trim();
                            if (!val) return;
                            const cond: UserRuleCondition = {};
                            if (ruleConditionType === "domain_exact")
                              cond.domain_exact = val;
                            else if (ruleConditionType === "domain_contains")
                              cond.domain_wildcard = `*${val}*`;
                            else if (ruleConditionType === "title_contains")
                              cond.title_contains = val;
                            else if (ruleConditionType === "url_prefix")
                              cond.url_path_prefix = val;

                            const rId = crypto.randomUUID();
                            const ruleObj: UserRuleRecord = {
                              rule_id: rId,
                              name: ruleName.trim() || `Rule for ${val}`,
                              enabled: true,
                              priority: Number(rulePriority) || 150,
                              condition: cond,
                              action: {
                                category: ruleCategory,
                                productivity_type: ruleProductivity,
                                activity_type: `${ruleCategory} Task`,
                              },
                              created_at: Date.now(),
                              updated_at: Date.now(),
                            };

                            await RuleRepository.add(ruleObj);
                            await refreshRules();
                            setNotice(
                              `Added rule for "${val}" as ${ruleCategory} (${ruleProductivity}).`,
                            );
                            setRuleValue("");
                            setRuleName("");
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                              fontSize: 11,
                              color: "#94a3b8",
                            }}
                          >
                            Rule Name (Optional)
                            <input
                              type="text"
                              value={ruleName}
                              onChange={(e) => setRuleName(e.target.value)}
                              placeholder="e.g. FreeCodeCamp Lectures"
                              style={{
                                background: "#0f1117",
                                border: "1px solid #252836",
                                color: "#e2e8f0",
                                borderRadius: 6,
                                padding: "8px 10px",
                                fontSize: 12,
                              }}
                            />
                          </label>

                          <label
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                              fontSize: 11,
                              color: "#94a3b8",
                            }}
                          >
                            Condition Match Type
                            <select
                              value={ruleConditionType}
                              onChange={(e: any) =>
                                setRuleConditionType(e.target.value)
                              }
                              style={{
                                background: "#0f1117",
                                border: "1px solid #252836",
                                color: "#e2e8f0",
                                borderRadius: 6,
                                padding: "8px 10px",
                                fontSize: 12,
                              }}
                            >
                              <option value="domain_exact">Exact Domain</option>
                              <option value="domain_contains">
                                Domain Contains / Wildcard
                              </option>
                              <option value="title_contains">
                                Page Title Contains
                              </option>
                              <option value="url_prefix">
                                URL Path Prefix
                              </option>
                            </select>
                          </label>

                          <label
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                              fontSize: 11,
                              color: "#94a3b8",
                            }}
                          >
                            Match Value
                            <input
                              type="text"
                              required
                              value={ruleValue}
                              onChange={(e) => setRuleValue(e.target.value)}
                              placeholder="e.g. leetcode.com or tutorial"
                              style={{
                                background: "#0f1117",
                                border: "1px solid #252836",
                                color: "#e2e8f0",
                                borderRadius: 6,
                                padding: "8px 10px",
                                fontSize: 12,
                              }}
                            />
                          </label>

                          <label
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                              fontSize: 11,
                              color: "#94a3b8",
                            }}
                          >
                            Override Category
                            <select
                              value={ruleCategory}
                              onChange={(e) => setRuleCategory(e.target.value)}
                              style={{
                                background: "#0f1117",
                                border: "1px solid #252836",
                                color: "#e2e8f0",
                                borderRadius: 6,
                                padding: "8px 10px",
                                fontSize: 12,
                              }}
                            >
                              <option value="Education">Education</option>
                              <option value="Technology">Technology</option>
                              <option value="Research">Research</option>
                              <option value="Work">Work</option>
                              <option value="Communication">
                                Communication
                              </option>
                              <option value="News">News</option>
                              <option value="Entertainment">
                                Entertainment
                              </option>
                              <option value="Chat">Chat</option>
                              <option value="Shop">Shop</option>
                            </select>
                          </label>

                          <label
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                              fontSize: 11,
                              color: "#94a3b8",
                            }}
                          >
                            Productivity Score Type
                            <select
                              value={ruleProductivity}
                              onChange={(e: any) =>
                                setRuleProductivity(e.target.value)
                              }
                              style={{
                                background: "#0f1117",
                                border: "1px solid #252836",
                                color: "#e2e8f0",
                                borderRadius: 6,
                                padding: "8px 10px",
                                fontSize: 12,
                              }}
                            >
                              <option value="productive">
                                Productive (+1)
                              </option>
                              <option value="neutral">Neutral (0)</option>
                              <option value="distracting">
                                Distracting (-1)
                              </option>
                            </select>
                          </label>

                          <label
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                              fontSize: 11,
                              color: "#94a3b8",
                            }}
                          >
                            Priority (100 - 200)
                            <input
                              type="number"
                              min={100}
                              max={200}
                              value={rulePriority}
                              onChange={(e) =>
                                setRulePriority(Number(e.target.value))
                              }
                              style={{
                                background: "#0f1117",
                                border: "1px solid #252836",
                                color: "#e2e8f0",
                                borderRadius: 6,
                                padding: "8px 10px",
                                fontSize: 12,
                              }}
                            />
                          </label>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-end",
                              marginTop: 4,
                            }}
                          >
                            <button
                              type="submit"
                              className="primary"
                              style={{ height: 38, width: "100%" }}
                            >
                              <Plus size={14} /> Add User Rule
                            </button>
                          </div>
                        </form>
                      </section>

                      <section className="card settings">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 12,
                          }}
                        >
                          <div>
                            <h2 style={{ color: "#e2e8f0", margin: 0 }}>
                              Active Classification Rules
                            </h2>
                            <p
                              style={{
                                margin: "2px 0 0",
                                fontSize: 11,
                                color: "#64748b",
                              }}
                            >
                              {customRules.length} custom rules registered in
                              Dexie database
                            </p>
                          </div>
                          {customRules.length === 0 && (
                            <button
                              type="button"
                              className="secondary"
                              onClick={async () => {
                                const sampleRules: Omit<
                                  UserRuleRecord,
                                  "created_at" | "updated_at"
                                >[] = [
                                  {
                                    rule_id: crypto.randomUUID(),
                                    name: "FreeCodeCamp Lectures",
                                    enabled: true,
                                    priority: 160,
                                    condition: {
                                      domain_wildcard: "*freecodecamp.org*",
                                    },
                                    action: {
                                      category: "Education",
                                      productivity_type: "productive",
                                    },
                                  },
                                  {
                                    rule_id: crypto.randomUUID(),
                                    name: "LeetCode Practice",
                                    enabled: true,
                                    priority: 155,
                                    condition: { domain_exact: "leetcode.com" },
                                    action: {
                                      category: "Technology",
                                      productivity_type: "productive",
                                    },
                                  },
                                  {
                                    rule_id: crypto.randomUUID(),
                                    name: "ArXiv Scientific Papers",
                                    enabled: true,
                                    priority: 150,
                                    condition: { domain_exact: "arxiv.org" },
                                    action: {
                                      category: "Research",
                                      productivity_type: "productive",
                                    },
                                  },
                                ];
                                for (const sr of sampleRules) {
                                  await RuleRepository.add(sr);
                                }
                                await refreshRules();
                                setNotice(
                                  "Seeded default recommended user rules.",
                                );
                              }}
                            >
                              <Sparkles size={13} /> Seed Recommended Rules
                            </button>
                          )}
                        </div>

                        {customRules.length === 0 ? (
                          <div
                            style={{
                              textAlign: "center",
                              padding: "24px 0",
                              color: "#64748b",
                              fontSize: 12,
                            }}
                          >
                            No custom classification rules yet. Add a rule above
                            to override fastText ML predictions.
                          </div>
                        ) : (
                          <div style={{ overflowX: "auto" }}>
                            <table className="rules-table">
                              <thead>
                                <tr>
                                  <th>Priority</th>
                                  <th>Name</th>
                                  <th>Condition Expression</th>
                                  <th>Override Category</th>
                                  <th>Productivity</th>
                                  <th style={{ textAlign: "right" }}>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {customRules.map((rule) => {
                                  const condStr = rule.condition.domain_exact
                                    ? `domain == "${rule.condition.domain_exact}"`
                                    : rule.condition.domain_wildcard
                                      ? `domain matches "${rule.condition.domain_wildcard}"`
                                      : rule.condition.title_contains
                                        ? `title contains "${rule.condition.title_contains}"`
                                        : rule.condition.url_path_prefix
                                          ? `path startsWith "${rule.condition.url_path_prefix}"`
                                          : JSON.stringify(rule.condition);
                                  return (
                                    <tr key={rule.rule_id}>
                                      <td>
                                        <span
                                          className="pill"
                                          style={{
                                            background: "#3b82f622",
                                            color: "#60a5fa",
                                          }}
                                        >
                                          {rule.priority}
                                        </span>
                                      </td>
                                      <td
                                        style={{
                                          fontWeight: 600,
                                          color: "#f1f5f9",
                                        }}
                                      >
                                        {rule.name}
                                      </td>
                                      <td>
                                        <code
                                          style={{
                                            background: "#090d16",
                                            padding: "2px 6px",
                                            borderRadius: 4,
                                            color: "#38bdf8",
                                            fontSize: 10,
                                          }}
                                        >
                                          {condStr}
                                        </code>
                                      </td>
                                      <td>
                                        <span
                                          className="pill"
                                          style={{
                                            background: "#6366f122",
                                            color: "#a5b4fc",
                                          }}
                                        >
                                          {rule.action.category || "General"}
                                        </span>
                                      </td>
                                      <td>
                                        <span
                                          className={`badge ${
                                            rule.action.productivity_type ===
                                            "productive"
                                              ? "b-productive"
                                              : rule.action
                                                    .productivity_type ===
                                                  "distracting"
                                                ? "b-distracting"
                                                : "b-neutral"
                                          }`}
                                          style={{ fontSize: 10 }}
                                        >
                                          {rule.action.productivity_type ||
                                            "neutral"}
                                        </span>
                                      </td>
                                      <td style={{ textAlign: "right" }}>
                                        <button
                                          type="button"
                                          className="action-btn-sm"
                                          style={{ color: "#ef4444" }}
                                          onClick={async () => {
                                            await RuleRepository.remove(
                                              rule.rule_id,
                                            );
                                            await refreshRules();
                                            setNotice(
                                              `Deleted rule: ${rule.name}`,
                                            );
                                          }}
                                        >
                                          <Trash2 size={12} /> Delete
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </section>
                    </>
                  )}

                  {/* ── 3. EXCLUSIONS TAB ── */}
                  {settingsTab === "exclusions" && (
                    <>
                      <section className="card settings">
                        <h2 style={{ color: "#e2e8f0" }}>
                          Add Privacy Exclusion
                        </h2>
                        <p
                          style={{
                            fontSize: 12,
                            color: "#94a3b8",
                            margin: "4px 0 14px",
                          }}
                        >
                          Domains added here are immediately halted before DOM
                          extraction and feature vectorization. No session is
                          spawned.
                        </p>
                        <form
                          style={{
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                            alignItems: "flex-end",
                          }}
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const clean = exclDomain
                              .toLowerCase()
                              .trim()
                              .replace(/^https?:\/\//, "")
                              .replace(/\/.*$/, "")
                              .replace(/^www\./, "");
                            if (!clean) return;
                            const existing = state.excluded
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean);
                            if (!existing.includes(clean)) {
                              const updated = [...existing, clean].join(", ");
                              await call({
                                type: "settings",
                                enabled: state.enabled,
                                excluded: updated,
                                idleThresholdSeconds:
                                  state.idleThresholdSeconds,
                              });
                              setNotice(
                                `Added ${clean} to privacy exclusions.`,
                              );
                              setExclDomain("");
                              setExclReason("");
                            }
                          }}
                        >
                          <label
                            style={{
                              flex: 1,
                              minWidth: 200,
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                              fontSize: 11,
                              color: "#94a3b8",
                            }}
                          >
                            Domain / Hostname
                            <input
                              type="text"
                              required
                              value={exclDomain}
                              onChange={(e) => setExclDomain(e.target.value)}
                              placeholder="e.g. chase.com or internal-portal.corp"
                              style={{
                                background: "#0f1117",
                                border: "1px solid #252836",
                                color: "#e2e8f0",
                                borderRadius: 6,
                                padding: "8px 10px",
                                fontSize: 12,
                              }}
                            />
                          </label>

                          <label
                            style={{
                              flex: 1,
                              minWidth: 200,
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                              fontSize: 11,
                              color: "#94a3b8",
                            }}
                          >
                            Exclusion Reason (Audit Note)
                            <input
                              type="text"
                              value={exclReason}
                              onChange={(e) => setExclReason(e.target.value)}
                              placeholder="e.g. Personal Banking & Accounts"
                              style={{
                                background: "#0f1117",
                                border: "1px solid #252836",
                                color: "#e2e8f0",
                                borderRadius: 6,
                                padding: "8px 10px",
                                fontSize: 12,
                              }}
                            />
                          </label>

                          <button
                            type="submit"
                            className="primary"
                            style={{ height: 38, padding: "0 18px" }}
                          >
                            <Lock size={14} /> Add Exclusion
                          </button>
                        </form>
                      </section>

                      <section className="card settings">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 12,
                          }}
                        >
                          <div>
                            <h2 style={{ color: "#e2e8f0", margin: 0 }}>
                              Active User Exclusions
                            </h2>
                            <p
                              style={{
                                margin: "2px 0 0",
                                fontSize: 11,
                                color: "#64748b",
                              }}
                            >
                              {
                                state.excluded
                                  .split(",")
                                  .filter((s) => s.trim()).length
                              }{" "}
                              domains configured
                            </p>
                          </div>
                        </div>

                        {state.excluded
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean).length === 0 ? (
                          <div
                            style={{
                              textAlign: "center",
                              padding: "20px 0",
                              color: "#64748b",
                              fontSize: 12,
                            }}
                          >
                            No custom domain exclusions configured.
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            {state.excluded
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                              .map((domain) => (
                                <div key={domain} className="exclusion-item">
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 10,
                                    }}
                                  >
                                    <Lock
                                      size={14}
                                      style={{ color: "#ef4444" }}
                                    />
                                    <div>
                                      <span
                                        style={{
                                          fontWeight: 600,
                                          color: "#f1f5f9",
                                          fontSize: 12,
                                        }}
                                      >
                                        {domain}
                                      </span>
                                      <div
                                        style={{
                                          fontSize: 10,
                                          color: "#64748b",
                                        }}
                                      >
                                        Subdomains protected · Zero dwell
                                        accumulation
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className="action-btn-sm"
                                    style={{ color: "#ef4444" }}
                                    onClick={async () => {
                                      const updated = state.excluded
                                        .split(",")
                                        .map((x) => x.trim())
                                        .filter(
                                          (x) =>
                                            x &&
                                            x.toLowerCase() !==
                                              domain.toLowerCase(),
                                        )
                                        .join(", ");
                                      await call({
                                        type: "settings",
                                        enabled: state.enabled,
                                        excluded: updated,
                                        idleThresholdSeconds:
                                          state.idleThresholdSeconds,
                                      });
                                      setNotice(
                                        `Removed ${domain} from exclusions.`,
                                      );
                                    }}
                                  >
                                    <Trash2 size={12} /> Remove
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}
                      </section>

                      <section className="card settings">
                        <h2 style={{ color: "#e2e8f0" }}>
                          Built-In Sensitive Protection Shield
                        </h2>
                        <p
                          style={{
                            fontSize: 12,
                            color: "#94a3b8",
                            margin: "4px 0 12px",
                          }}
                        >
                          Atentiv contains a built-in precompiled blacklist of
                          sensitive categories that are automatically excluded
                          even without custom rules.
                        </p>
                        <div className="settings-grid-2">
                          <div className="audio-matrix-card">
                            <div
                              style={{
                                fontWeight: 600,
                                color: "#10b981",
                                fontSize: 12,
                                marginBottom: 4,
                              }}
                            >
                              🏦 Banking & Financial Portals
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                lineHeight: 1.4,
                              }}
                            >
                              Automatically blocks Chase, Wells Fargo, Bank of
                              America, PayPal, Fidelity, Vanguard, and 120+
                              banking domains.
                            </div>
                          </div>
                          <div className="audio-matrix-card">
                            <div
                              style={{
                                fontWeight: 600,
                                color: "#38bdf8",
                                fontSize: 12,
                                marginBottom: 4,
                              }}
                            >
                              🔑 Authentication & SSO Endpoints
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                lineHeight: 1.4,
                              }}
                            >
                              Intercepts <code>/login</code>,{" "}
                              <code>/oauth</code>, <code>/signin</code>, and{" "}
                              <code>/auth</code> paths across all websites.
                            </div>
                          </div>
                          <div className="audio-matrix-card">
                            <div
                              style={{
                                fontWeight: 600,
                                color: "#a855f7",
                                fontSize: 12,
                                marginBottom: 4,
                              }}
                            >
                              🛡️ Password Managers
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                lineHeight: 1.4,
                              }}
                            >
                              Zero tracking on 1Password, Bitwarden, LastPass,
                              Dashlane, and KeePass web vaults.
                            </div>
                          </div>
                          <div className="audio-matrix-card">
                            <div
                              style={{
                                fontWeight: 600,
                                color: "#f59e0b",
                                fontSize: 12,
                                marginBottom: 4,
                              }}
                            >
                              🏥 Medical & Health Information
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                lineHeight: 1.4,
                              }}
                            >
                              Guarantees zero logging on health portals, patient
                              chart systems, and telehealth sessions.
                            </div>
                          </div>
                        </div>
                      </section>
                    </>
                  )}

                  {/* ── 4. AUDIO & DISTRACTION TAB ── */}
                  {settingsTab === "audio" && (
                    <>
                      <section className="card settings">
                        <h2 style={{ color: "#e2e8f0" }}>
                          Background Audio Stream Subsystem
                        </h2>
                        <div className="setting-row">
                          <div>
                            <h3>Concurrent Tab Audio Tracking</h3>
                            <p>
                              Continuously detects audible streams (
                              <code>tab.audible === true</code>) and tracks
                              dwell time concurrently without disrupting active
                              foreground tabs.
                            </p>
                          </div>
                          <span className="model-badge">
                            <Volume2 size={13} /> Active & Synchronized
                          </span>
                        </div>

                        <div className="setting-row">
                          <div>
                            <h3>Audio Distraction Scoring Cutoff</h3>
                            <p>
                              Distraction threshold: Streams scored &ge; this
                              value trigger distracting warnings. Streams &lt;
                              40 are classified as Focus Aids.
                            </p>
                          </div>
                          <select
                            style={{
                              background: "#0f1117",
                              border: "1px solid #252836",
                              color: "#e2e8f0",
                              borderRadius: 6,
                              padding: "8px 14px",
                            }}
                            value={audioThreshold}
                            onChange={(e) => {
                              setAudioThreshold(Number(e.target.value));
                              setNotice(
                                `Audio distraction cutoff set to ${e.target.value}/100.`,
                              );
                            }}
                          >
                            <option value={50}>50 (Strict Focus)</option>
                            <option value={55}>55 (Balanced)</option>
                            <option value={60}>60 (Recommended Default)</option>
                            <option value={65}>65 (Permissive)</option>
                            <option value={70}>70 (Relaxed)</option>
                          </select>
                        </div>
                      </section>

                      <section className="card settings">
                        <h2 style={{ color: "#e2e8f0" }}>
                          Acoustic & Semantic Scoring Matrix
                        </h2>
                        <p
                          style={{
                            fontSize: 12,
                            color: "#94a3b8",
                            margin: "4px 0 14px",
                          }}
                        >
                          Media titles and streaming metadata are evaluated
                          locally using fastText ML and acoustic modifiers:
                        </p>
                        <div className="settings-grid-2">
                          <div className="audio-matrix-card">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 6,
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: "#10b981",
                                  fontSize: 12,
                                }}
                              >
                                🎵 Ambient & Focus Aids
                              </span>
                              <span
                                className="badge b-productive"
                                style={{ fontSize: 10 }}
                              >
                                -35 Points
                              </span>
                            </div>
                            <p
                              style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                margin: 0,
                                lineHeight: 1.4,
                              }}
                            >
                              Lo-Fi beats, ambient rain, classical piano,
                              instrumental, binaural frequencies, and study BGM
                              boost focus by masking background distractions.
                            </p>
                          </div>

                          <div className="audio-matrix-card">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 6,
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: "#38bdf8",
                                  fontSize: 12,
                                }}
                              >
                                🎓 Educational Spoken Audio
                              </span>
                              <span
                                className="badge b-productive"
                                style={{ fontSize: 10 }}
                              >
                                -25 Points
                              </span>
                            </div>
                            <p
                              style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                margin: 0,
                                lineHeight: 1.4,
                              }}
                            >
                              Lectures, university courses, keynotes, tutorials,
                              technical deep dives, and audiobooks are treated
                              as intentional learning sessions.
                            </p>
                          </div>

                          <div className="audio-matrix-card">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 6,
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: "#ef4444",
                                  fontSize: 12,
                                }}
                              >
                                ⚠️ Distraction Amplifiers
                              </span>
                              <span
                                className="badge b-distracting"
                                style={{ fontSize: 10 }}
                              >
                                +25 Points
                              </span>
                            </div>
                            <p
                              style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                margin: 0,
                                lineHeight: 1.4,
                              }}
                            >
                              Gaming livestreams, reaction videos, sitcoms,
                              esports, and official music videos cause heavy
                              multitasking cognitive drag.
                            </p>
                          </div>

                          <div className="audio-matrix-card">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 6,
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: "#a855f7",
                                  fontSize: 12,
                                }}
                              >
                                🌐 Platform Modifiers
                              </span>
                              <span
                                className="badge b-neutral"
                                style={{ fontSize: 10 }}
                              >
                                Contextual
                              </span>
                            </div>
                            <p
                              style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                margin: 0,
                                lineHeight: 1.4,
                              }}
                            >
                              Google Meet / Zoom clamped to base 25
                              (collaborative work); Netflix / Twitch +15
                              (entertainment); Audible -10.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section className="card settings">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <h2 style={{ color: "#e2e8f0", margin: 0 }}>
                              Interactive Audio Test Bench
                            </h2>
                            <p
                              style={{
                                margin: "4px 0 0",
                                fontSize: 11,
                                color: "#64748b",
                              }}
                            >
                              Launch the standalone HTML5 audio test harness to
                              simulate audio playback and verify HUD cards.
                            </p>
                          </div>
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => {
                              if (
                                typeof chrome !== "undefined" &&
                                chrome.tabs?.create
                              ) {
                                chrome.tabs.create({
                                  url: chrome.runtime.getURL("audio-test.html"),
                                });
                              } else {
                                window.open(
                                  "/public/audio-test.html",
                                  "_blank",
                                );
                              }
                            }}
                          >
                            <ExternalLink size={13} /> Open Audio Test Bench
                          </button>
                        </div>
                      </section>
                    </>
                  )}

                  {/* ── 5. APPEARANCE TAB ── */}
                  {settingsTab === "appearance" && (
                    <>
                      <section className="card settings">
                        <h2 style={{ color: "#e2e8f0" }}>
                          Visual Theme & Accent Color
                        </h2>
                        <div className="setting-row">
                          <div>
                            <h3>Accent Brand Color</h3>
                            <p>
                              Sets primary button glows, progress rings, and
                              highlight indicators.
                            </p>
                            <div className="color-swatches">
                              {[
                                { color: "#7c3aed", name: "Violet" },
                                { color: "#10b981", name: "Emerald" },
                                { color: "#f59e0b", name: "Amber" },
                                { color: "#06b6d4", name: "Cyan" },
                                { color: "#3b82f6", name: "Blue" },
                                { color: "#f43f5e", name: "Rose" },
                              ].map((c) => (
                                <button
                                  key={c.color}
                                  type="button"
                                  className={`color-swatch ${accentColor === c.color ? "active" : ""}`}
                                  style={{ background: c.color }}
                                  title={c.name}
                                  onClick={() => {
                                    setAccentColor(c.color);
                                    document.documentElement.style.setProperty(
                                      "--accent-primary",
                                      c.color,
                                    );
                                    setNotice(`Accent color set to ${c.name}.`);
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="setting-row">
                          <div>
                            <h3>Theme Palette</h3>
                            <p>Interface color contrast profile.</p>
                          </div>
                          <select
                            style={{
                              background: "#0f1117",
                              border: "1px solid #252836",
                              color: "#e2e8f0",
                              borderRadius: 6,
                              padding: "8px 14px",
                            }}
                            value={themeMode}
                            onChange={(e) => {
                              setThemeMode(e.target.value);
                              setNotice(`Theme set to ${e.target.value}.`);
                            }}
                          >
                            <option value="dark">
                              Dark (High Contrast Slate - Default)
                            </option>
                            <option value="midnight">Midnight Blue</option>
                            <option value="oled">Deep OLED Black</option>
                          </select>
                        </div>
                      </section>

                      <section className="card settings">
                        <h2 style={{ color: "#e2e8f0" }}>
                          Transparent On-Page Glass HUD
                        </h2>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                            marginTop: 8,
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              fontSize: 12,
                              color: "#cbd5e1",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={hudEnabled}
                              onChange={(e) => {
                                setHudEnabled(e.target.checked);
                                setNotice(
                                  `HUD overlay ${e.target.checked ? "enabled" : "disabled"}.`,
                                );
                              }}
                            />
                            Show Floating Glass HUD overlay on web pages
                            (Command+Shift+H / Alt+H to toggle)
                          </label>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              fontSize: 12,
                              color: "#cbd5e1",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={hudAudioEnabled}
                              onChange={(e) =>
                                setHudAudioEnabled(e.target.checked)
                              }
                            />
                            Display Live Background Audio Stream card inside the
                            on-page Glass HUD
                          </label>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              fontSize: 12,
                              color: "#cbd5e1",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={hudWorkstreamEnabled}
                              onChange={(e) =>
                                setHudWorkstreamEnabled(e.target.checked)
                              }
                            />
                            Show Active Workstream clustering badge & focus
                            timer in HUD
                          </label>
                        </div>
                      </section>
                    </>
                  )}

                  {/* ── 6. DATA MANAGEMENT TAB ── */}
                  {settingsTab === "data" && (
                    <>
                      <section className="card settings">
                        <h2 style={{ color: "#e2e8f0" }}>
                          Local Storage Telemetry & Status
                        </h2>
                        <div className="settings-grid-2">
                          <div className="audio-matrix-card">
                            <div style={{ fontSize: 11, color: "#64748b" }}>
                              TOTAL TRACKED SESSIONS
                            </div>
                            <div
                              style={{
                                fontSize: 24,
                                fontWeight: 700,
                                color: "#f1f5f9",
                                marginTop: 4,
                              }}
                            >
                              {state.visits.length}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "#10b981",
                                marginTop: 2,
                              }}
                            >
                              Stored in Dexie IndexedDB
                            </div>
                          </div>
                          <div className="audio-matrix-card">
                            <div style={{ fontSize: 11, color: "#64748b" }}>
                              SAVED WORKSPACES
                            </div>
                            <div
                              style={{
                                fontSize: 24,
                                fontWeight: 700,
                                color: "#f1f5f9",
                                marginTop: 4,
                              }}
                            >
                              {state.snapshots.length}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "#8b5cf6",
                                marginTop: 2,
                              }}
                            >
                              Context resume snapshots
                            </div>
                          </div>
                          <div className="audio-matrix-card">
                            <div style={{ fontSize: 11, color: "#64748b" }}>
                              DECISION TRACES
                            </div>
                            <div
                              style={{
                                fontSize: 24,
                                fontWeight: 700,
                                color: "#f1f5f9",
                                marginTop: 4,
                              }}
                            >
                              {traces.length}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "#38bdf8",
                                marginTop: 2,
                              }}
                            >
                              ML explainability records
                            </div>
                          </div>
                          <div className="audio-matrix-card">
                            <div style={{ fontSize: 11, color: "#64748b" }}>
                              ACTIVE WORKSTREAMS
                            </div>
                            <div
                              style={{
                                fontSize: 24,
                                fontWeight: 700,
                                color: "#f1f5f9",
                                marginTop: 4,
                              }}
                            >
                              {activeWorkstreams.length}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "#f59e0b",
                                marginTop: 2,
                              }}
                            >
                              Clustered context clusters
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="card settings">
                        <h2 style={{ color: "#e2e8f0" }}>
                          Data Export, Seeding & Pruning
                        </h2>
                        <div className="setting-row">
                          <div>
                            <h3>Take your data with you</h3>
                            <p>
                              Export all recorded sessions, workstreams,
                              decision traces, and snapshots as a local JSON
                              file.
                            </p>
                          </div>
                          <button className="secondary" onClick={exportData}>
                            <Download size={16} /> Export JSON
                          </button>
                        </div>

                        <div className="setting-row">
                          <div>
                            <h3>Seed Comprehensive Demo Dataset</h3>
                            <p>
                              Loads representative research, engineering, and
                              audio sessions for immediate product evaluation
                              and verification.
                            </p>
                          </div>
                          <button
                            className="secondary"
                            onClick={() => {
                              const ds = demoState();
                              setState(ds);
                              setNotice(
                                "Seeded comprehensive demo activity data, workspaces, and traces.",
                              );
                            }}
                          >
                            <Sparkles size={16} /> Seed Demo Data
                          </button>
                        </div>

                        <div className="setting-row">
                          <div>
                            <h3>Automated 30-Day Retention Policy</h3>
                            <p>
                              All recorded visits, tab switch events, and
                              activity segments older than 30 days are
                              automatically purged daily to prevent storage
                              bloat.
                            </p>
                          </div>
                          <span
                            className="pill"
                            style={{
                              background: "#10b98122",
                              color: "#10b981",
                            }}
                          >
                            30-Day Pruning Active
                          </span>
                        </div>

                        <div className="setting-row">
                          <div>
                            <h3>Delete Activity and Saved Contexts</h3>
                            <p>
                              Permanently clears all recorded activity, session
                              history, and snapshots from this browser.
                            </p>
                          </div>
                          <button
                            className="danger"
                            onClick={() => setModal("clear")}
                          >
                            <Trash2 size={16} /> Delete data
                          </button>
                        </div>
                      </section>
                    </>
                  )}
                </div>
              )}

              <footer
                style={{
                  padding: "12px 0",
                  color: "#334155",
                  fontSize: 11,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <ShieldCheck size={14} />
                <span>
                  Stored on this device · Built for intentional browsing
                </span>
              </footer>
            </div>
          </main>

          {/* ══ RIGHT PANEL ════════════════════════════════════════════════ */}
          <aside className="right-panel">
            {/* Open Tabs */}
            <div>
              {(() => {
                const currentOpenTabs =
                  openTabsList.length > 0
                    ? openTabsList
                    : hud.openTabs && hud.openTabs.length > 0
                      ? hud.openTabs
                      : demo || !extension
                        ? [
                            {
                              id: 101,
                              title: "Attention and Task Switching Research",
                              url: "https://arxiv.org/abs/2104.05678",
                              domain: "arxiv.org",
                              active: true,
                            },
                            {
                              id: 102,
                              title:
                                "Google Scholar: Cognitive Load in Multitasking",
                              url: "https://scholar.google.com/scholar?q=cognitive+load",
                              domain: "scholar.google.com",
                              active: false,
                            },
                            {
                              id: 103,
                              title: "React 19 Hooks and State Reference",
                              url: "https://react.dev/reference/react",
                              domain: "react.dev",
                              active: false,
                            },
                            {
                              id: 104,
                              title: "Atentiv Repository — GitHub",
                              url: "https://github.com/atentiv/browser-intelligence",
                              domain: "github.com",
                              active: false,
                            },
                            {
                              id: 105,
                              title: "TypeScript 5.x Handbook Intro",
                              url: "https://www.typescriptlang.org/docs/handbook/intro.html",
                              domain: "typescriptlang.org",
                              active: false,
                            },
                            {
                              id: 106,
                              title: "Sprint Planning & Team Inbox",
                              url: "https://mail.google.com/mail/u/0/",
                              domain: "mail.google.com",
                              active: false,
                            },
                            {
                              id: 107,
                              title: "Figma UI / UX Design Tokens",
                              url: "https://figma.com/file/123/design-system",
                              domain: "figma.com",
                              active: false,
                            },
                            {
                              id: 108,
                              title: "Deep Focus Ambient Lo-Fi Beats",
                              url: "https://youtube.com/watch?v=lofi123",
                              domain: "youtube.com",
                              active: false,
                              audible: true,
                            },
                          ]
                        : [];

                const streams = state.streams?.length
                  ? state.streams
                  : initial().streams;

                // Pre-classify every tab into workstream and domain
                const classifiedTabs = currentOpenTabs.map((t: any) => {
                  let domain = t.domain || "";
                  if (!domain && t.url) {
                    try {
                      domain = new URL(t.url).hostname.replace(/^www\./, "");
                    } catch {}
                  }
                  let wsId = "other";
                  let wsName = "General Browsing";
                  let wsColor = "#64748b";

                  // 1. Match from activeWorkstreams in Dexie
                  if (activeWorkstreams && activeWorkstreams.length > 0) {
                    const match = activeWorkstreams.find((w: any) => {
                      const wDomains = (w.domains || "").toLowerCase();
                      const wName = (w.name || "").toLowerCase();
                      const d = domain.toLowerCase();
                      return (
                        wDomains.includes(d) ||
                        wName.includes(d) ||
                        (d && (t.title || "").toLowerCase().includes(d))
                      );
                    });
                    if (match) {
                      wsId = match.workstream_id;
                      wsName = match.name;
                      wsColor = CATEGORY_COLORS[match.category] || "#6366f1";
                    }
                  }

                  // 2. Fallback to model classify
                  if (wsId === "other" && t.url) {
                    try {
                      const best = classify(t.url, t.title || "", streams);
                      const matched = streams.find((s) => s.id === best);
                      if (matched) {
                        wsId = matched.id;
                        wsName = matched.name;
                        wsColor = matched.color || "#6366f1";
                      }
                    } catch {}
                  }

                  // 3. Smart domain heuristic
                  if (wsId === "other") {
                    const d = domain.toLowerCase();
                    if (
                      d.includes("github") ||
                      d.includes("gitlab") ||
                      d.includes("stackoverflow") ||
                      d.includes("react") ||
                      d.includes("typescript") ||
                      d.includes("localhost")
                    ) {
                      wsId = "build";
                      wsName = "Design & development";
                      wsColor = "#369989";
                    } else if (
                      d.includes("scholar") ||
                      d.includes("arxiv") ||
                      d.includes("wikipedia") ||
                      d.includes("geeksforgeeks") ||
                      d.includes("medium")
                    ) {
                      wsId = "research";
                      wsName = "Research & learning";
                      wsColor = "#7364d8";
                    } else if (
                      d.includes("mail") ||
                      d.includes("slack") ||
                      d.includes("teams") ||
                      d.includes("calendar")
                    ) {
                      wsId = "communication";
                      wsName = "Communication";
                      wsColor = "#d69a45";
                    } else if (
                      d.includes("figma") ||
                      d.includes("canva") ||
                      d.includes("notion") ||
                      d.includes("docs.google")
                    ) {
                      wsId = "creative";
                      wsName = "Docs & Creative";
                      wsColor = "#8b5cf6";
                    } else if (
                      d.includes("youtube") ||
                      d.includes("netflix") ||
                      d.includes("twitch") ||
                      d.includes("reddit") ||
                      d.includes("twitter") ||
                      d.includes("x.com")
                    ) {
                      wsId = "media";
                      wsName = "Media & Distraction";
                      wsColor = "#ef4444";
                    }
                  }

                  return {
                    ...t,
                    domain,
                    workstreamId: wsId,
                    workstreamName: wsName,
                    workstreamColor: wsColor,
                  };
                });

                // Apply live search term filter
                const filteredTabs = classifiedTabs.filter((t: any) => {
                  if (!searchTerm) return true;
                  const q = searchTerm.toLowerCase();
                  return (
                    (t.title || "").toLowerCase().includes(q) ||
                    (t.url || "").toLowerCase().includes(q) ||
                    (t.domain || "").toLowerCase().includes(q) ||
                    (t.workstreamName || "").toLowerCase().includes(q)
                  );
                });

                // Build groups based on openTabGroupBy
                const tabGroups: Array<{
                  key: string;
                  name: string;
                  color: string;
                  tabs: any[];
                }> = [];

                if (openTabGroupBy === "workstream") {
                  const map: Record<
                    string,
                    { key: string; name: string; color: string; tabs: any[] }
                  > = {};
                  filteredTabs.forEach((t: any) => {
                    if (!map[t.workstreamName]) {
                      map[t.workstreamName] = {
                        key: t.workstreamName,
                        name: t.workstreamName,
                        color: t.workstreamColor,
                        tabs: [],
                      };
                    }
                    map[t.workstreamName].tabs.push(t);
                  });
                  tabGroups.push(...Object.values(map));
                } else if (openTabGroupBy === "domain") {
                  const map: Record<
                    string,
                    { key: string; name: string; color: string; tabs: any[] }
                  > = {};
                  filteredTabs.forEach((t: any) => {
                    const dom = t.domain || "Other";
                    if (!map[dom]) {
                      map[dom] = {
                        key: dom,
                        name: dom,
                        color: "#38bdf8",
                        tabs: [],
                      };
                    }
                    map[dom].tabs.push(t);
                  });
                  tabGroups.push(...Object.values(map));
                } else {
                  tabGroups.push({
                    key: "all",
                    name: "All Open Tabs",
                    color: "#64748b",
                    tabs: filteredTabs,
                  });
                }

                return (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span className="rp-section-label">OPEN TABS</span>
                        <span className="rp-badge">
                          {currentOpenTabs.length}
                        </span>
                      </div>
                      <select
                        value={openTabGroupBy}
                        onChange={(e) =>
                          setOpenTabGroupBy(e.target.value as any)
                        }
                        style={{
                          background: "#1a1d2e",
                          border: "1px solid #252836",
                          color: "#94a3b8",
                          borderRadius: 4,
                          fontSize: 10,
                          padding: "2px 6px",
                          cursor: "pointer",
                          outline: "none",
                        }}
                      >
                        <option value="workstream">Group by Workstream</option>
                        <option value="domain">Group by Domain</option>
                        <option value="none">No Grouping (Flat)</option>
                      </select>
                    </div>

                    {currentOpenTabs.length === 0 ? (
                      <div
                        style={{
                          color: "#334155",
                          fontSize: 12,
                          textAlign: "center",
                          padding: "12px 0",
                        }}
                      >
                        No open tabs
                      </div>
                    ) : filteredTabs.length === 0 ? (
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: 11,
                          textAlign: "center",
                          padding: "12px 0",
                        }}
                      >
                        No tabs match "{searchTerm}"
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          maxHeight: 280,
                          overflowY: "auto",
                        }}
                      >
                        {tabGroups.map((grp) => {
                          const isCollapsed = !!collapsedTabGroups[grp.key];
                          return (
                            <div
                              key={grp.key}
                              style={{
                                background: "rgba(15, 23, 42, 0.4)",
                                border: "1px solid rgba(255, 255, 255, 0.05)",
                                borderRadius: 6,
                                overflow: "hidden",
                              }}
                            >
                              {/* Group Header */}
                              {openTabGroupBy !== "none" && (
                                <div
                                  onClick={() =>
                                    setCollapsedTabGroups((prev) => ({
                                      ...prev,
                                      [grp.key]: !prev[grp.key],
                                    }))
                                  }
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "5px 8px",
                                    background: "rgba(255, 255, 255, 0.02)",
                                    borderBottom: isCollapsed
                                      ? "none"
                                      : "1px solid rgba(255, 255, 255, 0.05)",
                                    cursor: "pointer",
                                    userSelect: "none",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                      minWidth: 0,
                                    }}
                                  >
                                    {isCollapsed ? (
                                      <ChevronRight
                                        size={11}
                                        style={{ color: "#64748b" }}
                                      />
                                    ) : (
                                      <ChevronDown
                                        size={11}
                                        style={{ color: "#64748b" }}
                                      />
                                    )}
                                    <span
                                      style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: "50%",
                                        background: grp.color,
                                        flexShrink: 0,
                                      }}
                                    />
                                    <span
                                      style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: "#cbd5e1",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                      title={grp.name}
                                    >
                                      {grp.name}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 9,
                                        background: "rgba(255, 255, 255, 0.08)",
                                        color: "#94a3b8",
                                        borderRadius: 9999,
                                        padding: "1px 5px",
                                      }}
                                    >
                                      {grp.tabs.length}
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openSnapshotModal(undefined, {
                                        name: `${grp.name} Workspace`,
                                        tabs: grp.tabs.map((t) => ({
                                          title: t.title || t.url,
                                          url: t.url,
                                        })),
                                      });
                                    }}
                                    style={{
                                      background: "transparent",
                                      border: "none",
                                      color: "#8b5cf6",
                                      fontSize: 10,
                                      cursor: "pointer",
                                      padding: "1px 4px",
                                      borderRadius: 3,
                                    }}
                                    title="Save this workstream as a snapshot"
                                  >
                                    + Save
                                  </button>
                                </div>
                              )}

                              {/* Tab Items */}
                              {!isCollapsed &&
                                grp.tabs.map((t: any, i: number) => (
                                  <div
                                    key={t.id ?? i}
                                    onClick={() => {
                                      if (
                                        t.id &&
                                        typeof chrome !== "undefined" &&
                                        chrome.tabs?.update
                                      ) {
                                        chrome.tabs.update(t.id, {
                                          active: true,
                                        });
                                      }
                                    }}
                                    style={{
                                      fontSize: 11,
                                      color: t.active ? "#f8fafc" : "#94a3b8",
                                      padding: "5px 8px",
                                      borderBottom:
                                        i === grp.tabs.length - 1
                                          ? "none"
                                          : "1px solid rgba(255, 255, 255, 0.02)",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                      background: t.active
                                        ? "rgba(16, 185, 129, 0.06)"
                                        : "transparent",
                                      transition: "background 0.12s",
                                    }}
                                    title={t.title || t.url}
                                  >
                                    {t.active ? (
                                      <span
                                        style={{
                                          width: 5,
                                          height: 5,
                                          borderRadius: "50%",
                                          background: "#10b981",
                                          boxShadow:
                                            "0 0 6px rgba(16, 185, 129, 0.8)",
                                          flexShrink: 0,
                                        }}
                                      />
                                    ) : (
                                      <Globe
                                        size={11}
                                        style={{
                                          flexShrink: 0,
                                          color: "#64748b",
                                        }}
                                      />
                                    )}
                                    <span
                                      style={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        flex: 1,
                                        minWidth: 0,
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {t.title || t.url}
                                    </span>
                                    {t.audible && (
                                      <span
                                        title="Playing audio"
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Volume2
                                          size={11}
                                          style={{
                                            flexShrink: 0,
                                            color: "#f59e0b",
                                          }}
                                        />
                                      </span>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (
                                          t.id &&
                                          typeof chrome !== "undefined" &&
                                          chrome.tabs?.remove
                                        ) {
                                          chrome.tabs.remove(t.id);
                                          setOpenTabsList((prev) =>
                                            prev.filter((p) => p.id !== t.id),
                                          );
                                        }
                                      }}
                                      style={{
                                        background: "transparent",
                                        border: "none",
                                        color: "#475569",
                                        cursor: "pointer",
                                        padding: 0,
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                      title="Close tab"
                                    >
                                      <X size={11} />
                                    </button>
                                  </div>
                                ))}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Tab Groups */}
            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="rp-section-label">TAB GROUPS</span>
                  <span className="rp-badge">{state.snapshots.length}</span>
                </div>
                <button
                  onClick={() => openSnapshotModal()}
                  style={{
                    background: "#7c3aed22",
                    border: "1px solid #7c3aed44",
                    color: "#8b5cf6",
                    borderRadius: 4,
                    fontSize: 10,
                    padding: "2px 8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                  title="Save current open tabs into a new group"
                >
                  <Plus size={10} /> New Group
                </button>
              </div>

              {state.snapshots.length === 0 ? (
                <div
                  style={{
                    color: "#475569",
                    fontSize: 11,
                    textAlign: "center",
                    padding: "10px 0",
                    background: "rgba(255,255,255,0.01)",
                    borderRadius: 6,
                    border: "1px dashed #1e293b",
                  }}
                >
                  No saved groups. Click <strong>+ New Group</strong> to save a
                  workspace.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    maxHeight: 180,
                    overflowY: "auto",
                  }}
                >
                  {state.snapshots.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid #1e293b",
                        borderRadius: 6,
                        padding: "6px 8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#e2e8f0",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={s.name}
                        >
                          {s.name}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "#64748b",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 2,
                          }}
                        >
                          <span>{s.tabs?.length || 0} tabs</span>
                          <span>•</span>
                          <span>
                            {new Date(s.created).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <button
                          onClick={async () => {
                            await call({ type: "restore", id: s.id });
                            setNotice(`Restored workspace "${s.name}".`);
                          }}
                          style={{
                            background: "rgba(16, 185, 129, 0.15)",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            color: "#10b981",
                            borderRadius: 4,
                            fontSize: 10,
                            padding: "3px 7px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                          title="Open all tabs from this group"
                        >
                          <Play size={9} /> Open
                        </button>
                        <button
                          onClick={() =>
                            call({ type: "delete_snapshot", id: s.id })
                          }
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#64748b",
                            cursor: "pointer",
                            padding: 2,
                          }}
                          title="Delete group"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div>
              <div className="rp-section-label" style={{ marginBottom: 10 }}>
                QUICK ACTIONS
              </div>
              <div className="quick-actions-grid">
                <button
                  className="quick-action-btn"
                  onClick={() => openSnapshotModal()}
                >
                  <Camera size={18} style={{ color: "#8b5cf6" }} />
                  <span>Take Snapshot</span>
                </button>
                <button
                  className="quick-action-btn"
                  onClick={async () => {
                    if (extension) {
                      try {
                        const res: any = await chrome.runtime.sendMessage({
                          type: "CLOSE_BACKGROUND_TABS",
                        });
                        setNotice(
                          `Focus Mode: closed ${res?.closedCount ?? 0} background tabs.`,
                        );
                      } catch {
                        setNotice("Focus Mode activated.");
                      }
                    }
                  }}
                >
                  <Zap size={18} style={{ color: "#ef4444" }} />
                  <span>Focus Mode</span>
                </button>
                <button
                  className="quick-action-btn"
                  onClick={handleToggleTracking}
                >
                  {isTracking ? (
                    <Pause size={18} style={{ color: "#64748b" }} />
                  ) : (
                    <Play size={18} style={{ color: "#10b981" }} />
                  )}
                  <span>{isTracking ? "Pause Tracking" : "Resume"}</span>
                </button>
                <button
                  className="quick-action-btn"
                  onClick={() =>
                    extension &&
                    chrome.tabs.create({
                      url: chrome.runtime.getURL("dashboard.html"),
                    })
                  }
                >
                  <ExternalLink size={18} style={{ color: "#64748b" }} />
                  <span>Open Dashboard</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
        {/* end content+right row */}
      </div>
      {/* end main-and-right */}

      {/* ── Decision Trace Modal ── */}
      {selectedTrace && (
        <DecisionTraceModal
          trace={selectedTrace}
          onClose={() => setSelectedTrace(null)}
        />
      )}

      {/* ── Feedback Modal ── */}
      {feedbackTarget && (
        <FeedbackModal
          domain={feedbackTarget.domain}
          currentCategory={feedbackTarget.currentCategory}
          currentActivity={feedbackTarget.currentActivity}
          currentProductivity={feedbackTarget.currentProductivity}
          onClose={() => setFeedbackTarget(null)}
          onSubmit={async (feedback) => {
            await call({
              type: "USER_FEEDBACK",
              domain: feedbackTarget.domain,
              sessionId: feedbackTarget.sessionId,
              userCategory: feedback.userCategory,
              userActivity: feedback.userActivity,
              userProductivity: feedback.userProductivity,
              reason: feedback.reason,
            });
            setNotice(
              `Rule created for ${feedbackTarget.domain}. Future visits classified as ${feedback.userCategory} (${feedback.userProductivity}).`,
            );
            setFeedbackTarget(null);
          }}
        />
      )}

      {/* ── Modal Dialogs ── */}
      {modal && (
        <div className="overlay" onClick={() => setModal("")}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={modal}
          >
            <div className="section-top">
              <h2 style={{ color: "#e2e8f0" }}>
                {modal === "save"
                  ? snapshotTargetId
                    ? "Update Workspace Tabs"
                    : "Save Current Workspace"
                  : modal === "exclude"
                    ? "Excluded Websites"
                    : modal === "rules"
                      ? "Workstream Rules"
                      : modal === "clear"
                        ? "Delete All Data"
                        : "Log a Page Visit"}
              </h2>
              <button
                className="quiet icon-btn"
                onClick={() => setModal("")}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (modal === "save") {
                  const selectedTabs = availableTabs.filter((t) => t.checked);
                  if (snapshotTargetId) {
                    await call({
                      type: "update_snapshot",
                      id: snapshotTargetId,
                      name,
                      note,
                      tabs: selectedTabs,
                    });
                    setNotice(`Updated workspace "${name}".`);
                  } else {
                    await call({
                      type: "save",
                      name,
                      note,
                      tabs: selectedTabs,
                    });
                    setNotice(`Saved workspace "${name}".`);
                  }
                } else if (modal === "exclude") {
                  await call({
                    type: "settings",
                    enabled: state.enabled,
                    excluded: blocked,
                  });
                } else if (modal === "rules") {
                  await call({ type: "rules", streams: rules });
                } else if (modal === "clear") {
                  await call({ type: "clear" });
                } else if (modal === "logpage") {
                  if (logUrl.trim()) {
                    await call({
                      type: "log",
                      url: logUrl.trim(),
                      title: logTitle.trim() || logUrl.trim(),
                    });
                    setNotice(`Logged and classified: ${logUrl.trim()}`);
                  }
                }
                setModal("");
              }}
            >
              {modal === "save" && (
                <>
                  <label>
                    Workspace name
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Cognitive Load Experiment"
                    />
                  </label>
                  <label>
                    Where should you pick up?
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Continue comparing approaches..."
                    />
                  </label>
                  <div style={{ marginTop: 14 }}>
                    <div className="tab-select-helpers">
                      <span>
                        Select tabs (
                        {availableTabs.filter((t) => t.checked).length}{" "}
                        selected):
                      </span>
                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            setAvailableTabs(
                              availableTabs.map((t) => ({
                                ...t,
                                checked: true,
                              })),
                            )
                          }
                        >
                          Select all
                        </button>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() =>
                            setAvailableTabs(
                              availableTabs.map((t) => ({
                                ...t,
                                checked: false,
                              })),
                            )
                          }
                        >
                          Deselect all
                        </button>
                      </div>
                    </div>
                    <div className="tabs-checkbox-list">
                      {availableTabs.map((tab, idx) => (
                        <div
                          key={idx}
                          className="tab-checkbox-item"
                          onClick={() =>
                            setAvailableTabs(
                              availableTabs.map((t, i) =>
                                i === idx ? { ...t, checked: !t.checked } : t,
                              ),
                            )
                          }
                        >
                          <input
                            type="checkbox"
                            checked={tab.checked}
                            onChange={() => {}}
                          />
                          <span className="tab-title">{tab.title}</span>
                          <span className="tab-url">{tab.url}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {modal === "exclude" && (
                <label>
                  Domains
                  <textarea
                    value={blocked}
                    onChange={(e) => setBlocked(e.target.value)}
                    placeholder="bank.example, health.example"
                  />
                </label>
              )}
              {modal === "rules" &&
                rules
                  .filter((s) => s.id !== "other")
                  .map((s) => (
                    <fieldset key={s.id}>
                      <legend>{s.name}</legend>
                      {(["name", "domains", "keywords"] as const).map((key) => (
                        <label key={key}>
                          {key}
                          <input
                            required={key === "name"}
                            value={s[key]}
                            onChange={(e) =>
                              setRules(
                                rules.map((x) =>
                                  x.id === s.id
                                    ? { ...x, [key]: e.target.value }
                                    : x,
                                ),
                              )
                            }
                          />
                        </label>
                      ))}
                    </fieldset>
                  ))}
              {modal === "clear" && (
                <p>
                  This permanently deletes your activity and saved workspaces.
                  Rules and preferences are kept.
                </p>
              )}
              {modal === "logpage" && (
                <>
                  <div className="quick-presets">
                    {[
                      {
                        title: "GeeksforGeeks — Binary Search Tree",
                        url: "https://www.geeksforgeeks.org/binary-search-tree-data-structure/",
                      },
                      {
                        title: "Stack Overflow — TypeScript generics",
                        url: "https://stackoverflow.com/questions/typescript-generics",
                      },
                      {
                        title: "YouTube — System Architecture Lecture",
                        url: "https://youtube.com/watch?v=sys-design",
                      },
                    ].map((p) => (
                      <button
                        key={p.title}
                        type="button"
                        className="quick-preset-btn"
                        onClick={() => {
                          setLogUrl(p.url);
                          setLogTitle(p.title);
                        }}
                      >
                        + {p.title.split(" — ")[0]}
                      </button>
                    ))}
                  </div>
                  <label>
                    Page URL
                    <input
                      autoFocus
                      required
                      type="url"
                      value={logUrl}
                      onChange={(e) => setLogUrl(e.target.value)}
                      placeholder="https://example.com/article"
                    />
                  </label>
                  <label>
                    Page title (optional)
                    <input
                      value={logTitle}
                      onChange={(e) => setLogTitle(e.target.value)}
                      placeholder="e.g. GeeksforGeeks Data Structures"
                    />
                  </label>
                </>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  className="quiet"
                  onClick={() => setModal("")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={modal === "clear" ? "danger" : "primary"}
                >
                  {modal === "clear"
                    ? "Delete data"
                    : modal === "save"
                      ? snapshotTargetId
                        ? "Update workspace"
                        : "Save workspace"
                      : modal === "logpage"
                        ? "Log it"
                        : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Atentiv UI ErrorBoundary caught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 32,
            background: "#13151f",
            color: "#e2e8f0",
            minHeight: "100vh",
            fontFamily: "system-ui, sans-serif",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#1a1d2e",
              border: "1px solid #ef444455",
              borderRadius: 12,
              padding: 28,
              maxWidth: 520,
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ color: "#ef4444", margin: "0 0 10px", fontSize: 18 }}>
              Dashboard Recovery Mode
            </h2>
            <p
              style={{
                color: "#94a3b8",
                fontSize: 13,
                lineHeight: 1.5,
                marginBottom: 18,
              }}
            >
              {String(
                this.state.error?.message ||
                  this.state.error ||
                  "A client-side exception occurred.",
              )}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                style={{
                  background: "#7c3aed",
                  color: "#fff",
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                }}
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
              >
                Reload Dashboard
              </button>
              <button
                style={{
                  background: "#1e293b",
                  color: "#94a3b8",
                  border: "1px solid #334155",
                  padding: "8px 18px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                }}
                onClick={() => {
                  try {
                    localStorage.removeItem("atentiv_state");
                  } catch {}
                  window.location.reload();
                }}
              >
                Reset Local Cache
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>,
  );
}
