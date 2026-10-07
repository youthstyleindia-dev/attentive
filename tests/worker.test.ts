import "fake-indexeddb/auto";
import { test } from "node:test";
import assert from "node:assert/strict";
import { initial } from "../src/model";
test("worker opt-in, switching, idle, save/restore and deletion lifecycle", async () => {
  const local: Record<string, any> = {},
    session: Record<string, any> = {};
  const events: Record<string, Function> = {};
  const event = (key: string) => ({
    addListener: (fn: Function) => (events[key] = fn),
  });
  const storage = (obj: Record<string, any>) => ({
    get: async (key: string) => ({ [key]: structuredClone(obj[key]) }),
    set: async (v: any) => Object.assign(obj, structuredClone(v)),
    remove: async (key: string) => {
      delete obj[key];
    },
  });
  let time = 1_000_000;
  const original = Date.now;
  Date.now = () => time;
  let idle = "active",
    focused = true;
  let tab = {
    id: 1,
    url: "https://github.com/a?q=secret",
    title: "GitHub",
    incognito: false,
  };
  const opened: any[] = [];
  (globalThis as any).chrome = {
    storage: { local: storage(local), session: storage(session) },
    runtime: {
      onInstalled: event("install"),
      onStartup: event("startup"),
      onMessage: event("message"),
      getURL: (s: string) => "chrome-extension://test/" + s,
    },
    action: { onClicked: event("click") },
    alarms: { create: async () => {}, onAlarm: event("alarm") },
    idle: { queryState: async () => idle, onStateChanged: event("idle") },
    windows: {
      getLastFocused: async () => ({ focused, id: 1 }),
      onFocusChanged: event("focus"),
    },
    tabs: {
      query: async () => [tab],
      create: async (t: any) => opened.push(t),
      onActivated: event("activated"),
      onUpdated: event("updated"),
      onRemoved: event("removed"),
    },
  };
  try {
    await import("../src/background");
    const request = (msg: any) =>
      new Promise<any>((resolve) => events.message(msg, {}, resolve));
    local.state = initial();
    await request({ type: "read" });
    assert.ok(!session.active);
    await request({ type: "settings", enabled: true, excluded: "" });
    time += 10000;
    tab = { ...tab, id: 2, url: "https://wikipedia.org/", title: "Wiki" };
    await request({ type: "read" });
    time += 5000;
    let r = await request({ type: "read" });
    assert.ok(r.state.visits.length >= 1);
    idle = "idle";
    await request({ type: "read" });
    assert.ok(!session.active);
    time += 900000;
    r = await request({ type: "read" });
    // Verify visits exist and have valid dwell duration
    assert.ok(r.state.visits.length > 0);
    const durations = r.state.visits.map((v: any) => v.end - v.start);
    assert.ok(durations.some((d: number) => d >= 5000), `Durations: ${JSON.stringify(durations)}`);
    await request({ type: "save", name: "Test", note: "Resume here" });
    assert.equal(local.state.snapshots.length, 1);
    await request({ type: "restore", id: local.state.snapshots[0].id });
    assert.equal(opened.length, 1);
    await request({ type: "clear" });
    assert.equal(local.state.enabled, false);
    assert.deepEqual(local.state.visits, []);
    assert.deepEqual(local.state.snapshots, []);
  } finally {
    Date.now = original;
    delete (globalThis as any).chrome;
  }
});
