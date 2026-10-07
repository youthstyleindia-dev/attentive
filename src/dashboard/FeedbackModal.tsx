/**
 * User Feedback Modal — Personalization Loop
 * Allows correcting category, activity, and productivity to create instant user rules (Section 35).
 */
import React, { useState } from "react";
import { X, Check, Edit3 } from "lucide-react";
import type { ProductivityType } from "../db/schemas";

interface FeedbackModalProps {
  domain: string;
  currentCategory: string;
  currentActivity: string;
  currentProductivity: ProductivityType;
  onClose: () => void;
  onSubmit: (feedback: {
    userCategory: string;
    userActivity: string;
    userProductivity: ProductivityType;
    reason: string;
  }) => Promise<void>;
}

export function FeedbackModal({
  domain,
  currentCategory,
  currentActivity,
  currentProductivity,
  onClose,
  onSubmit,
}: FeedbackModalProps) {
  const [category, setCategory] = useState(currentCategory);
  const [activity, setActivity] = useState(currentActivity);
  const [productivity, setProductivity] = useState<ProductivityType>(currentProductivity);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    "Technology", "Education", "Work", "Research", "Communication",
    "Chat", "News", "Entertainment", "Shop", "Government", "Health", "Travel", "Uncategorized"
  ];

  const activities = [
    "Coding", "Debugging", "Documentation", "Code Review",
    "Search", "Paper Reading", "Technical Research", "Reference Lookup",
    "Lecture", "Tutorial", "Course", "Practice",
    "Email", "Messaging", "Meeting", "Collaboration",
    "Planning", "Task Management", "Project Management",
    "Video", "Music", "Streaming", "Gaming",
    "Social Media", "Feed Browsing", "Community",
    "Shopping", "Product Search", "General Browsing"
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        userCategory: category,
        userActivity: activity,
        userProductivity: productivity,
        reason: reason || "User manual correction",
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Edit3 size={18} />
            <div>
              <h2>Customize Classification</h2>
              <small>Domain: <b>{domain}</b></small>
            </div>
          </div>
          <button className="quiet icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <p className="modal-intro">
            Your corrections immediately update future classification and generate high-priority personal rules for <b>{domain}</b>.
          </p>

          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Activity Type</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value)}>
              {activities.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Productivity Classification</label>
            <div className="pill-selector">
              {(["productive", "neutral", "distracting"] as ProductivityType[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  className={`pill-choice ${productivity === p ? "selected " + p : ""}`}
                  onClick={() => setProductivity(p)}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Reason / Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g., Used for computer science class"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="quiet" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary" disabled={submitting}>
              <Check size={16} /> Save Preference
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
