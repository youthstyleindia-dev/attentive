/**
 * Workstream Map — Connected Tab Visualization
 * Visualizes tabs linked together into cohesive tasks (SRS 4.2).
 */
import React from "react";
import { Layers, Globe, ExternalLink, ArrowRight } from "lucide-react";
import type { TabSessionRecord, WorkstreamRecord } from "../db/schemas";

interface WorkstreamMapProps {
  workstreams: WorkstreamRecord[];
  sessions: TabSessionRecord[];
  onOpenTab?: (url: string) => void;
}

export function WorkstreamMap({ workstreams, sessions, onOpenTab }: WorkstreamMapProps) {
  // Group sessions by workstream
  const grouped: Record<string, TabSessionRecord[]> = {};
  for (const s of sessions) {
    const wsId = s.workstream_id || "unassigned";
    if (!grouped[wsId]) grouped[wsId] = [];
    grouped[wsId].push(s);
  }

  const categoryColors: Record<string, string> = {
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

  return (
    <div className="workstream-map-container">
      <div className="section-top">
        <div>
          <h2>Workstream Connected Tab Map</h2>
          <p>Visualizing how visited pages and active research threads connect into unified tasks.</p>
        </div>
        <span className="pill">{workstreams.length} Active Workstreams</span>
      </div>

      <div className="workstream-grid-cards">
        {workstreams.map((ws) => {
          const wsSessions = grouped[ws.workstream_id] || [];
          const uniqueDomains = Array.from(new Set(wsSessions.map((s) => s.domain)));
          const catColor = categoryColors[ws.category] || "#6366f1";
          const totalActiveSecs = wsSessions.length > 0
            ? Math.round(wsSessions.reduce((acc, s) => acc + s.dwell_time, 0) / 1000)
            : (ws.total_active_seconds && wsSessions.length > 0 ? ws.total_active_seconds : 0);

          return (
            <div key={ws.workstream_id} className="card ws-card">
              <div className="ws-card-header">
                <div className="ws-title-group">
                  <span className="ws-badge" style={{ backgroundColor: `${catColor}20`, color: catColor }}>
                    <Layers size={13} />
                    <span>{ws.category}</span>
                  </span>
                  <h3>{ws.name}</h3>
                </div>
                <div className="ws-meta">
                  <span>{totalActiveSecs < 60 ? `${totalActiveSecs}s` : `${Math.floor(totalActiveSecs / 60)}m`} active</span>
                  <span>·</span>
                  <span>{wsSessions.length} pages</span>
                </div>
              </div>

              {uniqueDomains.length > 0 && (
                <div className="ws-domains">
                  {uniqueDomains.slice(0, 4).map((d) => (
                    <span key={d} className="domain-chip">
                      <Globe size={11} /> {d}
                    </span>
                  ))}
                  {uniqueDomains.length > 4 && <span className="domain-chip-more">+{uniqueDomains.length - 4} more</span>}
                </div>
              )}

              <div className="ws-trail">
                <div className="trail-label">ACTIVITY THREAD</div>
                {wsSessions.length > 0 ? (
                  <div className="trail-list">
                    {wsSessions.slice(-4).reverse().map((s, idx) => (
                      <div key={s.session_id || idx} className="trail-item">
                        <span className="trail-dot" style={{ backgroundColor: catColor }} />
                        <div className="trail-info">
                          <span className="trail-title" title={s.title}>{s.title || s.domain}</span>
                          <span className="trail-sub">
                            {s.domain} · {s.activity_type} · {Math.round(s.dwell_time / 1000)}s
                          </span>
                        </div>
                        {onOpenTab && s.url && (
                          <button
                            className="quiet icon-btn trail-open"
                            title="Open tab"
                            onClick={() => onOpenTab(s.url)}
                          >
                            <ExternalLink size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="trail-empty">No active pages in this thread yet.</p>
                )}
              </div>
            </div>
          );
        })}

        {workstreams.length === 0 && (
          <div className="empty">
            <Layers size={36} />
            <h3>No Workstreams Detected Yet</h3>
            <p>Browse normally or explore the demo. Connected web pages will be grouped here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}
