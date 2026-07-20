import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { createCrudRouter } from "./routes/crudRoutes.js";
import { readDatabase } from "./database.js";
import {
  calculatePriorityScore,
  getPriorityLabel,
} from "./priority.js";

const app = express();
const port = 4000;

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  "/uploads",
  express.static(path.join(currentDirectory, "uploads"))
);

app.get("/", (request, response) => {
  response.json({
    name: "Nexora Business OS API",
    version: "1.0.0",
    status: "online",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (request, response) => {
  response.json({
    status: "healthy",
    server: "Nexora Business OS",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/dashboard", (request, response) => {
  try {
    const database = readDatabase();

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

app.use(
  "/api/customers",
  createCrudRouter({
    collectionName: "customers",
    entityName: "Customer",
  })
);

app.use(
  "/api/employees",
  createCrudRouter({
    collectionName: "employees",
    entityName: "Employee",
  })
);

app.use(
  "/api/tasks",
  createCrudRouter({
    collectionName: "tasks",
    entityName: "Task",

    beforeCreate(task) {
      const priorityScore = calculatePriorityScore(task);

      return {
        ...task,
        priorityScore,
        priorityLabel: getPriorityLabel(priorityScore),
        status: task.status || "Open",
      };
    },

    beforeUpdate(task) {
      const priorityScore = calculatePriorityScore(task);

      return {
        ...task,
        priorityScore,
        priorityLabel: getPriorityLabel(priorityScore),
      };
    },
  })
);

app.use(
  "/api/invoices",
  createCrudRouter({
    collectionName: "invoices",
    entityName: "Invoice",

    beforeCreate(invoice, database) {
      const year = new Date().getFullYear();

      const invoiceCount = database.invoices.length + 1;

      const documentNumber =
        invoice.documentNumber ||
        `INV-${year}-${String(invoiceCount).padStart(4, "0")}`;

      const items = Array.isArray(invoice.items)
        ? invoice.items
        : [];

      const subtotal = items.reduce((sum, item) => {
        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(item.unitPrice || 0);

        return sum + quantity * unitPrice;
      }, 0);

      const vatRate = Number(invoice.vatRate ?? 18);
      const vat = subtotal * (vatRate / 100);
      const total = subtotal + vat;

      return {
        ...invoice,
        documentNumber,
        items,
        subtotal,
        vatRate,
        vat,
        total,
        status: invoice.status || "Draft",
      };
    },
  })
);

app.use(
  "/api/expenses",
  createCrudRouter({
    collectionName: "expenses",
    entityName: "Expense",
  })
);

app.use(
  "/api/documents",
  createCrudRouter({
    collectionName: "documents",
    entityName: "Document",
  })
);

app.use(
  "/api/automations",
  createCrudRouter({
    collectionName: "automations",
    entityName: "Automation",
  })
);

app.use(
  "/api/activities",
  createCrudRouter({
    collectionName: "activities",
    entityName: "Activity",
  })
);

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

app.listen(port, () => {
  console.log("");
  console.log("==========================================");
  console.log(" Nexora Business OS API is running");
  console.log(` http://localhost:${port}`);
  console.log(` Health: http://localhost:${port}/api/health`);
  console.log("==========================================");
  console.log("");
});