import { afterEach, expect, mock, test } from "bun:test";
import { columnReveal, IncomeParticles, NetColumns } from "./analytics-primitives";

const restore = [];
afterEach(() => { for (const reset of restore.splice(0)) reset(); });

const data = [
  { time: "2026-01-01", value: 40 },
  { time: "2026-02-01", value: 70 },
  { time: "2026-03-01", value: -20 },
];

function attachment() {
  const state = { pan: 0, factor: 1, spacing: 50, range: { from: 0, to: 2 } };
  const requestUpdate = mock(() => {});
  return {
    state, requestUpdate,
    chart: { timeScale: () => ({
      getVisibleLogicalRange: () => state.range,
      options: () => ({ barSpacing: state.spacing }),
      timeToCoordinate: (time) => data.findIndex((row) => row.time === time) * state.spacing + 10 + state.pan,
    }) },
    series: { priceToCoordinate: (price) => 100 - price * state.factor },
  };
}

function canvas() {
  const calls = [];
  const context = {
    save() {}, restore() {}, beginPath() {}, closePath() {},
    moveTo(x, y) { calls.push(["move", x, y]); },
    lineTo(x, y) { calls.push(["line", x, y]); },
    clip() { calls.push(["clip"]); },
    arc(x, y, radius) { calls.push(["dot", x, y, radius]); },
    fill() {},
    stroke() { calls.push(["glow", context.lineWidth, context.shadowBlur]); calls.push(["ink", context.strokeStyle, context.shadowColor]); },
    fillRect(x, y, width, height) { calls.push(["column", x, y, width, height, context.globalAlpha]); calls.push(["fill", context.fillStyle]); },
    createLinearGradient(x1, y1, x2, y2) { calls.push(["gradient", y1, y2]); return { addColorStop(stop, color) { calls.push(["stop", stop, color]); } }; },
  };
  return { calls, target: { useMediaCoordinateSpace(draw) { draw({ context, mediaSize: { width: 140, height: 140 } }); } } };
}

function frameClock() {
  const frames = new Map();
  let id = 0;
  const originalRequest = Object.getOwnPropertyDescriptor(globalThis, "requestAnimationFrame");
  const originalCancel = Object.getOwnPropertyDescriptor(globalThis, "cancelAnimationFrame");
  const request = mock((callback) => { frames.set(++id, callback); return id; });
  const cancel = mock((frame) => frames.delete(frame));
  Object.defineProperty(globalThis, "requestAnimationFrame", { configurable: true, writable: true, value: request });
  Object.defineProperty(globalThis, "cancelAnimationFrame", { configurable: true, writable: true, value: cancel });
  restore.push(() => {
    if (originalRequest) Object.defineProperty(globalThis, "requestAnimationFrame", originalRequest); else delete globalThis.requestAnimationFrame;
    if (originalCancel) Object.defineProperty(globalThis, "cancelAnimationFrame", originalCancel); else delete globalThis.cancelAnimationFrame;
  });
  return { frames, request, cancel, tick(time) { const pending = [...frames.values()]; frames.clear(); for (const callback of pending) callback(time); } };
}

test("income stipple clips to canonical line coordinates and fades toward the pane bottom", () => {
  const primitive = new IncomeParticles(data, "#ffffff");
  primitive.attached(attachment());
  primitive.updateAllViews();
  const { calls, target } = canvas();
  primitive.draw(target);
  expect(calls).toContainEqual(["line", 10, 60]);
  expect(calls).toContainEqual(["line", 60, 30]);
  expect(calls).toContainEqual(["line", 110, 120]);
  expect(calls.findIndex(([kind]) => kind === "clip")).toBeLessThan(calls.findIndex(([kind]) => kind === "dot"));
  expect(calls).toContainEqual(["stop", 1, "rgba(255,255,255,0)"]);
  expect(calls).toContainEqual(["glow", 1, 5]);
  expect(primitive.paneViews()).toBe(primitive.paneViews());
  expect(primitive.zOrder()).toBe("bottom");
});

test("primitive geometry tracks time-scale pan, spacing and price-scale changes", () => {
  const api = attachment();
  const primitive = new IncomeParticles(data);
  primitive.attached(api);
  api.state.pan = -20; api.state.spacing = 60; api.state.factor = 0.5;
  primitive.updateAllViews();
  const { calls, target } = canvas();
  primitive.draw(target);
  expect(calls).toContainEqual(["line", -10, 80]);
  expect(calls).toContainEqual(["line", 50, 65]);
  expect(calls).toContainEqual(["line", 110, 110]);
  primitive.detached();
  const detached = canvas();
  primitive.draw(detached.target);
  expect(detached.calls).toHaveLength(0);
});

