import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

import { createCrudRouter } from "./routes/crudRoutes.js";
import { addActivity, getDatabaseStatus, readDatabase, writeDatabase } from "./database.js";
import {
  calculatePriorityScore,
  getPriorityLabel,
} from "./priority.js";

const app = express();
const port = Number(process.env.PORT) || 4000;
const authSecret = process.env.NEXORA_AUTH_SECRET || "nexora-local-development-secret";
const adminEmail = process.env.NEXORA_ADMIN_EMAIL || "ofir@nexora.ai";
const adminPassword = process.env.NEXORA_ADMIN_PASSWORD || "nexora-demo";
const defaultWorkspaceId = process.env.NEXORA_WORKSPACE_ID || "workspace-local";
const recoveryRequests = new Map();
const loginAttempts = new Map();
const automationTriggers = new Set(["INVOICE_OVERDUE", "CUSTOMER_LEAD", "TASK_CRITICAL", "INVOICE_DUE_SOON"]);
const requestBuckets = new Map();

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const clientDistDirectory = path.join(currentDirectory, "..", "dist");
const evidenceDirectory = path.join(currentDirectory, "uploads", "evidence");
const defaultOrigins = Array.from({ length: 8 }, (_, index) => 5173 + index)
  .flatMap((clientPort) => [`http://localhost:${clientPort}`, `http://127.0.0.1:${clientPort}`]);
const allowedOrigins = (process.env.NEXORA_ALLOWED_ORIGINS || defaultOrigins.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

fs.mkdirSync(evidenceDirectory, { recursive: true });

function belongsToWorkspace(item, workspaceId) {
  return (item.workspaceId ?? "workspace-local") === workspaceId;
}

function scoped(database, collectionName, workspaceId) {
  return (database[collectionName] ?? []).filter((item) => belongsToWorkspace(item, workspaceId));
}

function createRateLimiter({ limit, windowMs }) {
  return (request, response, next) => {
    const key = `${request.ip}:${request.path}`;
    const now = Date.now();
    const bucket = requestBuckets.get(key);
    const current = !bucket || bucket.resetAt <= now ? { count: 0, resetAt: now + windowMs } : bucket;
    current.count += 1;
    requestBuckets.set(key, current);
    response.setHeader("X-RateLimit-Limit", String(limit));
    response.setHeader("X-RateLimit-Remaining", String(Math.max(0, limit - current.count)));
    if (current.count > limit) {
      response.setHeader("Retry-After", String(Math.ceil((current.resetAt - now) / 1000)));
      return response.status(429).json({ message: "Too many requests. Please try again shortly." });
    }
    next();
  };
}

function calculateInvoiceTotals(invoice) {
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const normalizedItems = items.map((item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);

    return {
      ...item,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
    };
  });
  const subtotal = normalizedItems.reduce(
    (sum, item) => sum + item.total,
    0
  );
  const vatRate = Number(invoice.vatRate ?? 18);
  const vat = subtotal * (vatRate / 100);

  return {
    ...invoice,
    items: normalizedItems,
    subtotal,
    vatRate,
    vat,
    total: subtotal + vat,
  };
}

function requireText(value, label, maxLength = 240) {
  const textValue = String(value ?? "").trim();
  if (!textValue) throw new Error(`${label} is required.`);
  if (textValue.length > maxLength) throw new Error(`${label} must be ${maxLength} characters or fewer.`);
  return textValue;
}

function validateEmail(value) {
  const email = String(value ?? "").trim().toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  return email;
}

function ensureReference(database, collectionName, id, workspaceId, label, required = false) {
  if (!id) {
    if (required) throw new Error(`${label} is required.`);
    return;
  }
  if (!database[collectionName].some((item) => String(item.id) === String(id) && belongsToWorkspace(item, workspaceId))) {
    throw new Error(`${label} does not exist in this workspace.`);
  }
}

function validateCustomer(customer) {
  const statuses = new Set(["Active", "Lead", "Inactive", "Blocked"]);
  if (!statuses.has(customer.status ?? "Active")) throw new Error("Invalid customer status.");
  return { ...customer, name: requireText(customer.name, "Customer name"), company: requireText(customer.company || customer.name, "Company"), email: validateEmail(customer.email), status: customer.status ?? "Active", balance: Number(customer.balance ?? 0) };
}

function validateBusinessTask(task, database) {
  const statuses = new Set(["Open", "In Progress", "Waiting", "Done", "Cancelled"]);
  if (!statuses.has(task.status ?? "Open")) throw new Error("Invalid task status.");
  ensureReference(database, "customers", task.customerId, task.workspaceId, "Customer");
  ensureReference(database, "employees", task.assigneeId, task.workspaceId, "Assignee");
  return { ...task, title: requireText(task.title, "Task title"), description: String(task.description ?? "").slice(0, 4000), status: task.status ?? "Open" };
}

