import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "node:crypto";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

const databasePath = process.env.NEXORA_DATABASE_PATH
  ? path.resolve(process.env.NEXORA_DATABASE_PATH)
  : path.join(currentDirectory, "data", "database.json");
const collectionNames = [
  "customers", "employees", "tasks", "invoices", "expenses", "documents",
  "automations", "activities", "operationalTasks", "fleet",
  "operationalEmployees", "sites", "users",
];

function createEmptyDatabase() {
  return Object.fromEntries(collectionNames.map((name) => [name, []]));
}

function ensureDatabaseExists() {
  const dataDirectory = path.dirname(databasePath);

  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, {
      recursive: true,
    });
  }

  if (!fs.existsSync(databasePath)) {
    const initialDatabase = createEmptyDatabase();

    fs.writeFileSync(
      databasePath,
      JSON.stringify(initialDatabase, null, 2),
      "utf-8"
    );
  }
}

export function readDatabase() {
  ensureDatabaseExists();

  const fileContent = fs.readFileSync(databasePath, "utf-8");

  try {
    const database = JSON.parse(fileContent);
    if (!database || typeof database !== "object" || Array.isArray(database)) throw new Error("Database root must be an object.");
    collectionNames.forEach((name) => {
      if (database[name] == null) database[name] = [];
      if (!Array.isArray(database[name])) throw new Error(`Database collection ${name} is invalid.`);
    });
    return database;
  } catch (error) {
    console.error("Database parsing error:", error);

    throw new Error("The local database file is invalid.");
  }
}

export function writeDatabase(database) {
  ensureDatabaseExists();
  collectionNames.forEach((name) => {
    if (!Array.isArray(database[name])) throw new Error(`Cannot save invalid collection ${name}.`);
  });
  database._meta = {
    ...(database._meta ?? {}),
    revision: Number(database._meta?.revision ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  };
  const temporaryPath = `${databasePath}.${process.pid}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, JSON.stringify(database, null, 2), { encoding: "utf-8", mode: 0o600 });
    fs.renameSync(temporaryPath, databasePath);
  } finally {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  }

  return database;
}

export function getDatabaseStatus() {
  const database = readDatabase();
  const file = fs.statSync(databasePath);
  return {
    healthy: true,
    provider: "file",
    revision: Number(database._meta?.revision ?? 0),
    updatedAt: database._meta?.updatedAt ?? file.mtime.toISOString(),
    sizeBytes: file.size,
    collections: Object.fromEntries(collectionNames.map((name) => [name, database[name].length])),
  };
}

export function getCollection(collectionName) {
  const database = readDatabase();

  if (!Array.isArray(database[collectionName])) {
    throw new Error(`Collection "${collectionName}" does not exist.`);
  }

  return database[collectionName];
}

export function addActivity({
  type,
  title,
  description = "",
  entityId = null,
  workspaceId = "workspace-local",
  actorEmail = null,
}, existingDatabase = null) {
  const database = existingDatabase ?? readDatabase();

  const activity = {
    id: randomUUID(),
    type,
    title,
    description,
    entityId,
    workspaceId,
    actorEmail,
    createdAt: new Date().toISOString(),
  };

  database.activities.unshift(activity);

  if (!existingDatabase) {
    writeDatabase(database);
  }

  return activity;
}
