/**
 * Unit & Integration Tests: Audio Classification & Audio Session Tracking
 * Tests platform detection, fastText classification integration, distraction scoring,
 * and audio session lifecycle management.
 */
import test from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";

import { AudioClassifier } from "../../src/ml/audioClassifier";
import { AudioSessionManager } from "../../src/background/audioSessionManager";
import { db } from "../../src/db/database";

test("AudioClassifier: Platform Detection from URL and Title", () => {
  assert.equal(
    AudioClassifier.detectPlatform("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    "YouTube",
  );
  assert.equal(
    AudioClassifier.detectPlatform("https://music.youtube.com/watch?v=abc"),
    "YouTube Music",
  );
  assert.equal(
    AudioClassifier.detectPlatform("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"),
    "Spotify",
  );
  assert.equal(
    AudioClassifier.detectPlatform("https://soundcloud.com/artist/track"),
    "SoundCloud",
  );
  assert.equal(
    AudioClassifier.detectPlatform("https://music.apple.com/us/album/song/123"),
    "Apple Music",
  );
  assert.equal(
    AudioClassifier.detectPlatform("https://podcasts.apple.com/us/podcast/tech-talk"),
    "Apple Podcasts",
  );
  assert.equal(
    AudioClassifier.detectPlatform("https://www.twitch.tv/shroud"),
    "Twitch",
  );
  assert.equal(
    AudioClassifier.detectPlatform("https://www.netflix.com/watch/80057281"),
    "Netflix",
  );
  assert.equal(
    AudioClassifier.detectPlatform("https://meet.google.com/abc-defg-hij"),
    "Voice / Meeting",
  );
  assert.equal(
    AudioClassifier.detectPlatform("https://somewebsite.org/radio-stream.mp3"),
    "Web Audio Stream",
  );
});

test("AudioClassifier: Distraction Scoring & Acoustic Modifiers", () => {
  // 1. Educational Lecture: MIT 6.006 Algorithms -> Low distraction (<30)
  const eduResult = AudioClassifier.computeDistractionScore(
    "YouTube",
    "Education",
    "MIT 6.006 Introduction to Algorithms Lecture 01",
    0.95,
  );
  assert.equal(eduResult.isDistracting, false);
  assert.ok(eduResult.score <= 30, `Expected low distraction score, got ${eduResult.score}`);
  assert.equal(eduResult.productivity, "productive");
  assert.equal(eduResult.level, "low");

  // 2. Lo-Fi Beats for Coding -> Focus aid (<30)
  const lofiResult = AudioClassifier.computeDistractionScore(
    "Spotify",
    "Entertainment",
    "Lo-Fi Instrumental Beats for Coding & Deep Focus",
    0.85,
  );
  assert.equal(lofiResult.isDistracting, false);
  assert.ok(lofiResult.score <= 50, `Expected focus aid score with -35 modifier, got ${lofiResult.score}`);
  assert.match(lofiResult.reason, /ambient\/instrumental focus aid/);

  // 3. Gaming stream / Stand-Up comedy -> High distraction (>=65)
  const gamingResult = AudioClassifier.computeDistractionScore(
    "Twitch",
    "Entertainment",
    "GTA V Funny Moments & Reaction Comedy Stream",
    0.92,
  );
  assert.equal(gamingResult.isDistracting, true);
  assert.ok(gamingResult.score >= 70, `Expected high distraction score, got ${gamingResult.score}`);
  assert.equal(gamingResult.productivity, "distracting");
  assert.equal(gamingResult.level, "high");
});

test("AudioClassifier: Full Audio Classification Pipeline", async () => {
  const result = await AudioClassifier.classifyAudio(
    "https://www.youtube.com/watch?v=lecture",
    "Harvard CS50 - Introduction to Computer Science Lecture",
  );

  assert.equal(result.platform, "YouTube");
  assert.ok(result.category.length > 0);
  assert.ok(typeof result.distractionScore === "number");
  assert.ok(result.distractionScore >= 0 && result.distractionScore <= 100);
  assert.ok(result.distractionReason.includes("YouTube"));
});

test("AudioSessionManager: Full Audio Session Lifecycle & DB Persistence", async () => {
  // Mock Chrome tabs and storage
  const mockTabs: any[] = [
    {
      id: 991,
      windowId: 1,
      url: "https://open.spotify.com/playlist/coding-lofi",
      title: "Lo-Fi Instrumental Beats for Coding",
      audible: true, // Playing audio!
      incognito: false,
    },
    {
      id: 992,
      windowId: 1,
      url: "https://github.com/facebook/react",
      title: "GitHub - React",
      audible: false,
      incognito: false,
    },
  ];

  const sessionStore: Record<string, any> = {};

  (globalThis as any).chrome = {
    tabs: {
      query: async () => mockTabs,
    },
    storage: {
      session: {
        set: async (obj: any) => Object.assign(sessionStore, obj),
        get: async (k: string) => sessionStore[k],
      },
    },
  };

  try {
    // 1. Reconcile: should discover audible tab #991
    await AudioSessionManager.reconcileAudioTabs();

    const activeSessions = AudioSessionManager.getActiveSessions();
    assert.equal(activeSessions.length, 1, "Should have 1 active audio session");

    const session = activeSessions[0];
    assert.equal(session.tabId, 991);
    assert.equal(session.platform, "Spotify");
    assert.equal(session.isAudible, true);
    assert.ok(session.distractionScore <= 50, "Lo-fi beats should have low/moderate distraction score");

    // Verify session was persisted in Dexie tab_sessions
    const saved = await db.tab_sessions.get(session.sessionId);
    assert.ok(saved, "Audio session record must exist in database");
    assert.equal(saved.is_audio_session, true);
    assert.equal(saved.audio_platform, "Spotify");
    assert.equal(saved.distraction_score, session.distractionScore);

    // 2. Second tick: accumulate dwell time
    await new Promise((r) => setTimeout(r, 10));
    await AudioSessionManager.reconcileAudioTabs();

    // 3. User pauses the audio (tab becomes inaudible)
    mockTabs[0].audible = false;
    await AudioSessionManager.reconcileAudioTabs();

    const closedActive = AudioSessionManager.getActiveSessions();
    assert.equal(closedActive.length, 0, "Active audio session should be closed after pause");

    const finalRecord = await db.tab_sessions.get(session.sessionId);
    assert.ok(finalRecord, "Closed record still exists in database");
  } finally {
    delete (globalThis as any).chrome;
  }
});