function validateInvoice(invoice, database) {
  ensureReference(database, "customers", invoice.customerId, invoice.workspaceId, "Customer", true);
  if (!Array.isArray(invoice.items) || !invoice.items.length) throw new Error("Add at least one invoice item.");
  invoice.items.forEach((item) => {
    requireText(item.description, "Invoice item description");
    if (!Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0) throw new Error("Invoice item quantity must be greater than zero.");
    if (!Number.isFinite(Number(item.unitPrice)) || Number(item.unitPrice) < 0) throw new Error("Invoice item price cannot be negative.");
  });
  return invoice;
}

app.disable("x-powered-by");
app.use((request, response, next) => {
  const requestId = request.headers["x-request-id"] || randomUUID();
  request.id = String(requestId);
  response.setHeader("X-Request-Id", requestId);
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(self), geolocation=(self), microphone=()");
  response.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.tile.openstreetmap.org https://unpkg.com; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  next();
});
app.use((request, response, next) => {
  const startedAt = performance.now();
  response.on("finish", () => {
    if (request.path.startsWith("/api") && (process.env.NEXORA_REQUEST_LOGS === "true" || response.statusCode >= 400)) {
      console.info(JSON.stringify({ level: response.statusCode >= 500 ? "error" : "info", requestId: request.id, method: request.method, path: request.path, status: response.statusCode, durationMs: Math.round(performance.now() - startedAt) }));
    }
  });
  next();
});
app.use(cors({ origin(origin, callback) {
  const localDevelopmentOrigin = /^http:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]):(?:4000|517[3-9]|5180)$/.test(origin ?? "");
  if (!origin || allowedOrigins.includes(origin) || (process.env.NODE_ENV !== "production" && localDevelopmentOrigin)) return callback(null, true);
  callback(null, false);
} }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api", (request, response) => {
  response.json({
    name: "Nexora Business OS API",
    version: "1.0.0",
    status: "online",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (request, response) => {
  try {
    const database = getDatabaseStatus();
    response.json({ status: "healthy", server: "Nexora Business OS", apiVersion: 3, capabilities: ["auth", "workspace-isolation", "team-users", "role-enforcement", "audit-log", "secure-evidence", "atomic-storage", "workspace-export", "recovery", "automations", "operations", "business"], storage: { provider: database.provider, revision: database.revision, requestedProvider: process.env.NEXORA_DATABASE_PROVIDER || "file", cloudConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) }, timestamp: new Date().toISOString() });
  } catch (error) {
    response.status(503).json({ status: "unhealthy", server: "Nexora Business OS", message: error.message, timestamp: new Date().toISOString() });
  }
});

app.post("/api/diagnostics/client-error", createRateLimiter({ limit: 20, windowMs: 60_000 }), (request, response) => {
  console.error("[Nexora client error]", {
    message: String(request.body.message ?? "Unknown client error"),
    stack: String(request.body.stack ?? "").slice(0, 4000),
    componentStack: String(request.body.componentStack ?? "").slice(0, 4000),
    path: String(request.body.path ?? "").slice(0, 500),
  });
  response.status(204).end();
});

function signToken(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", authSecret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

function verifyToken(token) {
  const [encoded, signature] = String(token ?? "").split(".");
  if (!encoded || !signature) return null;
  const expected = createHmac("sha256", authSecret).update(encoded).digest("base64url");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) return null;
  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  return payload.expiresAt > Date.now() ? payload : null;
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, encoded) {
  const [salt, stored] = String(encoded ?? "").split(":");
  if (!salt || !stored) return false;
  const candidate = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(stored, "hex");
  return candidate.length === storedBuffer.length && timingSafeEqual(candidate, storedBuffer);
}

