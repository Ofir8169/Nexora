import express from "express";
import { v4 as uuid } from "uuid";

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
}) {
  const router = express.Router();

  router.get("/", (request, response) => {
    try {
      const database = readDatabase();

      response.json(database[collectionName] ?? []);
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
        (entry) => entry.id === request.params.id
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
        id: uuid(),
        ...request.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (beforeCreate) {
        newItem = beforeCreate(newItem, database);
      }

      database[collectionName].unshift(newItem);

      writeDatabase(database);

      addActivity({
        type: collectionName,
        title: `${entityName} created`,
        description:
          newItem.name ??
          newItem.title ??
          newItem.documentNumber ??
          "",
        entityId: newItem.id,
      });

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
        (entry) => entry.id === request.params.id
      );

      if (itemIndex === -1) {
        return response.status(404).json({
          message: `${entityName} not found`,
        });
      }

      let updatedItem = {
        ...database[collectionName][itemIndex],
        ...request.body,
        id: request.params.id,
        updatedAt: new Date().toISOString(),
      };

      if (beforeUpdate) {
        updatedItem = beforeUpdate(updatedItem, database);
      }

      database[collectionName][itemIndex] = updatedItem;

      writeDatabase(database);

      addActivity({
        type: collectionName,
        title: `${entityName} updated`,
        description:
          updatedItem.name ??
          updatedItem.title ??
          updatedItem.documentNumber ??
          "",
        entityId: updatedItem.id,
      });

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
        (entry) => entry.id === request.params.id
      );

      if (itemIndex === -1) {
        return response.status(404).json({
          message: `${entityName} not found`,
        });
      }

      const deletedItem = database[collectionName][itemIndex];

      database[collectionName].splice(itemIndex, 1);

      writeDatabase(database);

      addActivity({
        type: collectionName,
        title: `${entityName} deleted`,
        description:
          deletedItem.name ??
          deletedItem.title ??
          deletedItem.documentNumber ??
          "",
        entityId: deletedItem.id,
      });

      response.json({
        message: `${entityName} deleted successfully`,
        item: deletedItem,
      });
    } catch (error) {
      response.status(500).json({
        message: error.message,
      });
    }
  });

  return router;
}