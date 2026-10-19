import { test as base, expect, type Page } from "@playwright/test";
import { installTauriMock, type IpcCall, type MockState } from "./tauri-mock";

type MockSnapshot = { calls: IpcCall[]; errors: string[]; state: MockState };

export async function readMock(page: Page): Promise<MockSnapshot> {
  return page.evaluate(() => (window as unknown as { __orbitMock: MockSnapshot }).__orbitMock);
}

export async function expectIpc(page: Page, command: string, args: Record<string, unknown>) {
  await expect.poll(async () => (await readMock(page)).calls
    .filter((call) => call.command === command).map((call) => call.args),
  { message: `Expected exact caller payload for ${command}` }).toContainEqual(args);
}

export async function navigate(page: Page, name: string) {
  const button = page.getByRole("navigation", { name: "Navegación principal" }).getByRole("button", { name, exact: true });
  await button.click();
  await expect(button).toHaveAttribute("aria-current", "page");
}

export const test = base.extend<{ app: Page }>({
  app: async ({ page, context }, use, testInfo) => {
    const browserErrors: string[] = [];
    const externalRequests: string[] = [];
    const local = (url: string) => ["127.0.0.1", "localhost", "[::1]"].includes(new URL(url).hostname);
    page.on("pageerror", (error) => browserErrors.push(error.stack ?? error.message));
    page.on("console", (message) => { if (message.type() === "error") browserErrors.push(message.text()); });
    page.on("crash", () => browserErrors.push("Browser page crashed"));
    await context.route("**/*", async (route) => {
      if (local(route.request().url())) await route.continue();
      else {
        externalRequests.push(route.request().url());
        await route.abort("blockedbyclient");
      }
    });
    await context.routeWebSocket("**/*", (socket) => {
      if (local(socket.url())) socket.connectToServer();
      else { externalRequests.push(socket.url()); socket.close(); }
    });
    await page.addInitScript(installTauriMock);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Tu billetera");
    await expect(page.getByRole("button", { name: "Nueva cuenta", exact: true })).toBeEnabled();
    try {
      await use(page);
    } finally {
      const snapshot = await readMock(page);
      if (testInfo.status !== testInfo.expectedStatus || browserErrors.length || snapshot.errors.length || externalRequests.length) {
        await testInfo.attach("browser-and-ipc-diagnostics", {
          body: JSON.stringify({ browserErrors, externalRequests, ...snapshot }, null, 2),
          contentType: "application/json",
        });
      }
      expect(browserErrors, "No uncaught exceptions, rejected promises, crashes, or console errors").toEqual([]);
      expect(snapshot.errors, "All invoked commands must be implemented by the mock").toEqual([]);
      expect(externalRequests, "The app must not fetch remote fonts, APIs, or other resources").toEqual([]);
    }
  },
});

export { expect };