app.post("/api/auth/login", (request, response) => {
  const email = String(request.body.email ?? "").trim().toLowerCase();
  const password = String(request.body.password ?? "");
  const attemptKey = `${request.ip}:${email}`;
  const attempt = loginAttempts.get(attemptKey) ?? { count: 0, blockedUntil: 0 };
  if (attempt.blockedUntil > Date.now()) {
    response.setHeader("Retry-After", String(Math.ceil((attempt.blockedUntil - Date.now()) / 1000)));
    return response.status(429).json({ message: "Too many login attempts. Please try again shortly." });
  }
  let role = "Admin";
  let workspaceId = defaultWorkspaceId;
  let valid = email === adminEmail.toLowerCase() && password === adminPassword;
  if (!valid) {
    const user = readDatabase().users.find((item) => item.email === email && item.active !== false);
    valid = Boolean(user && verifyPassword(password, user.passwordHash));
    role = user?.role ?? "Operator";
    workspaceId = user?.workspaceId ?? defaultWorkspaceId;
  }
  if (!valid) {
    const count = attempt.count + 1;
    loginAttempts.set(attemptKey, { count, blockedUntil: count >= 5 ? Date.now() + 15 * 60_000 : 0 });
    return response.status(401).json({ message: "Invalid email or password." });
  }
  loginAttempts.delete(attemptKey);
  const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
  response.json({ token: signToken({ email, role, workspaceId, expiresAt }), email, role, workspaceId, expiresAt });
});

app.post("/api/auth/recovery", (request, response) => {
  const email = String(request.body.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return response.status(400).json({ message: "A valid email address is required." });
  }

  const key = `${request.ip}:${email}`;
  const previous = recoveryRequests.get(key) ?? 0;
  if (Date.now() - previous < 60_000) {
    return response.status(429).json({ message: "Please wait before requesting another recovery." });
  }
  recoveryRequests.set(key, Date.now());

  if (email === adminEmail.toLowerCase()) {
    console.info(`[Nexora recovery] Recovery requested for ${email}. Update NEXORA_ADMIN_PASSWORD and restart the server to rotate local credentials.`);
  }

  response.status(202).json({
    message: "If the account exists, recovery instructions have been prepared for the workspace administrator.",
  });
});

app.use("/api", (request, response, next) => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  try {
    const session = verifyToken(token);
    if (!session) return response.status(401).json({ message: "Authentication required." });
    session.workspaceId = session.workspaceId ?? defaultWorkspaceId;
    request.user = session;
    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired session." });
  }
});

app.use("/api", (request, response, next) => {
  const role = request.user.role;
  if (role === "Admin" || role === "Manager") return next();
  const allowed = role === "Finance"
    ? ["/dashboard", "/customers", "/employees", "/tasks", "/invoices", "/expenses", "/documents", "/automations", "/activities", "/ai"]
    : ["/dashboard", "/ops", "/files", "/ai"];
  if (allowed.some((prefix) => request.path === prefix || request.path.startsWith(`${prefix}/`))) return next();
  response.status(403).json({ message: "Your role does not allow this action." });
});

app.get("/api/admin/system", (request, response) => {
  if (!["Admin", "Manager"].includes(request.user.role)) return response.status(403).json({ message: "Manager access required." });
  const database = readDatabase();
  const storage = getDatabaseStatus();
  const collectionNames = ["customers", "employees", "tasks", "invoices", "expenses", "documents", "automations", "activities", "operationalTasks", "fleet", "operationalEmployees", "sites", "users"];
  response.json({
    status: "healthy",
    workspaceId: request.user.workspaceId,
    storage: { provider: storage.provider, revision: storage.revision, updatedAt: storage.updatedAt, sizeBytes: storage.sizeBytes },
    records: Object.fromEntries(collectionNames.map((name) => [name, scoped(database, name, request.user.workspaceId).length])),
    safeguards: { atomicWrites: true, workspaceIsolation: true, signedSessions: true, protectedFiles: true, rateLimits: true },
    integrations: { ai: Boolean(process.env.OPENAI_API_KEY), databaseCloud: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY), whatsapp: Boolean(process.env.WHATSAPP_ACCESS_TOKEN), sms: Boolean(process.env.SMS_PROVIDER_API_KEY), payments: Boolean(process.env.PAYMENT_PROVIDER_API_KEY) },
    checkedAt: new Date().toISOString(),
  });
});

app.get("/api/admin/export", (request, response) => {
  if (request.user.role !== "Admin") return response.status(403).json({ message: "Administrator access required." });
  const database = readDatabase();
  const collectionNames = ["customers", "employees", "tasks", "invoices", "expenses", "documents", "automations", "activities", "operationalTasks", "fleet", "operationalEmployees", "sites"];
  const exportedAt = new Date().toISOString();
  const payload = {
    format: "nexora-workspace-export",
    version: 1,
    exportedAt,
    workspaceId: request.user.workspaceId,
    data: Object.fromEntries(collectionNames.map((name) => [name, scoped(database, name, request.user.workspaceId)])),
    users: scoped(database, "users", request.user.workspaceId).map(({ passwordHash, ...user }) => user),
  };
  addActivity({ type: "system", title: "Workspace data exported", description: `Export created at ${exportedAt}`, workspaceId: request.user.workspaceId, actorEmail: request.user.email }, database);
  writeDatabase(database);
  response.setHeader("Content-Disposition", `attachment; filename="nexora-workspace-${exportedAt.slice(0, 10)}.json"`);
  response.json(payload);
});

