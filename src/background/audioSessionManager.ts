/**
 * Atentiv Audio Session Manager — Background Service Worker
 * Detects audible media tabs across the browser, creates persistent audio sessions,
 * evaluates distraction using fastText ML classification, and maintains audio dwell time.
 */
import { db } from "../db/database";
import { SessionRepository } from "../db/repositories/sessionRepository";
import { ExclusionEngine } from "../privacy/exclusionEngine";
import { AudioClassifier, type AudioClassificationResult, type AudioPlatform } from "../ml/audioClassifier";
import type { TabSessionRecord, ProductivityType } from "../db/schemas";

export interface ActiveAudioSession {
  sessionId: string;
  tabId: number;
  windowId: number;
  url: string;
  domain: string;
  title: string;
  platform: AudioPlatform;
  category: string;
  confidence: number;
  distractionScore: number;
  isDistracting: boolean;
  distractionLevel: "low" | "moderate" | "high";
  distractionReason: string;
  productivityType: ProductivityType;
  startTime: number;
  lastTick: number;
  audibleDwellMs: number;
  isAudible: boolean;
}

export class AudioSessionManager {
  private static activeSessions = new Map<number, ActiveAudioSession>();

  /**
   * Retrieves all currently active audio sessions across any open browser tabs.
   */
  static getActiveSessions(): ActiveAudioSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Retrieves the latest active audio session, or null if no tabs are playing audio.
   */
  static getLatestActiveSession(): ActiveAudioSession | null {
    const list = this.getActiveSessions();
    if (list.length === 0) return null;
    return list[list.length - 1];
  }

  /**
   * Scans open tabs for audible audio playback and syncs sessions with the database.
   */
  static async reconcileAudioTabs(): Promise<void> {
    if (typeof chrome === "undefined" || !chrome.tabs?.query) {
      return;
    }

    const now = Date.now();

    try {
      // Query all open tabs to check which ones are actively playing sound (audible = true)
      const allTabs = await chrome.tabs.query({});
      const audibleTabs = allTabs.filter(
        (t) => Boolean(t.audible) && Boolean(t.url) && !t.incognito,
      );

      const currentAudibleIds = new Set<number>();

      for (const tab of audibleTabs) {
        if (!tab.id || !tab.url) continue;

        // Skip restricted internal browser schemes
        if (!tab.url.startsWith("http://") && !tab.url.startsWith("https://")) {
          continue;
        }

        currentAudibleIds.add(tab.id);

        const existing = this.activeSessions.get(tab.id);

        if (existing) {
          // Tab is already tracked: accumulate dwell time
          const elapsed = Math.min(now - existing.lastTick, 60000);
          if (elapsed > 0) {
            existing.audibleDwellMs += elapsed;
            existing.lastTick = now;
            await SessionRepository.updateDwell(existing.sessionId, elapsed, now);
          }
        } else {
          // Newly audible tab! Run Audio Classifier with fastText ML
          let domain = "";
          try {
            domain = new URL(tab.url).hostname.replace(/^www\./, "");
          } catch {
            domain = "audio-media";
          }

          const classification: AudioClassificationResult =
            await AudioClassifier.classifyAudio(tab.url, tab.title || "");

          const sessionId = crypto.randomUUID();

          const newAudioRecord: TabSessionRecord = {
            session_id: sessionId,
            tab_id: tab.id,
            window_id: tab.windowId || 0,
            url: ExclusionEngine.sanitizeUrl(tab.url),
            domain,
            title: tab.title || `${classification.platform} Audio Stream`,
            start_time: now,
            end_time: now,
            dwell_time: 0,
            active_time: 0,
            idle_time: 0,
            category: classification.category,
            activity_type: `Audio: ${classification.platform}`,
            productivity_type: classification.productivityType,
            productivity_score: 100 - classification.distractionScore,
            workstream_id: "audio-playback",
            workstream_name: `${classification.platform} Audio`,
            classification_confidence: classification.confidence,
            classification_latency_ms: 1,
            model_version: classification.modelVersion,
            is_audio_session: true,
            audio_platform: classification.platform,
            distraction_score: classification.distractionScore,
            is_distracting: classification.isDistracting,
            distraction_reason: classification.distractionReason,
            created_at: now,
          };

          await db.tab_sessions.put(newAudioRecord);

          const activeEntry: ActiveAudioSession = {
            sessionId,
            tabId: tab.id,
            windowId: tab.windowId || 0,
            url: tab.url,
            domain,
            title: tab.title || `${classification.platform} Audio Stream`,
            platform: classification.platform,
            category: classification.category,
            confidence: classification.confidence,
            distractionScore: classification.distractionScore,
            isDistracting: classification.isDistracting,
            distractionLevel: classification.distractionLevel,
            distractionReason: classification.distractionReason,
            productivityType: classification.productivityType,
            startTime: now,
            lastTick: now,
            audibleDwellMs: 0,
            isAudible: true,
          };

          this.activeSessions.set(tab.id, activeEntry);
        }
      }

      // Detect tabs that stopped playing audio or were closed
      for (const [tabId, session] of this.activeSessions.entries()) {
        if (!currentAudibleIds.has(tabId)) {
          // Audio paused or stopped
          const finalElapsed = Math.min(now - session.lastTick, 60000);
          if (finalElapsed > 0) {
            await SessionRepository.updateDwell(session.sessionId, finalElapsed, now);
          }
          await SessionRepository.close(session.sessionId, now);
          this.activeSessions.delete(tabId);
        }
      }

      // Persist snapshot to chrome.storage.session for HUD & popup reactivity
      if (chrome.storage?.session?.set) {
        await chrome.storage.session
          .set({
            activeAudioSessions: this.getActiveSessions(),
          })
          .catch(() => {});
      }
    } catch (e) {
      console.error("Atentiv AudioSessionManager Error:", e);
    }
  }

  /**
   * Explicitly closes an audio session when a tab is closed.
   */
  static async handleTabRemoved(tabId: number): Promise<void> {
    const session = this.activeSessions.get(tabId);
    if (!session) return;

    const now = Date.now();
    const elapsed = Math.min(now - session.lastTick, 60000);
    if (elapsed > 0) {
      await SessionRepository.updateDwell(session.sessionId, elapsed, now);
    }
    await SessionRepository.close(session.sessionId, now);
    this.activeSessions.delete(tabId);

    if (chrome.storage?.session?.set) {
      await chrome.storage.session
        .set({
          activeAudioSessions: this.getActiveSessions(),
        })
        .catch(() => {});
    }
  }
}
