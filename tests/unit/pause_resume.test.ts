import "fake-indexeddb/auto";
import { test } from "node:test";
import assert from "node:assert/strict";

const local: Record<string, any> = {};
const session: Record<string, any> = {};
const storage = (obj: Record<string, any>) => ({
  get: async (key: string | string[]) => {
    if (Array.isArray(key)) {
      const res: Record<string, any> = {};
      for (const k of key) res[k] = structuredClone(obj[k]);
      return res;
    }
    return { [key]: structuredClone(obj[key]) };
  },
  set: async (v: any) => Object.assign(obj, structuredClone(v)),
  remove: async (key: string) => {
    delete obj[key];
  },
});

(globalThis as any).chrome = {
  storage: { local: storage(local), session: storage(session) },
  runtime: {
    sendMessage: async () => ({}),
    getURL: (s: string) => "chrome-extension://test/" + s,
  },
  tabs: {
    query: async () => [{ id: 1, url: "https://github.com", title: "GitHub", active: true }],
    create: async () => ({ id: 2 }),
  },
  windows: {
    getLastFocused: async () => ({ id: 1, focused: true }),
  },
  idle: {
    queryState: async () => "active",
  },
};

import { MessageRouter } from "../../src/background/messageRouter";

test("Pause & Resume: TOGGLE_RECORDING accurately toggles state and updates status", async () => {
  // Test pause toggle
  const pauseRes = await (MessageRouter as any).handleMessage({
    type: "TOGGLE_RECORDING",
    enabled: false,
  });

  assert.equal(pauseRes.success, true);
  assert.equal(pauseRes.enabled, false);
  assert.equal(pauseRes.state.enabled, false);

  const hudStatePaused = await (MessageRouter as any).handleMessage({
    type: "GET_HUD_STATE",
  });

  assert.equal(hudStatePaused.status.isEnabled, false);
  assert.equal(hudStatePaused.status.isPaused, true);
  assert.equal(hudStatePaused.status.state, "paused");

  // Test resume toggle
  const resumeRes = await (MessageRouter as any).handleMessage({
    type: "TOGGLE_RECORDING",
    enabled: true,
  });

  assert.equal(resumeRes.success, true);
  assert.equal(resumeRes.enabled, true);
  assert.equal(resumeRes.state.enabled, true);

  const hudStateResumed = await (MessageRouter as any).handleMessage({
    type: "GET_HUD_STATE",
  });

  assert.equal(hudStateResumed.status.isEnabled, true);
  assert.equal(hudStateResumed.status.isPaused, false);
});

test("Snapshot Management: delete_snapshot alias removes snapshot without errors", async () => {
  const deleteRes = await (MessageRouter as any).handleMessage({
    type: "delete_snapshot",
    id: "non-existent-snap-id",
  });

  assert.equal(deleteRes.success, true);
  assert.ok(deleteRes.state);
});
