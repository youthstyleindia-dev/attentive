export type Stream = {
  id: string;
  name: string;
  color: string;
  keywords: string;
  domains: string;
};

export type Visit = {
  id: string;
  title: string;
  url: string;
  stream: string;
  start: number;
  end: number;
  tabId: number;
  switched: boolean;
  category?: string;
  activity?: string;
  productivity?: "productive" | "neutral" | "distracting";
};

export type Snapshot = {
  id: string;
  name: string;
  note: string;
  created: number;
  tabs: { title: string; url: string; favicon?: string }[];
};

export type State = {
  enabled: boolean;
  streams: Stream[];
  visits: Visit[];
  snapshots: Snapshot[];
  excluded: string;
  goal: string;
  goalEnd: number;
  goalStream: string;
  productiveDomains: string[];
  unproductiveDomains: string[];
  idleThresholdSeconds: number;
  idleSeconds: number;
  isIdle: boolean;
};

export const DEFAULT_PRODUCTIVE_DOMAINS = [
  "geeksforgeeks.org",
  "wikipedia.org",
  "docs.google.com",
  "github.com",
  "stackoverflow.com",
  "arxiv.org",
  "scholar.google.com",
  "react.dev",
  "typescriptlang.org",
  "canva.com",
  "notion.so",
  "developer.chrome.com",
  "developer.mozilla.org",
  "chatgpt.com",
  "claude.ai",
];

export const DEFAULT_UNPRODUCTIVE_DOMAINS = [
  "youtube.com",
  "reddit.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "netflix.com",
  "twitch.tv",
];

export const initial = (): State => ({
  enabled: true,
  streams: [
    {
      id: "research",
      name: "Research & learning",
      color: "#7364d8",
      keywords: "research,paper,study,arxiv,learning,tutorial",
      domains: "scholar.google.com,arxiv.org,wikipedia.org,geeksforgeeks.org",
    },
    {
      id: "build",
      name: "Design & development",
      color: "#369989",
      keywords: "code,react,typescript,design,github,documentation",
      domains: "github.com,stackoverflow.com,developer.chrome.com,figma.com,canva.com",
    },
    {
      id: "communication",
      name: "Communication",
      color: "#d69a45",
      keywords: "mail,slack,inbox,meeting",
      domains: "mail.google.com,slack.com",
    },
    {
      id: "other",
      name: "Unsorted",
      color: "#9a9daa",
      keywords: "",
      domains: "",
    },
  ],
  visits: [],
  snapshots: [],
  excluded: "",
  goal: "",
  goalEnd: 0,
  goalStream: "research",
  productiveDomains: [...DEFAULT_PRODUCTIVE_DOMAINS],
  unproductiveDomains: [...DEFAULT_UNPRODUCTIVE_DOMAINS],
  idleThresholdSeconds: 180, // 3 minutes inactivity threshold
  idleSeconds: 0,
  isIdle: false,
});

export function safeUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (!["http:", "https:"].includes(u.protocol)) return null;
    u.username = "";
    u.password = "";
    u.search = "";
    u.hash = "";
    return u.href;
  } catch {
    return null;
  }
}

export const tokens = (s: string) =>
  s
    .toLowerCase()
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

export function excluded(url: string, rules: string) {
  const host = new URL(url).hostname;
  return tokens(rules).some((d) => host === d || host.endsWith("." + d));
}

export function isDomainMatch(hostname: string, domainList: string[]): boolean {
  const cleanHost = hostname.toLowerCase().replace(/^www\./, "");
  return domainList.some((d) => {
    const cleanD = d.toLowerCase().replace(/^www\./, "");
    return cleanHost === cleanD || cleanHost.endsWith("." + cleanD);
  });
}

export function classify(
  url: string,
  title: string,
  streams: Stream[],
): string {
  const host = new URL(url).hostname;
  const text = (host + " " + title).toLowerCase();
  let best = "other",
    score = 0;
  for (const s of streams) {
    const points =
      tokens(s.domains).reduce(
        (n, d) => n + (host === d || host.endsWith("." + d) ? 5 : 0),
        0,
      ) +
      tokens(s.keywords).reduce((n, k) => n + (text.includes(k) ? 1 : 0), 0);
    if (points > score) {
      score = points;
      best = s.id;
    }
  }
  return best;
}

export interface MetricsResult {
  total: number;
  switches: number;
  durations: Record<string, number>;
  domainDurations: Record<string, number>;
  hourlySwitches: number[];
  domainTimeline: Array<{
    domain: string;
    duration: number;
    category: string;
    productivity: "productive" | "neutral" | "distracting";
    pageCount: number;
  }>;
  productiveTime: number;
  unproductiveTime: number;
  neutralTime: number;
  idleTime: number;
  netProductiveTime: number;
  activeCoverage: number;
  penalty: number;
  idlePenalty: number;
  score: number | null;
}

