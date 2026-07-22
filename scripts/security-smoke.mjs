import { createHmac } from "node:crypto";

const baseUrl = process.env.NEXORA_BASE_URL || "http://127.0.0.1:4000";
const secret = process.env.NEXORA_AUTH_SECRET || "nexora-local-development-secret";
const email = process.env.NEXORA_ADMIN_EMAIL || "ofir@nexora.ai";
const password = process.env.NEXORA_ADMIN_PASSWORD || "nexora-demo";

function sign(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

async function request(path, token, expectedStatus = 200) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal: AbortSignal.timeout(5_000),
  });
  if (response.status !== expectedStatus) throw new Error(`${path} returned ${response.status}; expected ${expectedStatus}`);
  return response;
}

const login = await fetch(`${baseUrl}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
  signal: AbortSignal.timeout(5_000),
});
if (!login.ok) throw new Error(`Login returned ${login.status}`);
if (login.headers.get("x-powered-by")) throw new Error("Server exposes the Express signature.");
if (!login.headers.get("x-content-type-options")) throw new Error("Security headers are missing.");
const admin = await login.json();
if (!admin.workspaceId) throw new Error("Login response does not identify a workspace.");

await request("/api/dashboard", admin.token);
await request("/api/dashboard", null, 401);

const common = { email: "operator@nexora.test", expiresAt: Date.now() + 60_000 };
const operator = sign({ ...common, role: "Operator", workspaceId: admin.workspaceId });
await request("/api/ops/tasks", operator);
await request("/api/users", operator, 403);
await request("/api/invoices", operator, 403);

const finance = sign({ ...common, role: "Finance", workspaceId: admin.workspaceId });
const automationRun = await fetch(`${baseUrl}/api/automations/run`, { method: "POST", headers: { Authorization: `Bearer ${finance}`, "Content-Type": "application/json" }, body: "{}", signal: AbortSignal.timeout(5_000) });
if (automationRun.status !== 403) throw new Error(`Finance automation run returned ${automationRun.status}; expected 403`);
await request("/api/admin/system", finance, 403);

const otherAdmin = sign({ ...common, role: "Admin", workspaceId: "workspace-isolation-test" });
for (const path of ["/api/customers", "/api/ops/tasks", "/api/users"]) {
  const response = await request(path, otherAdmin);
  const records = await response.json();
  if (!Array.isArray(records) || records.length !== 0) throw new Error(`${path} leaked records across workspaces.`);
}
const isolatedSystem = await (await request("/api/admin/system", otherAdmin)).json();
if (Object.values(isolatedSystem.records).some((count) => count !== 0)) throw new Error("System status leaked workspace record counts.");

const invalidInvoice = await fetch(`${baseUrl}/api/invoices`, { method: "POST", headers: { Authorization: `Bearer ${admin.token}`, "Content-Type": "application/json" }, body: JSON.stringify({ status: "Draft", items: [] }), signal: AbortSignal.timeout(5_000) });
if (invalidInvoice.status !== 400) throw new Error(`Invalid invoice returned ${invalidInvoice.status}; expected 400`);

const localTasks = await (await request("/api/ops/tasks", admin.token)).json();
if (localTasks[0]) await request(`/api/ops/tasks/${localTasks[0].id}`, otherAdmin, 404);
await request("/api/files/not-a-real-file.jpg", otherAdmin, 404);

console.log(`Nexora security smoke test passed against ${baseUrl}`);
