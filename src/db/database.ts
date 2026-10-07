/**
 * AtentivDB — Dexie IndexedDB Implementation
 * Database Name: AtentivDB
 */
import Dexie, { type EntityTable } from "dexie";
import type {
  DomainRecord,
  TabSessionRecord,
  ActivityRecord,
  WorkstreamRecord,
  WorkstreamEventRecord,
  SnapshotRecord,
  UserRuleRecord,
  UserFeedbackRecord,
  DecisionTraceRecord,
  FocusMetricRecord,
  SettingRecord,
  ModelRegistryRecord,
  FeatureSnapshotRecord,
  BrowserEventRecord,
  ActivitySegmentRecord,
  TabSwitchEventRecord,
} from "./schemas";

export class AtentivDatabase extends Dexie {
  domains!: EntityTable<DomainRecord, "id">;
  tab_sessions!: EntityTable<TabSessionRecord, "session_id">;
  activities!: EntityTable<ActivityRecord, "activity_id">;
  workstreams!: EntityTable<WorkstreamRecord, "workstream_id">;
  workstream_events!: EntityTable<WorkstreamEventRecord, "id">;
  snapshots!: EntityTable<SnapshotRecord, "snapshot_id">;
  rules!: EntityTable<UserRuleRecord, "rule_id">;
  user_feedback!: EntityTable<UserFeedbackRecord, "feedback_id">;
  decision_traces!: EntityTable<DecisionTraceRecord, "decision_id">;
  focus_metrics!: EntityTable<FocusMetricRecord, "id">;
  settings!: EntityTable<SettingRecord, "key">;
  model_registry!: EntityTable<ModelRegistryRecord, "model_id">;
  feature_snapshots!: EntityTable<FeatureSnapshotRecord, "id">;
  browser_events!: EntityTable<BrowserEventRecord, "event_id">;
  activity_segments!: EntityTable<ActivitySegmentRecord, "segment_id">;
  tab_switch_events!: EntityTable<TabSwitchEventRecord, "switch_id">;

  constructor() {
    super("AtentivDB");

    // Version 1: Core Atentiv SRS Schema
    this.version(1).stores({
      domains: "++id, &domain, category, productivity_type, source, user_override, created_at, updated_at",
      tab_sessions: "&session_id, tab_id, window_id, domain, start_time, end_time, category, activity_type, productivity_type, workstream_id, created_at",
      activities: "&activity_id, session_id, category, activity_type, productivity_type, created_at",
      workstreams: "&workstream_id, name, category, status, last_active, created_at",
      workstream_events: "++id, workstream_id, session_id, entered_at, exited_at",
      snapshots: "&snapshot_id, title, workstream_id, timestamp",
      rules: "&rule_id, name, enabled, priority, created_at",
      user_feedback: "&feedback_id, session_id, timestamp",
      decision_traces: "&decision_id, session_id, timestamp, selected_workstream",
      focus_metrics: "++id, &period, focus_score, created_at",
      settings: "&key, updated_at",
      model_registry: "&model_id, version, active, created_at",
      feature_snapshots: "&id, session_id, url_hash, created_at",
    });

    // Version 2: ATLAS Event Pipeline and Activity Segmentation
    this.version(2).stores({
      domains: "++id, &domain, category, productivity_type, source, user_override, created_at, updated_at",
      tab_sessions: "&session_id, tab_id, window_id, domain, start_time, end_time, category, activity_type, productivity_type, workstream_id, created_at",
      activities: "&activity_id, session_id, category, activity_type, productivity_type, created_at",
      workstreams: "&workstream_id, name, category, status, last_active, created_at",
      workstream_events: "++id, workstream_id, session_id, entered_at, exited_at",
      snapshots: "&snapshot_id, title, workstream_id, timestamp",
      rules: "&rule_id, name, enabled, priority, created_at",
      user_feedback: "&feedback_id, session_id, timestamp",
      decision_traces: "&decision_id, session_id, timestamp, selected_workstream",
      focus_metrics: "++id, &period, focus_score, created_at",
      settings: "&key, updated_at",
      model_registry: "&model_id, version, active, created_at",
      feature_snapshots: "&id, session_id, url_hash, created_at",
      browser_events: "&event_id, event_type, timestamp, tab_id, window_id",
      activity_segments: "&segment_id, tab_id, domain, start, end, productivity, workstream_id",
      tab_switch_events: "&switch_id, timestamp, previous_tab_id, new_tab_id, switch_burden",
    });
  }
}

export const db = new AtentivDatabase();
