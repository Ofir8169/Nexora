import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function loadLocalEnvironment() {
  if (!existsSync(".env")) return process.env;

  const additions = Object.fromEntries(
    readFileSync(".env", "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
        return [key, value];
      })
  );

  return { ...additions, ...process.env };
}

async function hasHealthyBusinessServer() {
  try {
    const response = await fetch("http://127.0.0.1:4000/api/health", {
      signal: AbortSignal.timeout(800),
    });
    if (!response.ok) return false;
    const health = await response.json();
    return health.server === "Nexora Business OS" && health.apiVersion >= 2;
  } catch {
    return false;
  }
}

async function inspectClient(port) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/`, {
      signal: AbortSignal.timeout(650),
    });
    const html = await response.text();
    return {
      occupied: true,
      compatible:
        response.ok &&
        response.headers.get("content-type")?.includes("text/html") &&
        html.includes("<title>Nexora</title>"),
    };
  } catch {
    return { occupied: false, compatible: false };
  }
}

async function resolveClientPort() {
  const preferred = await inspectClient(5173);
  if (preferred.compatible) return { port: 5173, reuse: true };
  if (!preferred.occupied) return { port: 5173, reuse: false };

  for (let port = 5174; port <= 5180; port += 1) {
    const candidate = await inspectClient(port);
    if (candidate.compatible) return { port, reuse: true };
    if (!candidate.occupied) return { port, reuse: false };
  }

  throw new Error("No free development port was found between 5173 and 5180.");
}

const reuseBusinessServer = await hasHealthyBusinessServer();
const clientTarget = await resolveClientPort();
const server = reuseBusinessServer
  ? null
  : spawn(process.execPath, ["server/server.js"], {
      stdio: "inherit",
      env: loadLocalEnvironment(),
    });

if (reuseBusinessServer) {
  console.log("Using a compatible Nexora API already running on port 4000.");
}

const client = clientTarget.reuse
  ? null
  : spawn(
      npmCommand,
      ["exec", "vite", "--", "--port", String(clientTarget.port), "--strictPort", ...process.argv.slice(2)],
      { stdio: "inherit" }
    );

if (clientTarget.reuse) {
  console.log(`Using a compatible Nexora interface already running on port ${clientTarget.port}.`);
}

if (!server && !client) {
  console.log(`Nexora is already running at http://127.0.0.1:${clientTarget.port}/`);
  process.exit(0);
}

let stopping = false;

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;

  if (server && !server.killed) server.kill("SIGTERM");
  if (client && !client.killed) client.kill("SIGTERM");

  process.exitCode = exitCode;
}

server?.on("exit", (code, signal) => {
  if (!stopping) {
    console.error(
      `Business server stopped unexpectedly (${signal ?? `code ${code ?? 1}`}).`
    );
    stop(code ?? 1);
  }
});

client?.on("exit", (code, signal) => {
  if (!stopping) {
    if (code && code !== 0) {
      console.error(
        `Vite stopped unexpectedly (${signal ?? `code ${code}`}).`
      );
    }
    stop(code ?? 0);
  }
});

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