export function metrics(
  visits: Visit[],
  from: number,
  to: number,
  goalStream?: string,
  productiveDomains?: string[],
  unproductiveDomains?: string[],
  idleSeconds = 0,
): MetricsResult {
  const v = visits.filter((v) => v.end > from && v.start < to);
  const durations: Record<string, number> = {};
  const domainDurations: Record<string, number> = {};
  const domainMeta: Record<
    string,
    { category: string; productivity: "productive" | "neutral" | "distracting"; pageCount: number }
  > = {};
  const hourlySwitches = Array<number>(24).fill(0);

  let total = 0;
  let switches = 0;
  let productiveTime = 0;
  let unproductiveTime = 0;
  let neutralTime = 0;

  const prodList = productiveDomains ?? [];
  const unprodList = unproductiveDomains ?? [];

  for (const x of v) {
    const ms = Math.max(0, Math.min(to, x.end) - Math.max(from, x.start));
    total += ms;
    durations[x.stream] = (durations[x.stream] || 0) + ms;

    let dom = "";
    try {
      dom = new URL(x.url).hostname.replace(/^www\./, "");
    } catch {
      dom = x.url;
    }
    domainDurations[dom] = (domainDurations[dom] || 0) + ms;

    // Determine productivity
    let prod: "productive" | "neutral" | "distracting" = x.productivity || "productive";
    if (prodList.length > 0 || unprodList.length > 0) {
      if (isDomainMatch(dom, prodList)) {
        prod = "productive";
      } else if (isDomainMatch(dom, unprodList)) {
        prod = "distracting";
      }
    }

    if (!domainMeta[dom]) {
      domainMeta[dom] = {
        category: x.category || x.stream,
        productivity: prod,
        pageCount: 0,
      };
    }
    domainMeta[dom].pageCount += 1;

    if (prod === "productive") {
      productiveTime += ms;
    } else if (prod === "distracting") {
      unproductiveTime += ms;
    } else {
      neutralTime += ms;
    }

    // Pure tab switch detection
    if (x.switched && x.start >= from) {
      switches++;
      const hour = new Date(x.start).getHours();
      if (hour >= 0 && hour < 24) {
        hourlySwitches[hour] = (hourlySwitches[hour] || 0) + 1;
      }
    }
  }

  // Sites visited grouped by domain, sorted in ascending order of time
  const domainTimeline = Object.entries(domainDurations)
    .map(([dom, dur]) => ({
      domain: dom,
      duration: dur,
      category: domainMeta[dom]?.category || "General",
      productivity: domainMeta[dom]?.productivity || "productive",
      pageCount: domainMeta[dom]?.pageCount || 1,
    }))
    .sort((a, b) => a.duration - b.duration); // Ascending order as requested!

  const penalty = Math.min(40, switches * 2);
  const idlePenalty = Math.min(20, Math.floor(idleSeconds / 180) * 2);
  const netProductiveTime = productiveTime - unproductiveTime;
  const idleMs = idleSeconds * 1000;
  const activeCoverage = total + idleMs > 0 ? Math.round((total / (total + idleMs)) * 1000) / 10 : 100;

  let score: number | null = null;
  if (total > 0) {
    if (productiveDomains !== undefined && unproductiveDomains !== undefined) {
      // ATLAS Uncoupled Focus Score: 100 * P / (P + U)
      // Idle duration does NOT pollute the denominator; Active Coverage reports away-time instead
      if (productiveTime + unproductiveTime > 0) {
        score = Math.round((100 * productiveTime) / (productiveTime + unproductiveTime));
      } else {
        score = 50;
      }
    } else {
      // Baseline backward-compatible dominant stream formula
      const dominant = goalStream
        ? durations[goalStream] || 0
        : Math.max(0, ...Object.values(durations));
      score = Math.round(Math.max(0, (100 * dominant) / total - penalty));
    }
  }

  return {
    total,
    switches,
    durations,
    domainDurations,
    hourlySwitches,
    domainTimeline,
    productiveTime,
    unproductiveTime,
    neutralTime,
    idleTime: idleMs,
    netProductiveTime,
    activeCoverage,
    penalty,
    idlePenalty,
    score,
  };
}

export function demoState(): State {
  const s = initial();
  const now = Date.now();
  let t = now - 120 * 60000;
  const seq = [
    [
      "research",
      32,
      "Attention and task switching — research notes",
      "https://arxiv.org/abs/2104.05678",
      "Education",
      "Paper Reading",
      "productive",
    ],
    [
      "build",
      24,
      "React documentation",
      "https://react.dev/reference/react",
      "Technology",
      "Framework Reference",
      "productive",
    ],
    [
      "communication",
      4,
      "Team inbox",
      "https://mail.google.com/mail/u/0/",
      "Chat",
      "Email",
      "neutral",
    ],
    [
      "build",
      30,
      "Atentiv — GitHub",
      "https://github.com/atentiv/browser-intelligence",
      "Technology",
      "Coding",
      "productive",
    ],
    [
      "research",
      18,
      "Browser activity research",
      "https://scholar.google.com/scholar?q=cognitive+load",
      "Education",
      "Literature Search",
      "productive",
    ],
    [
      "build",
      12,
      "TypeScript handbook",
      "https://www.typescriptlang.org/docs/handbook/intro.html",
      "Technology",
      "Documentation Reading",
      "productive",
    ],
  ] as const;

  seq.forEach(([stream, min, title, url, cat, act, prod], i) => {
    s.visits.push({
      id: String(i),
      title,
      url,
      stream,
      start: t,
      end: t + min * 60000,
      tabId: i + 1,
      switched: i > 0, // pure tab switch
      category: cat,
      activity: act,
      productivity: prod as "productive" | "neutral" | "distracting",
    });
    t += min * 60000;
  });

  s.snapshots = [
    {
      id: "demo",
      name: "Browser attention research",
      note: "Continue comparing task-centric tab management approaches. Next: outline the evaluation plan.",
      created: now - 3600000,
      tabs: [
        { title: "Research library", url: "https://scholar.google.com/" },
        {
          title: "Implementation notes",
          url: "https://developer.chrome.com/docs/extensions/",
        },
        {
          title: "TypeScript Handbook",
          url: "https://www.typescriptlang.org/docs/",
        },
      ],
    },
  ];
  return s;
}
