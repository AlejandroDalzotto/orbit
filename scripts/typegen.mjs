import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Cargo discovers .cargo/config.toml from its working directory, not --manifest-path.
const result = spawnSync("cargo", ["test", "export_bindings"], {
  cwd: fileURLToPath(new URL("../src-tauri/", import.meta.url)),
  stdio: "inherit",
});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
