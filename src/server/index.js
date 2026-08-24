// Load our server dependencies...
import express from "express";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { setDefaultAspects, ROOT_DIR } from "../helpers.js";
import { setupRoutes } from "./routing/index.js";
import { watchForRebuild } from "./watcher.js";
import { setupCaddy, startCaddy } from "./caddy/caddy.js";
import { setupTemplating } from "./templating.js";
import { scheduleContainerCheck } from "./docker/sleep-check.js";
import { applyMigrations } from "./database/utils.js";

const PORT = process.env.PORT ?? 8000;
const { WEB_EDITOR_HOSTNAME, DOCKER_EXECUTABLE = `docker`, WEB_EDITOR_IMAGE_NAME = `local-base-image` } = process.env;

// Ensure the Docker base image exists every time the server starts.
// Without it, no project containers can build. This recovers from
// docker system prune or a fresh server without needing to re-run setup.js.
(function ensureBaseImage() {
  try {
    execSync(`${DOCKER_EXECUTABLE} image inspect ${WEB_EDITOR_IMAGE_NAME}`, { stdio: `ignore` });
  } catch {
    console.log(`[startup] Base image "${WEB_EDITOR_IMAGE_NAME}" not found — building now...`);
    execSync(`${DOCKER_EXECUTABLE} build -t ${WEB_EDITOR_IMAGE_NAME} src/server/docker/`, { stdio: `inherit` });
    console.log(`[startup] Base image built.`);
  }
})();

// Prevent unhandled promise rejections from crashing the server.
// One broken project (e.g. missing Docker image) should not take down everything.
process.on(`unhandledRejection`, (reason) => {
  console.error(`Unhandled promise rejection (server kept running):`, reason);
});

// Set up the server:
const app = express();
setupTemplating(app);
setDefaultAspects(app);
const server = setupRoutes(app);

server.listen(PORT, async () => {
  // Ensure the database is up to date
  await applyMigrations(join(ROOT_DIR, `data`, `data.sqlite3`));

  // Generate the server address notice
  const msg = `=   Server running on https://${WEB_EDITOR_HOSTNAME}   =`;
  const line = `=`.repeat(msg.length);
  const mid = `=${` `.repeat(msg.length - 2)}=`;
  console.log([``, line, mid, msg, mid, line, ``].join(`\n`));
  watchForRebuild();
  setupCaddy();
  startCaddy();
  scheduleContainerCheck();
});
