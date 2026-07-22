const baseUrl = process.env.NEXORA_BASE_URL || "http://127.0.0.1:4000";
const email = process.env.NEXORA_ADMIN_EMAIL || "ofir@nexora.ai";
const password = process.env.NEXORA_ADMIN_PASSWORD || "nexora-demo";

async function expectResponse(path, options = {}, expectedType) {
  const response = await fetch(`${baseUrl}${path}`, {
    signal: AbortSignal.timeout(5_000),
    ...options,
  });
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  const contentType = response.headers.get("content-type") || "";
  if (expectedType && !contentType.includes(expectedType)) {
    throw new Error(`${path} returned ${contentType || "an unknown content type"}`);
  }
  return response;
}

const health = await expectResponse("/api/health", {}, "application/json");
const healthPayload = await health.json();
if (healthPayload.status !== "healthy") throw new Error("Health check did not report healthy.");

const login = await expectResponse("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
}, "application/json");
const session = await login.json();
if (!session.token) throw new Error("Login response did not include a token.");

const headers = { Authorization: `Bearer ${session.token}` };
for (const path of [
  "/api/dashboard",
  "/api/ops/tasks",
  "/api/ops/fleet",
  "/api/ops/employees",
  "/api/ops/sites",
  "/api/customers",
  "/api/invoices",
  "/api/automations",
  "/api/admin/system",
  "/api/users",
]) {
  await expectResponse(path, { headers }, "application/json");
}

for (const path of ["/", "/work", "/business", "/ai", "/tasks", "/plans", "/team"]) {
  const response = await expectResponse(path, {}, "text/html");
  const html = await response.text();
  if (!html.includes("<title>Nexora</title>")) throw new Error(`${path} did not return the Nexora app shell.`);
}

await expectResponse("/manifest.webmanifest", {}, "application/manifest+json");
await expectResponse("/sw.js", {}, "javascript");

console.log(`Nexora smoke test passed against ${baseUrl}`);