app.post("/api/ops/tasks/:id/evidence", (request, response) => {
  const database = readDatabase();
  const task = database.operationalTasks.find(
    (item) => String(item.id) === request.params.id && belongsToWorkspace(item, request.user.workspaceId)
  );
  if (!task) return response.status(404).json({ message: "Operational task not found." });

  const fileName = String(request.body.fileName ?? "evidence").slice(0, 180);
  const signedBy = String(request.body.signedBy ?? "").trim().slice(0, 180);
  const match = String(request.body.dataUrl ?? "").match(/^data:(image\/(?:jpeg|png|webp)|application\/pdf);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return response.status(400).json({ message: "Upload a JPEG, PNG, WebP or PDF evidence file." });

  const contents = Buffer.from(match[2], "base64");
  if (!contents.length || contents.length > 5 * 1024 * 1024) {
    return response.status(413).json({ message: "Evidence files must be smaller than 5 MB." });
  }

  const extensions = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" };
  const storedName = `${randomUUID()}.${extensions[match[1]]}`;
  fs.writeFileSync(path.join(evidenceDirectory, storedName), contents, { flag: "wx" });
  const evidence = {
    id: randomUUID(),
    name: fileName,
    mimeType: match[1],
    size: contents.length,
    storedName,
    url: `/api/files/${storedName}`,
    signedBy: signedBy || null,
    uploadedAt: new Date().toISOString(),
    uploadedBy: request.user.email,
  };
  task.evidence = [...(Array.isArray(task.evidence) ? task.evidence : []), evidence];
  task.updatedAt = evidence.uploadedAt;
  addActivity({ type: "evidence", title: "Completion evidence uploaded", description: fileName, entityId: task.id, workspaceId: request.user.workspaceId, actorEmail: request.user.email }, database);
  writeDatabase(database);
  response.status(201).json(evidence);
});

app.get("/api/files/:fileName", (request, response) => {
  const storedName = path.basename(request.params.fileName);
  if (storedName !== request.params.fileName) return response.status(400).json({ message: "Invalid file name." });
  const database = readDatabase();
  const authorized = scoped(database, "operationalTasks", request.user.workspaceId)
    .some((task) => Array.isArray(task.evidence) && task.evidence.some((item) => item.storedName === storedName));
  if (!authorized) return response.status(404).json({ message: "File not found." });
  response.setHeader("Cache-Control", "private, max-age=300");
  response.sendFile(path.join(evidenceDirectory, storedName));
});

app.get("/api/users", (request, response) => {
  if (request.user.role !== "Admin" && request.user.role !== "Manager") return response.status(403).json({ message: "Administrator access required." });
  const users = scoped(readDatabase(), "users", request.user.workspaceId).map(({ passwordHash, ...user }) => user);
  response.json(users);
});

app.post("/api/users", (request, response) => {
  if (request.user.role !== "Admin") return response.status(403).json({ message: "Administrator access required." });
  const email = String(request.body.email ?? "").trim().toLowerCase();
  const name = String(request.body.name ?? "").trim();
  const role = String(request.body.role ?? "Operator");
  const temporaryPassword = String(request.body.temporaryPassword ?? "");
  if (!email.includes("@") || !name || temporaryPassword.length < 8) return response.status(400).json({ message: "Name, valid email and an 8-character temporary password are required." });
  if (!["Admin", "Manager", "Finance", "Operator"].includes(role)) return response.status(400).json({ message: "Invalid role." });
  const database = readDatabase();
  if (email === adminEmail.toLowerCase() || database.users.some((item) => item.email === email)) return response.status(409).json({ message: "A user with this email already exists." });
  const user = { id: randomUUID(), email, name, role, active: true, workspaceId: request.user.workspaceId, passwordHash: hashPassword(temporaryPassword), createdAt: new Date().toISOString() };
  database.users.push(user);
  addActivity({ type: "user", title: "Team member invited", description: `${name} · ${role}`, entityId: user.id, workspaceId: request.user.workspaceId, actorEmail: request.user.email }, database);
  writeDatabase(database);
  const { passwordHash, ...safeUser } = user;
  response.status(201).json(safeUser);
});

app.patch("/api/users/:id/status", (request, response) => {
  if (request.user.role !== "Admin") return response.status(403).json({ message: "Administrator access required." });
  const database = readDatabase();
  const user = database.users.find((item) => item.id === request.params.id && belongsToWorkspace(item, request.user.workspaceId));
  if (!user) return response.status(404).json({ message: "User not found." });
  user.active = Boolean(request.body.active);
  user.updatedAt = new Date().toISOString();
  addActivity({ type: "user", title: user.active ? "Team member activated" : "Team member suspended", description: user.name, entityId: user.id, workspaceId: request.user.workspaceId, actorEmail: request.user.email }, database);
  writeDatabase(database);
  const { passwordHash, ...safeUser } = user;
  response.json(safeUser);
});

app.post("/api/ai", createRateLimiter({ limit: 30, windowMs: 5 * 60_000 }), async (request, response) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return response.status(503).json({
      code: "AI_NOT_CONFIGURED",
      message: "OpenAI is not configured. Local AI fallback is active.",
    });
  }

  const question = String(request.body.question ?? "").trim();
  const context = request.body.context ?? {};

  if (!question) {
    return response.status(400).json({ message: "A question is required." });
  }

  try {
    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
        instructions:
          "You are Nexora's concise operations assistant. Use only the supplied aggregate workspace data. Identify risks and recommend safe next actions. Never claim an action was completed. Answer in the user's language.",
        input: `Workspace data: ${JSON.stringify(context)}\n\nUser question: ${question}`,
        reasoning: { effort: "low" },
        text: { verbosity: "low" },
        max_output_tokens: 500,
      }),
    });

    const payload = await aiResponse.json();

    if (!aiResponse.ok) {
      throw new Error(payload?.error?.message || "OpenAI request failed.");
    }

    const answer =
      payload.output_text ||
      payload.output
        ?.flatMap((item) => item.content ?? [])
        .find((item) => item.type === "output_text")?.text;

    if (!answer) {
      throw new Error("OpenAI returned an empty response.");
    }

    response.json({ answer, provider: "openai" });
  } catch (error) {
    response.status(502).json({
      message: error instanceof Error ? error.message : "AI request failed.",
    });
  }
});

