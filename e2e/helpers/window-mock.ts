import type { Page } from "@playwright/test";
import type { IpcCall } from "./tauri-mock";

export type WindowCommand = "is_maximized" | "minimize" | "toggle_maximize" | "close";
type WindowOptions = { hold?: WindowCommand | null; fail?: WindowCommand | null; maximized?: boolean };
type WindowSnapshot = {
  calls: IpcCall[];
  maximized: boolean;
  minimized: boolean;
  closed: boolean;
  listeners: { event: string; eventId: number; handler: number }[];
  unregistered: { event: string; eventId: number }[];
};
interface NativeMockWindow extends Window {
  isTauri: boolean;
  __TAURI_INTERNALS__: {
    invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown>;
    metadata: { currentWindow: { label: string } };
    transformCallback: (callback: (event: unknown) => void, once?: boolean) => number;
  };
  __TAURI_EVENT_PLUGIN_INTERNALS__: { unregisterListener: (event: string, eventId: number) => void };
  __orbitMock: { calls: IpcCall[] };
  __windowMock: WindowSnapshot & {
    options: WindowOptions;
    callbacks: Map<number, (event: unknown) => void>;
    release?: () => void;
  };
}

// Browser IPC integration only: the real installed Tauri SDK builds every call.
// No OS window behavior is simulated beyond the state returned by these commands.
export async function installWindowMock(page: Page, options: WindowOptions = {}) {
  await page.evaluate((options) => {
    const browser = window as unknown as NativeMockWindow;
    if (browser.__windowMock) throw new Error("Window mock already installed");
    const original = browser.__TAURI_INTERNALS__.invoke;
    let nextCallback = 1000;
    let nextEvent = 1;
    const control: NativeMockWindow["__windowMock"] = {
      calls: [], maximized: options.maximized ?? false, minimized: false, closed: false,
      listeners: [], unregistered: [], callbacks: new Map(), options,
    };
    browser.__windowMock = control;
    browser.isTauri = true;
    browser.__TAURI_INTERNALS__.metadata = { currentWindow: { label: "main" } };
    browser.__TAURI_INTERNALS__.transformCallback = (callback, once = false) => {
      const id = nextCallback++;
      control.callbacks.set(id, (event) => {
        if (once) control.callbacks.delete(id);
        callback(event);
      });
      return id;
    };
    browser.__TAURI_EVENT_PLUGIN_INTERNALS__ = {
      unregisterListener: (event, eventId) => {
        control.unregistered.push({ event, eventId });
        const listener = control.listeners.find((entry) => entry.event === event && entry.eventId === eventId);
        if (listener) control.callbacks.delete(listener.handler);
      },
    };
    browser.__TAURI_INTERNALS__.invoke = async (command, args = {}) => {
      if (!command.startsWith("plugin:window|") && !command.startsWith("plugin:event|")) return original(command, args);
      const call = { command, args: structuredClone(args) };
      control.calls.push(call);
      browser.__orbitMock.calls.push(call);
      if (command === "plugin:event|listen") {
        if (args.event !== "tauri://resize" || JSON.stringify(args.target) !== JSON.stringify({ kind: "Window", label: "main" }) || !control.callbacks.has(args.handler as number)) {
          throw new Error(`Unexpected event subscription: ${JSON.stringify(args)}`);
        }
        const eventId = nextEvent++;
        control.listeners.push({ event: args.event as string, eventId, handler: args.handler as number });
        return eventId;
      }
      if (command === "plugin:event|unlisten") {
        control.listeners = control.listeners.filter((entry) => entry.eventId !== args.eventId);
        return;
      }
      if (!["is_maximized", "minimize", "toggle_maximize", "close"].some((name) => command === `plugin:window|${name}`) || JSON.stringify(args) !== JSON.stringify({ label: "main" })) {
        throw new Error(`Unexpected window command: ${JSON.stringify(call)}`);
      }
      const action = command.slice("plugin:window|".length);
      if (control.options.hold === action) await new Promise<void>((resolve) => { control.release = resolve; });
      if (control.options.fail === action) throw { message: `Window ${action} rejected` };
      if (action === "is_maximized") return control.maximized;
      if (action === "toggle_maximize") control.maximized = !control.maximized;
      if (action === "minimize") control.minimized = true;
      if (action === "close") control.closed = true;
    };
  }, options);
}

export async function readWindowMock(page: Page): Promise<WindowSnapshot> {
  return page.evaluate(() => {
    const { calls, maximized, minimized, closed, listeners, unregistered } = (window as unknown as NativeMockWindow).__windowMock;
    return { calls, maximized, minimized, closed, listeners, unregistered };
  });
}

export async function configureWindowMock(page: Page, options: WindowOptions) {
  await page.evaluate((options) => Object.assign((window as unknown as NativeMockWindow).__windowMock.options, options), options);
}

export async function releaseWindowMock(page: Page) {
  await page.evaluate(() => {
    const control = (window as unknown as NativeMockWindow).__windowMock;
    if (!control.release) throw new Error("No pending window command");
    control.release();
    delete control.release;
  });
}

export async function emitWindowResize(page: Page, maximized: boolean) {
  await page.evaluate((maximized) => {
    const control = (window as unknown as NativeMockWindow).__windowMock;
    control.maximized = maximized;
    for (const listener of control.listeners) {
      control.callbacks.get(listener.handler)?.({ event: listener.event, id: listener.eventId, payload: { width: 1400, height: 1000 } });
    }
  }, maximized);
}