test("income particles update ink and glow in place for cream without changing geometry or data", () => {
  const original = structuredClone(data);
  const api = attachment();
  const primitive = new IncomeParticles(data, "#f1f0ec");
  primitive.attached(api); primitive.updateAllViews();
  const before = canvas(); primitive.draw(before.target);
  const updates = api.requestUpdate.mock.calls.length;
  primitive.setColor("#171611");
  expect(api.requestUpdate).toHaveBeenCalledTimes(updates + 1);
  const after = canvas(); primitive.draw(after.target);
  expect(after.calls).toContainEqual(["stop", 0, "rgba(23,22,17,0.38)"]);
  expect(after.calls).toContainEqual(["stop", 0.55, "rgba(23,22,17,0.1)"]);
  expect(after.calls).toContainEqual(["stop", 1, "rgba(23,22,17,0)"]);
  expect(after.calls).toContainEqual(["ink", "rgba(23,22,17,0.55)", "rgba(23,22,17,0.45)"]);
  const geometry = (calls) => calls.filter(([kind]) => ["move", "line", "dot"].includes(kind));
  expect(geometry(after.calls)).toEqual(geometry(before.calls));
  expect(data).toEqual(original);
});

test("net color changes preserve a live reveal rather than restarting it", () => {
  const clock = frameClock();
  const api = attachment();
  const primitive = new NetColumns(data, "#ffc77a", false);
  primitive.attached(api); primitive.updateAllViews();
  clock.tick(performance.now() + 310);
  const before = canvas(); primitive.draw(before.target);
  const pending = [...clock.frames.keys()];
  const updates = api.requestUpdate.mock.calls.length;
  primitive.setColor("#946000");
  expect(api.requestUpdate).toHaveBeenCalledTimes(updates + 1);
  expect([...clock.frames.keys()]).toEqual(pending);
  const after = canvas(); primitive.draw(after.target);
  expect(after.calls).toContainEqual(["fill", "#946000"]);
  expect(after.calls.filter(([kind]) => kind === "column")).toEqual(before.calls.filter(([kind]) => kind === "column"));
  primitive.detached();
});

test("column reveal has a bounded stagger and completes even for large month counts", () => {
  expect(columnReveal(0, 0, 12)).toBe(0);
  expect(columnReveal(120, 0, 12)).toBeGreaterThan(columnReveal(120, 11, 12));
  expect(columnReveal(840, 1199, 1200)).toBe(1);
  expect(columnReveal(Infinity, 0, 1)).toBe(1);
});

test("net columns rise and fade independently without changing canonical values", () => {
  const clock = frameClock();
  const original = structuredClone(data);
  const api = attachment();
  const primitive = new NetColumns(data, "#ffc77a", false);
  primitive.attached(api);
  primitive.updateAllViews();
  clock.tick(performance.now() + 310);
  const { calls, target } = canvas();
  primitive.draw(target);
  const columns = calls.filter(([kind]) => kind === "column");
  expect(columns[0][5]).toBeGreaterThan(columns[2][5]);
  expect(columns[0][5]).toBeLessThan(1);
  expect(columns[0][4]).toBeGreaterThan(0);
  expect(columns[2][2]).toBe(100); // Negative net grows downward from the zero baseline.
  expect(data).toEqual(original);
  primitive.finish();
  expect(clock.frames.size).toBe(0);
  const final = canvas(); primitive.draw(final.target);
  expect(final.calls.filter(([kind]) => kind === "column").map((row) => row[4])).toEqual([40, 70, 20]);
});

test("reduced motion never schedules animation frames and renders final columns immediately", () => {
  const clock = frameClock();
  const primitive = new NetColumns(data, "#ffc77a", true);
  primitive.attached(attachment()); primitive.updateAllViews();
  const { calls, target } = canvas(); primitive.draw(target);
  expect(clock.request).not.toHaveBeenCalled();
  expect(calls.filter(([kind]) => kind === "column").map((row) => row[5])).toEqual([1, 1, 1]);
  primitive.detached();
});

test("detaching a live reveal cancels its outstanding frame and drops drawing references", () => {
  const clock = frameClock();
  const primitive = new NetColumns(data, "#ffc77a", false);
  primitive.attached(attachment()); primitive.updateAllViews();
  expect(clock.frames.size).toBe(1);
  primitive.detached();
  expect(clock.cancel).toHaveBeenCalledTimes(1);
  expect(clock.frames.size).toBe(0);
  const { calls, target } = canvas(); primitive.draw(target);
  expect(calls).toHaveLength(0);
});