app.get("/api/dashboard", (request, response) => {
  try {
    const source = readDatabase();
    const database = {
      customers: scoped(source, "customers", request.user.workspaceId),
      employees: scoped(source, "employees", request.user.workspaceId),
      tasks: scoped(source, "tasks", request.user.workspaceId),
      invoices: scoped(source, "invoices", request.user.workspaceId),
      expenses: scoped(source, "expenses", request.user.workspaceId),
      activities: scoped(source, "activities", request.user.workspaceId),
    };

    const totalRevenue = database.invoices
      .filter((invoice) =>
        ["Paid", "Partial", "Overdue", "Sent"].includes(
          invoice.status
        )
      )
      .reduce(
        (sum, invoice) => sum + Number(invoice.total || 0),
        0
      );

    const paidRevenue = database.invoices
      .filter((invoice) => invoice.status === "Paid")
      .reduce(
        (sum, invoice) => sum + Number(invoice.total || 0),
        0
      );

    const totalExpenses = database.expenses.reduce(
      (sum, expense) => sum + Number(expense.total || 0),
      0
    );

    const openTasks = database.tasks.filter(
      (task) => task.status !== "Done"
    );

    const overdueInvoices = database.invoices.filter(
      (invoice) => invoice.status === "Overdue"
    );

    const availableEmployees = database.employees.filter(
      (employee) => employee.status === "Available"
    );

    response.json({
      customers: {
        total: database.customers.length,
        active: database.customers.filter(
          (customer) => customer.status === "Active"
        ).length,
        leads: database.customers.filter(
          (customer) => customer.status === "Lead"
        ).length,
      },

      employees: {
        total: database.employees.length,
        available: availableEmployees.length,
      },

      tasks: {
        total: database.tasks.length,
        open: openTasks.length,
        critical: openTasks.filter(
          (task) => task.priorityScore >= 85
        ).length,
        completed: database.tasks.filter(
          (task) => task.status === "Done"
        ).length,
      },

      finance: {
        totalRevenue,
        paidRevenue,
        outstandingRevenue: totalRevenue - paidRevenue,
        totalExpenses,
        profit: paidRevenue - totalExpenses,
        overdueInvoices: overdueInvoices.length,
      },

      recentActivities: database.activities.slice(0, 10),

      priorityTasks: [...openTasks]
        .sort(
          (firstTask, secondTask) =>
            secondTask.priorityScore -
            firstTask.priorityScore
        )
        .slice(0, 5),
    });
  } catch (error) {
    response.status(500).json({
      message: error.message,
    });
  }
});

