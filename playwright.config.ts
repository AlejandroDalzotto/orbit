import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  globalTimeout: 120_000,
  expect: { timeout: 7_000 },
  // The existing *.local ignore rule keeps artifacts out of Git without editing .gitignore.
  outputDir: "test-results/e2e.local",
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:1420",
    browserName: "chromium",
    channel: "msedge",
    viewport: { width: 1400, height: 1000 },
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
    colorScheme: "dark",
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "bun run dev --host 127.0.0.1",
    url: "http://127.0.0.1:1420",
    reuseExistingServer: false,
    timeout: 30_000,
    // Playwright owns the process tree, including on failure/timeout (taskkill on Windows).
    gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
  },
});
