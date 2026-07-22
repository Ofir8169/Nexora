import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "nexora-database-test-"));
process.env.NEXORA_DATABASE_PATH = path.join(temporaryDirectory, "database.json");

try {
  const { addActivity, getDatabaseStatus, readDatabase, writeDatabase } = await import("../server/database.js");
  const initial = readDatabase();
  if (!Array.isArray(initial.customers) || !Array.isArray(initial.users)) throw new Error("Initial database schema is incomplete.");

  initial.customers.push({ id: "test-customer", name: "Test", workspaceId: "workspace-test" });
  writeDatabase(initial);
  const firstStatus = getDatabaseStatus();
  if (firstStatus.revision !== 1 || firstStatus.collections.customers !== 1) throw new Error("Atomic database write did not update metadata.");

  addActivity({ type: "test", title: "Atomic test", workspaceId: "workspace-test" });
  const secondStatus = getDatabaseStatus();
  if (secondStatus.revision !== 2 || secondStatus.collections.activities !== 1) throw new Error("Activity write was not persisted atomically.");

  const invalid = readDatabase();
  invalid.tasks = null;
  let rejected = false;
  try { writeDatabase(invalid); } catch { rejected = true; }
  if (!rejected) throw new Error("Invalid database structure was accepted.");
  if (readDatabase().customers.length !== 1) throw new Error("A rejected write damaged the existing database.");

  const temporaryFiles = fs.readdirSync(temporaryDirectory).filter((name) => name.endsWith(".tmp"));
  if (temporaryFiles.length) throw new Error("Atomic write left temporary files behind.");
  console.log("Nexora database integrity test passed");
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}
