import express from "express";
import { randomUUID } from "node:crypto";

import {
  addActivity,
  readDatabase,
  writeDatabase,
} from "../database.js";

export function createCrudRouter({
  collectionName,
  entityName,
  beforeCreate,
  beforeUpdate,
  beforeDelete,
  preserveClientId = false,
}) {
  const router = express.Router();
  const belongsToWorkspace = (entry, workspaceId) =>
    (entry.workspaceId ?? "workspace-local") === workspaceId;

  router.get("/", (request, response) => {
    try {
      const database = readDatabase();

      response.json((database[collectionName] ?? []).filter((entry) => belongsToWorkspace(entry, request.user.workspaceId)));
    } catch (error) {
      response.status(500).json({
        message: error.message,
      });
    }
  });

  router.get("/:id", (request, response) => {
    try {
      const database = readDatabase();

      const item = database[collectionName]?.find(
        (entry) => String(entry.id) === request.params.id && belongsToWorkspace(entry, request.user.workspaceId)
      );

      if (!item) {
        return response.status(404).json({
          message: `${entityName} not found`,
        });
      }

      response.json(item);
    } catch (error) {
      response.status(500).json({
        message: error.message,
      });
    }
  });

  router.post("/", (request, response) => {
    try {
      const database = readDatabase();

      let newItem = {
        ...request.body,
        id:
          preserveClientId && request.body.id != null
            ? request.body.id
            : randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        workspaceId: request.user.workspaceId,
      };

      if (beforeCreate) {
        newItem = beforeCreate(newItem, database);
      }

      database[collectionName].unshift(newItem);

      addActivity({
        type: collectionName,
        title: `${entityName} created`,
        description:
          newItem.name ??
          newItem.title ??
          newItem.documentNumber ??
          "",
        entityId: newItem.id,
        workspaceId: request.user.workspaceId,
        actorEmail: request.user.email,
      }, database);

      writeDatabase(database);

      response.status(201).json(newItem);
    } catch (error) {
      response.status(400).json({
        message: error.message,
      });
    }
  });

  router.put("/:id", (request, response) => {
    try {
      const database = readDatabase();

      const itemIndex = database[collectionName].findIndex(
        (entry) => String(entry.id) === request.params.id && belongsToWorkspace(entry, request.user.workspaceId)
      );

      if (itemIndex === -1) {
        return response.status(404).json({
          message: `${entityName} not found`,
        });
      }

      let updatedItem = {
        ...database[collectionName][itemIndex],
        ...request.body,
        id: database[collectionName][itemIndex].id,
        workspaceId: request.user.workspaceId,
        updatedAt: new Date().toISOString(),
      };

      if (beforeUpdate) {
        updatedItem = beforeUpdate(updatedItem, database);
      }

      database[collectionName][itemIndex] = updatedItem;

      addActivity({
        type: collectionName,
        title: `${entityName} updated`,
        description:
          updatedItem.name ??
          updatedItem.title ??
          updatedItem.documentNumber ??
          "",
        entityId: updatedItem.id,
        workspaceId: request.user.workspaceId,
        actorEmail: request.user.email,
      }, database);

      writeDatabase(database);

      response.json(updatedItem);
    } catch (error) {
      response.status(400).json({
        message: error.message,
      });
    }
  });

  router.delete("/:id", (request, response) => {
    try {
      const database = readDatabase();

      const itemIndex = database[collectionName].findIndex(
        (entry) => String(entry.id) === request.params.id && belongsToWorkspace(entry, request.user.workspaceId)
      );

      if (itemIndex === -1) {
        return response.status(404).json({
          message: `${entityName} not found`,
        });
      }

      const deletedItem = database[collectionName][itemIndex];

      if (beforeDelete) {
        beforeDelete(deletedItem, database, request);
      }

      database[collectionName].splice(itemIndex, 1);

      addActivity({
        type: collectionName,
        title: `${entityName} deleted`,
        description:
          deletedItem.name ??
          deletedItem.title ??
          deletedItem.documentNumber ??
          "",
        entityId: deletedItem.id,
        workspaceId: request.user.workspaceId,
        actorEmail: request.user.email,
      }, database);

      writeDatabase(database);

      response.json({
        message: `${entityName} deleted successfully`,
        item: deletedItem,
      });
    } catch (error) {
      response.status(400).json({
        message: error.message,
      });
    }
  });

  return router;
}
