import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

const databasePath = path.join(
  currentDirectory,
  "data",
  "database.json"
);

function ensureDatabaseExists() {
  const dataDirectory = path.dirname(databasePath);

  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, {
      recursive: true,
    });
  }

  if (!fs.existsSync(databasePath)) {
    const initialDatabase = {
      customers: [],
      employees: [],
      tasks: [],
      invoices: [],
      expenses: [],
      documents: [],
      automations: [],
      activities: [],
    };

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
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Database parsing error:", error);

    throw new Error("The local database file is invalid.");
  }
}

export function writeDatabase(database) {
  ensureDatabaseExists();

  fs.writeFileSync(
    databasePath,
    JSON.stringify(database, null, 2),
    "utf-8"
  );

  return database;
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
}) {
  const database = readDatabase();

  const activity = {
    id: crypto.randomUUID(),
    type,
    title,
    description,
    entityId,
    createdAt: new Date().toISOString(),
  };

  database.activities.unshift(activity);

  writeDatabase(database);

  return activity;
}