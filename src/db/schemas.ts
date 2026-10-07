/**
 * Atentiv Database Schemas
 * Type definitions matching Atentiv SRS v2.0 Section 5 and Master Implementation Requirements.
 */

export type ProductivityType = "productive" | "neutral" | "distracting";

export interface DomainRecord {
  id?: number;
  domain: string;
  category: string;
  productivity_type: ProductivityType;
  keywords: string[];
  default_activity: string;
  source: "curated" | "user" | "learned";
  confidence: number;
  user_override: boolean;
  created_at: number;
  updated_at: number;
}

export interface TabSessionRecord {
  session_id: string;
  tab_id: number;
  window_id: number;
  url: string;
  domain: string;
  title: string;
  start_time: number;
  end_time: number;
  dwell_time: number; // active dwell time in ms
  active_time: number; // accumulated focused interaction in ms
  idle_time: number; // idle/away duration in ms
  category: string;
  activity_type: string;
  productivity_type: ProductivityType;
  productivity_score: number; // -1 to +1 or 0 to 100
  workstream_id: string;
  workstream_name: string;
  classification_confidence: number;
  classification_latency_ms: number;
  model_version: string;
  created_at: number;
}

export interface ActivityRecord {
  activity_id: string;
  session_id: string;
  category: string;
  activity_type: string;
  productivity_type: ProductivityType;
  productivity_score: number;
  confidence: number;
  evidence_summary: string;
  created_at: number;
}

export interface WorkstreamRecord {
  workstream_id: string;
  name: string;
  category: string;
  centroid?: number[]; // fastText sentence vector dimension 50
  created_at: number;
  updated_at: number;
  first_seen: number;
  last_active: number;
  total_active_seconds: number;
  confidence: number;
  status: "active" | "archived";
}

export interface WorkstreamEventRecord {
  id?: number;
  workstream_id: string;
  session_id: string;
  entered_at: number;
  exited_at: number;
  duration: number;
  previous_workstream_id: string | null;
  switch_penalty: number;
}

export interface SavedTabEntry {
  url: string;
  title: string;
  favicon?: string;
  category?: string;
}

export interface SnapshotRecord {
  snapshot_id: string;
  title: string;
  workstream_id: string;
  saved_tabs: SavedTabEntry[];
  window_layout?: string;
  timestamp: number;
}

export interface UserRuleCondition {
  domain_exact?: string;
  domain_wildcard?: string;
  url_path_prefix?: string;
  title_contains?: string | string[];
  title_regex?: string;
  heading_contains?: string | string[];
  page_category?: string;
  time_of_day_start?: number; // hour 0-23
  time_of_day_end?: number;
  day_of_week?: number[]; // 0=Sun..6=Sat
}

export interface UserRuleAction {
  category?: string;
  activity_type?: string;
  productivity_type?: ProductivityType;
  productivity_score?: number;
  force_workstream?: string;
  exclude_from_tracking?: boolean;
  mark_as_private?: boolean;
}

export interface UserRuleRecord {
  rule_id: string;
  name: string;
  enabled: boolean;
  priority: number; // Higher number = higher priority
  condition: UserRuleCondition;
  action: UserRuleAction;
  created_at: number;
  updated_at: number;
}

export interface UserFeedbackRecord {
  feedback_id: string;
  session_id: string;
  input_features: Record<string, unknown>;
  predicted_category: string;
  predicted_activity: string;
  predicted_productivity: ProductivityType;
  user_category: string;
  user_activity: string;
  user_productivity: ProductivityType;
  user_workstream?: string;
  reason: string;
  timestamp: number;
  model_version: string;
}

export interface DecisionTraceRecord {
  decision_id: string;
  session_id: string;
  timestamp: number;
  rule_matches: Array<{ rule_id: string; name: string; priority: number }>;
  domain_match: { domain: string; category?: string; activity?: string } | null;
  keyword_matches: string[];
  model_predictions: Array<{ label: string; score: number }>;
  model_confidence: number;
  selected_activity: string;
  selected_productivity: ProductivityType;
  selected_workstream: string;
  workstream_scores: Record<string, number>;
  final_reason: string[];
  model_version: string;
  feature_schema_version: string;
  total_latency_ms: number;
}

export interface FocusMetricRecord {
  id?: number;
  period: string; // "today" | "week" | "YYYY-MM-DD"
  productive_seconds: number;
  neutral_seconds: number;
  distracting_seconds: number;
  switch_count: number;
  switch_penalty: number;
  focus_score: number; // 0 to 100
  workstream_stability: number; // 0.0 to 1.0
  created_at: number;
}

export interface SettingRecord {
  key: string;
  value: unknown;
  updated_at: number;
}

export interface ModelRegistryRecord {
  model_id: string;
  version: string;
  checksum: string;
  size: number;
  active: boolean;
  metrics: Record<string, unknown>;
  configuration: Record<string, unknown>;
  created_at: number;
}

export interface FeatureSnapshotRecord {
  id: string;
  session_id: string;
  url_hash: string;
  title_tokens: string[];
  heading_tokens: string[];
  language?: string;
  meta_excerpt?: string;
  created_at: number;
}

// ─── ATLAS Event-Driven Engine Schemas ──────────────────────────────────────

export type AtlasTrackingState = "STOPPED" | "RECORDING" | "IDLE_CANDIDATE" | "IDLE" | "PAUSED";

export type BrowserEventType =
  | "TAB_ACTIVATED"
  | "TAB_DEACTIVATED"
  | "TAB_CREATED"
  | "TAB_CLOSED"
  | "TAB_UPDATED"
  | "WINDOW_FOCUS"
  | "WINDOW_BLUR"
  | "IDLE_START"
  | "IDLE_END";

export interface BrowserEventRecord {
  event_id: string;
  timestamp: number;
  event_type: BrowserEventType;
  tab_id: number;
  window_id: number;
  previous_tab_id: number | null;
  new_tab_id: number | null;
  url?: string;
  title?: string;
}

export interface ActivitySegmentRecord {
  segment_id: string;
  tab_id: number;
  domain: string;
  url: string;
  title: string;
  start: number;
  end: number;
  active_seconds: number;
  idle_seconds: number;
  category: string;
  activity: string;
  productivity: ProductivityType;
  workstream_id: string;
  workstream_name: string;
  confidence: number;
  model_version: string;
  is_tentative?: boolean;
}

export type SwitchBurdenLevel = "low" | "medium" | "high";

export interface TabSwitchEventRecord {
  switch_id: string;
  timestamp: number;
  previous_tab_id: number;
  new_tab_id: number;
  previous_domain: string;
  new_domain: string;
  switch_duration_before: number; // dwell time on previous tab
  switch_burden: SwitchBurdenLevel;
  switch_burden_score: number; // 0 to 100
  workstream_switched: boolean;
}

