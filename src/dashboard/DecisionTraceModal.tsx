/**
 * Decision Trace Modal — Explainable Intelligence Inspector
 * Displays full evidence breakdown, model confidence, and latencies (Section 39, 65).
 */
import React from "react";
import { X, ShieldCheck, Sparkles, Brain, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import type { DecisionTraceRecord } from "../db/schemas";

interface DecisionTraceModalProps {
  trace: DecisionTraceRecord | null;
  onClose: () => void;
}

export function DecisionTraceModal({ trace, onClose }: DecisionTraceModalProps) {
  if (!trace) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card trace-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Sparkles size={20} className="trace-sparkle" />
            <div>
              <h2>Explainable Decision Trace</h2>
              <small>Trace ID: {trace.decision_id.slice(0, 8)} · Session {trace.session_id.slice(0, 8)}</small>
            </div>
          </div>
          <button className="quiet icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="trace-body">
          {/* Final Decision Banner */}
          <div className="trace-final-card">
            <div className="trace-pill-row">
              <span className="trace-pill category-pill">
                Category: <b>{trace.model_predictions[0]?.label || "Technology"}</b>
              </span>
              <span className="trace-pill activity-pill">
                Activity: <b>{trace.selected_activity}</b>
              </span>
              <span className={`trace-pill prod-pill ${trace.selected_productivity}`}>
                Productivity: <b>{trace.selected_productivity}</b>
              </span>
              <span className="trace-pill ws-pill">
                Workstream: <b>{trace.selected_workstream}</b>
              </span>
            </div>

            <div className="trace-latency-badge">
              <Clock size={13} />
              <span>Total Inference: <b>{trace.total_latency_ms} ms</b></span>
            </div>
          </div>

          {/* Evidence Sections */}
          <div className="trace-sections">
            {/* 1. Rule & Privacy Evidence */}
            <div className="trace-section">
              <h4>
                <ShieldCheck size={16} /> Rule & Domain Basis
              </h4>
              {trace.rule_matches && trace.rule_matches.length > 0 ? (
                <div className="evidence-box success">
                  <CheckCircle2 size={15} />
                  <div>
                    <strong>User Rule Matched (Top Precedence):</strong>
                    {trace.rule_matches.map((r) => (
                      <p key={r.rule_id}>
                        {r.name} (Priority {r.priority})
                      </p>
                    ))}
                  </div>
                </div>
              ) : trace.domain_match ? (
                <div className="evidence-box info">
                  <CheckCircle2 size={15} />
                  <div>
                    <strong>Curated Domain Match:</strong>
                    <p>
                      {trace.domain_match.domain} matched category &apos;{trace.domain_match.category}&apos; (Activity: {trace.domain_match.activity})
                    </p>
                  </div>
                </div>
              ) : (
                <p className="no-evidence">No pre-set domain rule matched; evaluated via local ML pipeline.</p>
              )}
            </div>

            {/* 2. FastText ML Model Predictions */}
            <div className="trace-section">
              <h4>
                <Brain size={16} /> Local fastText ML Classifier Evidence
              </h4>
              <div className="model-version-note">
                Model: <b>atentiv-page-category v{trace.model_version}</b> (Quantized WebAssembly, Loss: ova)
              </div>
              <div className="predictions-list">
                {trace.model_predictions.map((p, idx) => (
                  <div key={p.label || idx} className="pred-row">
                    <span className="pred-label">{p.label}</span>
                    <div className="pred-bar-bg">
                      <div className="pred-bar-fill" style={{ width: `${Math.min(100, Math.round(p.score * 100))}%` }} />
                    </div>
                    <span className="pred-score">{(p.score * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Keyword Evidence */}
            {trace.keyword_matches && trace.keyword_matches.length > 0 && (
              <div className="trace-section">
                <h4>Keywords Extracted</h4>
                <div className="keyword-chip-list">
                  {trace.keyword_matches.map((kw) => (
                    <span key={kw} className="keyword-chip">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Synthesized Decision Reasons */}
            <div className="trace-section">
              <h4>Decision Rationale</h4>
              <ul className="reasons-list">
                {trace.final_reason.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="primary" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