app.post("/api/automations/run", (request, response) => {
  try {
    if (!['Admin', 'Manager'].includes(request.user.role)) return response.status(403).json({ message: "Manager access is required to run automations." });
    const database = readDatabase();
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const dueSoon = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10);
    const createdTasks = [];
    const enabled = scoped(database, "automations", request.user.workspaceId).filter((item) => item.enabled);
    const workspaceInvoices = scoped(database, "invoices", request.user.workspaceId);
    const workspaceTasks = scoped(database, "tasks", request.user.workspaceId);
    const workspaceCustomers = scoped(database, "customers", request.user.workspaceId);

    function createAutomatedTask({ title, marker, customerId, urgency, businessValue, risk, customerImportance, dueDate = today }) {
      const exists = workspaceTasks.some((task) => task.description?.includes(marker) && task.status !== "Done");
      if (exists) return null;
      const priorityScore = calculatePriorityScore({ urgency, businessValue, risk, customerImportance });
      const task = {
        id: randomUUID(), title, description: marker, customerId, status: "Open",
        urgency, businessValue, risk, customerImportance, priorityScore,
        priorityLabel: getPriorityLabel(priorityScore), dueDate, automationSource: true,
        createdAt: now, updatedAt: now, workspaceId: request.user.workspaceId,
      };
      database.tasks.unshift(task);
      workspaceTasks.unshift(task);
      createdTasks.push(task);
      addActivity({ type: "automation", title: "Automation created task", description: task.title, entityId: task.id, workspaceId: request.user.workspaceId, actorEmail: request.user.email }, database);
      return task;
    }

    enabled.forEach((automation) => {
      const beforeCount = createdTasks.length;
      if (automation.trigger === "INVOICE_OVERDUE" && automation.action === "CREATE_TASK") {
        workspaceInvoices.filter((invoice) => invoice.status === "Overdue").forEach((invoice) => {
          const marker = `Automated follow-up for ${invoice.documentNumber}`;
          createAutomatedTask({ title: `Collect payment for ${invoice.documentNumber}`, marker: `${marker}. Outstanding total: ${invoice.total}.`, customerId: invoice.customerId, urgency: 10, businessValue: 9, risk: 8, customerImportance: 9 });
        });
      }
      if (automation.trigger === "CUSTOMER_LEAD" && automation.action === "CREATE_TASK") {
        workspaceCustomers.filter((customer) => customer.status === "Lead").forEach((customer) => {
          createAutomatedTask({ title: `Follow up with ${customer.name}`, marker: `Automated lead follow-up for customer ${customer.id}.`, customerId: customer.id, urgency: 8, businessValue: 9, risk: 5, customerImportance: 8, dueDate: dueSoon });
        });
      }
      if (automation.trigger === "TASK_CRITICAL" && automation.action === "CREATE_TASK") {
        [...workspaceTasks].filter((task) => !task.automationSource && task.status !== "Done" && Number(task.priorityScore) >= 85).forEach((task) => {
          createAutomatedTask({ title: `Management review: ${task.title}`, marker: `Automated critical-task review for task ${task.id}.`, customerId: task.customerId, urgency: 9, businessValue: 8, risk: 8, customerImportance: 7 });
        });
      }
      if (automation.trigger === "INVOICE_DUE_SOON" && automation.action === "CREATE_TASK") {
        workspaceInvoices.filter((invoice) => ["Sent", "Partial"].includes(invoice.status) && invoice.dueDate >= today && invoice.dueDate <= dueSoon).forEach((invoice) => {
          createAutomatedTask({ title: `Payment reminder for ${invoice.documentNumber}`, marker: `Automated upcoming-payment reminder for ${invoice.documentNumber}.`, customerId: invoice.customerId, urgency: 7, businessValue: 8, risk: 5, customerImportance: 8, dueDate: invoice.dueDate });
        });
      }
      automation.lastRun = now;
      automation.updatedAt = now;
      automation.lastResult = { createdTasks: createdTasks.length - beforeCount, checkedAt: now };
    });

    writeDatabase(database);
    response.json({ ran: enabled.length, createdTasks, automations: scoped(database, "automations", request.user.workspaceId) });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

app.post("/api/tasks/:id/invoice", (request, response) => {
  try {
    const amount = Number(request.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) return response.status(400).json({ message: "Enter an amount greater than zero." });
    const database = readDatabase();
    const task = database.tasks.find((item) => item.id === request.params.id && belongsToWorkspace(item, request.user.workspaceId));
    if (!task) return response.status(404).json({ message: "Task not found." });
    if (!task.customerId) return response.status(400).json({ message: "Connect the task to a customer before creating an invoice." });
    const existingInvoice = database.invoices.find((item) => item.sourceTaskId === task.id && belongsToWorkspace(item, request.user.workspaceId));
    if (existingInvoice) return response.status(409).json({ message: `Invoice ${existingInvoice.documentNumber} was already created from this task.` });

    const year = new Date().getFullYear();
    const invoiceCount = scoped(database, "invoices", request.user.workspaceId).length + 1;
    const today = new Date();
    const invoice = calculateInvoiceTotals({
      id: randomUUID(),
      documentNumber: `INV-${year}-${String(invoiceCount).padStart(4, "0")}`,
      type: "Invoice",
      customerId: task.customerId,
      sourceTaskId: task.id,
      status: "Draft",
      issueDate: today.toISOString().slice(0, 10),
      dueDate: new Date(today.getTime() + 14 * 86_400_000).toISOString().slice(0, 10),
      items: [{ id: randomUUID(), description: task.title, quantity: 1, unitPrice: amount }],
      notes: `Created from completed task: ${task.title}`,
      workspaceId: request.user.workspaceId,
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
    });
    database.invoices.unshift(invoice);
    task.invoiceId = invoice.id;
    task.updatedAt = today.toISOString();
    addActivity({ type: "invoice", title: "Invoice created from task", description: `${invoice.documentNumber} · ${task.title}`, entityId: invoice.id, workspaceId: request.user.workspaceId, actorEmail: request.user.email }, database);
    writeDatabase(database);
    response.status(201).json(invoice);
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
});

app.use(
  "/api/customers",
  createCrudRouter({
    collectionName: "customers",
    entityName: "Customer",
    beforeCreate: validateCustomer,
    beforeUpdate: validateCustomer,
    beforeDelete(customer, database) {
      const workspaceId = customer.workspaceId ?? "workspace-local";
      const related = [
        ["tasks", "tasks"], ["invoices", "invoices"], ["documents", "documents"],
      ].filter(([collection]) => database[collection].some((item) => item.customerId === customer.id && belongsToWorkspace(item, workspaceId)));
      if (related.length) throw new Error(`Cannot delete this customer while related ${related.map(([, label]) => label).join(", ")} exist.`);
    },
  })
);

app.use(
  "/api/employees",
  createCrudRouter({
    collectionName: "employees",
    entityName: "Employee",
    beforeCreate(employee) {
      return { ...employee, name: requireText(employee.name, "Employee name"), email: validateEmail(employee.email) };
    },
    beforeUpdate(employee) {
      return { ...employee, name: requireText(employee.name, "Employee name"), email: validateEmail(employee.email) };
    },
    beforeDelete(employee, database) {
      if (database.tasks.some((task) => task.assigneeId === employee.id && task.status !== "Done" && belongsToWorkspace(task, employee.workspaceId ?? "workspace-local"))) throw new Error("Reassign the employee's open tasks before deletion.");
    },
  })
);

app.use(
  "/api/tasks",
  createCrudRouter({
    collectionName: "tasks",
    entityName: "Task",

    beforeCreate(task, database) {
      const validated = validateBusinessTask(task, database);
      const priorityScore = calculatePriorityScore(validated);

      return {
        ...validated,
        priorityScore,
        priorityLabel: getPriorityLabel(priorityScore),
        status: task.status || "Open",
      };
    },

    beforeUpdate(task, database) {
      const validated = validateBusinessTask(task, database);
      const priorityScore = calculatePriorityScore(validated);

      return {
        ...validated,
        priorityScore,
        priorityLabel: getPriorityLabel(priorityScore),
      };
    },
    beforeDelete(task, database) {
      if (database.invoices.some((invoice) => invoice.sourceTaskId === task.id && belongsToWorkspace(invoice, task.workspaceId ?? "workspace-local"))) throw new Error("This task is linked to an invoice and cannot be deleted.");
    },
  })
);

app.use(
  "/api/invoices",
  createCrudRouter({
    collectionName: "invoices",
    entityName: "Invoice",

    beforeCreate(invoice, database) {
      const validated = validateInvoice(invoice, database);
      const year = new Date().getFullYear();

      const invoiceCount = database.invoices.filter((item) => belongsToWorkspace(item, invoice.workspaceId)).length + 1;

      const documentNumber =
        validated.documentNumber ||
        `INV-${year}-${String(invoiceCount).padStart(4, "0")}`;

      return calculateInvoiceTotals({
        ...validated,
        documentNumber,
        status: invoice.status || "Draft",
      });
    },

    beforeUpdate(invoice, database) {
      return calculateInvoiceTotals(validateInvoice(invoice, database));
    },
    beforeDelete(invoice) {
      if (invoice.status === "Paid") throw new Error("Paid invoices cannot be deleted. Cancel or credit the invoice instead.");
    },
  })
);

app.use(
  "/api/expenses",
  createCrudRouter({
    collectionName: "expenses",
    entityName: "Expense",
    beforeCreate(expense) {
      if (Number(expense.amount ?? 0) < 0 || !Number.isFinite(Number(expense.amount ?? 0))) throw new Error("Expense amount must be a valid positive number.");
      return { ...expense, supplier: requireText(expense.supplier, "Supplier"), amount: Number(expense.amount ?? 0), vat: Number(expense.vat ?? 0), total: Number(expense.total ?? 0) };
    },
    beforeUpdate(expense) {
      if (Number(expense.amount ?? 0) < 0 || !Number.isFinite(Number(expense.amount ?? 0))) throw new Error("Expense amount must be a valid positive number.");
      return { ...expense, supplier: requireText(expense.supplier, "Supplier"), amount: Number(expense.amount ?? 0), vat: Number(expense.vat ?? 0), total: Number(expense.total ?? 0) };
    },
  })
);

app.use(
  "/api/documents",
  createCrudRouter({
    collectionName: "documents",
    entityName: "Document",
    beforeCreate(document, database) {
      ensureReference(database, "customers", document.customerId, document.workspaceId, "Customer");
      return { ...document, name: requireText(document.name, "Document name") };
    },
    beforeUpdate(document, database) {
      ensureReference(database, "customers", document.customerId, document.workspaceId, "Customer");
      return { ...document, name: requireText(document.name, "Document name") };
    },
  })
);

app.use(
  "/api/automations",
  (request, response, next) => {
    if (request.method === "GET" || ["Admin", "Manager"].includes(request.user.role)) return next();
    response.status(403).json({ message: "Manager access is required to change automations." });
  },
  createCrudRouter({
    collectionName: "automations",
    entityName: "Automation",
    beforeCreate(automation, database) {
      if (!automationTriggers.has(automation.trigger) || automation.action !== "CREATE_TASK") throw new Error("Unsupported automation trigger or action.");
      const duplicate = database.automations.some((item) => belongsToWorkspace(item, automation.workspaceId) && item.trigger === automation.trigger && item.action === automation.action);
      if (duplicate) throw new Error("This automation is already installed.");
      return { ...automation, enabled: automation.enabled !== false, lastRun: null };
    },
    beforeUpdate(automation) {
      if (!automationTriggers.has(automation.trigger) || automation.action !== "CREATE_TASK") throw new Error("Unsupported automation trigger or action.");
      return automation;
    },
  })
);

app.use(
  "/api/activities",
  createCrudRouter({
    collectionName: "activities",
    entityName: "Activity",
  })
);

app.use(
  "/api/ops/tasks",
  createCrudRouter({
    collectionName: "operationalTasks",
    entityName: "Operational task",
    preserveClientId: true,
  })
);

app.use(
  "/api/ops/fleet",
  createCrudRouter({
    collectionName: "fleet",
    entityName: "Vehicle",
    preserveClientId: true,
  })
);

app.use(
  "/api/ops/employees",
  createCrudRouter({
    collectionName: "operationalEmployees",
    entityName: "Operational employee",
    preserveClientId: true,
  })
);

app.use(
  "/api/ops/sites",
  createCrudRouter({
    collectionName: "sites",
    entityName: "Site",
    preserveClientId: true,
  })
);

app.use(
  express.static(clientDistDirectory, {
    setHeaders(response, filePath) {
      if (filePath.endsWith("index.html")) {
        response.setHeader("Cache-Control", "no-store, max-age=0");
      } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  })
);

app.use((request, response, next) => {
  if (request.method === "GET" && request.accepts("html")) {
    response.setHeader("Cache-Control", "no-store, max-age=0");
    return response.sendFile(path.join(clientDistDirectory, "index.html"));
  }
  next();
});

app.use((request, response) => {
  response.status(404).json({
    message: `Route ${request.method} ${request.originalUrl} not found`,
  });
});

app.use((error, request, response, next) => {
  console.error(error);

  response.status(500).json({
    message: "Internal server error",
  });
});

const httpServer = app.listen(port, () => {
  console.log("");
  console.log("==========================================");
  console.log(" Nexora Business OS API is running");
  console.log(` http://localhost:${port}`);
  console.log(` Health: http://localhost:${port}/api/health`);
  console.log("==========================================");
  console.log("");
});

httpServer.on("error", (error) => {
  console.error("Business API failed to start:", error);
  process.exitCode = 1;
});

function shutdown() {
  httpServer.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
