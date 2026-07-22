import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { businessApi } from "../api/businessApi";
import { BusinessContext } from "./business-context";

import type {
  Automation,
  BusinessDocument,
  BusinessTask,
  Customer,
  DashboardSummary,
  Employee,
  Expense,
  Invoice,
} from "../types/business";

export function BusinessProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dashboard, setDashboard] =
    useState<DashboardSummary | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<BusinessTask[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [documents, setDocuments] = useState<
    BusinessDocument[]
  >([]);
  const [automations, setAutomations] = useState<
    Automation[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshDashboard = useCallback(async () => {
    const dashboardData = await businessApi.dashboard.get();
    setDashboard(dashboardData);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        dashboardData,
        customerData,
        employeeData,
        taskData,
        invoiceData,
        expenseData,
        documentData,
        automationData,
      ] = await Promise.all([
        businessApi.dashboard.get(),
        businessApi.customers.getAll(),
        businessApi.employees.getAll(),
        businessApi.tasks.getAll(),
        businessApi.invoices.getAll(),
        businessApi.expenses.getAll(),
        businessApi.documents.getAll(),
        businessApi.automations.getAll(),
      ]);

      setDashboard(dashboardData);
      setCustomers(customerData);
      setEmployees(employeeData);
      setTasks(taskData);
      setInvoices(invoiceData);
      setExpenses(expenseData);
      setDocuments(documentData);
      setAutomations(automationData);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load business data.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshAll();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshAll]);

  async function createCustomer(data: Partial<Customer>) {
    const customer = await businessApi.customers.create(data);

    setCustomers((current) => [customer, ...current]);
    await refreshDashboard();

    return customer;
  }

  async function updateCustomer(
    id: string,
    data: Partial<Customer>
  ) {
    const customer = await businessApi.customers.update(
      id,
      data
    );

    setCustomers((current) =>
      current.map((item) =>
        item.id === id ? customer : item
      )
    );

    await refreshDashboard();

    return customer;
  }

  async function deleteCustomer(id: string) {
    await businessApi.customers.remove(id);

    setCustomers((current) =>
      current.filter((item) => item.id !== id)
    );

    await refreshDashboard();
  }

  async function createEmployee(data: Partial<Employee>) {
    const employee = await businessApi.employees.create(data);

    setEmployees((current) => [employee, ...current]);
    await refreshDashboard();

    return employee;
  }

  async function updateEmployee(
    id: string,
    data: Partial<Employee>
  ) {
    const employee = await businessApi.employees.update(
      id,
      data
    );

    setEmployees((current) =>
      current.map((item) =>
        item.id === id ? employee : item
      )
    );

    await refreshDashboard();

    return employee;
  }

  async function deleteEmployee(id: string) {
    await businessApi.employees.remove(id);

    setEmployees((current) =>
      current.filter((item) => item.id !== id)
    );

    await refreshDashboard();
  }

  async function createTask(data: Partial<BusinessTask>) {
    const task = await businessApi.tasks.create(data);

    setTasks((current) => [task, ...current]);
    await refreshDashboard();

    return task;
  }

  async function updateTask(
    id: string,
    data: Partial<BusinessTask>
  ) {
    const task = await businessApi.tasks.update(id, data);

    setTasks((current) =>
      current.map((item) => (item.id === id ? task : item))
    );

    await refreshDashboard();

    return task;
  }

  async function deleteTask(id: string) {
    await businessApi.tasks.remove(id);

    setTasks((current) =>
      current.filter((item) => item.id !== id)
    );

    await refreshDashboard();
  }

  async function createInvoiceFromTask(taskId: string, amount: number) {
    const invoice = await businessApi.createInvoiceFromTask(taskId, amount);
    setInvoices((current) => [invoice, ...current]);
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, invoiceId: invoice.id } : task));
    await refreshDashboard();
    return invoice;
  }

  async function createInvoice(data: Partial<Invoice>) {
    const invoice = await businessApi.invoices.create(data);

    setInvoices((current) => [invoice, ...current]);
    await refreshDashboard();

    return invoice;
  }

  async function updateInvoice(
    id: string,
    data: Partial<Invoice>
  ) {
    const invoice = await businessApi.invoices.update(
      id,
      data
    );

    setInvoices((current) =>
      current.map((item) =>
        item.id === id ? invoice : item
      )
    );

    await refreshDashboard();

    return invoice;
  }

  async function deleteInvoice(id: string) {
    await businessApi.invoices.remove(id);

    setInvoices((current) =>
      current.filter((item) => item.id !== id)
    );

    await refreshDashboard();
  }

  async function createExpense(data: Partial<Expense>) {
    const expense = await businessApi.expenses.create(data);

    setExpenses((current) => [expense, ...current]);
    await refreshDashboard();

    return expense;
  }

  async function updateExpense(
    id: string,
    data: Partial<Expense>
  ) {
    const expense = await businessApi.expenses.update(
      id,
      data
    );

    setExpenses((current) =>
      current.map((item) =>
        item.id === id ? expense : item
      )
    );

    await refreshDashboard();

    return expense;
  }

  async function deleteExpense(id: string) {
    await businessApi.expenses.remove(id);

    setExpenses((current) =>
      current.filter((item) => item.id !== id)
    );

    await refreshDashboard();
  }

  async function createDocument(data: Partial<BusinessDocument>) {
    const document = await businessApi.documents.create(data);
    setDocuments((current) => [document, ...current]);
    await refreshDashboard();
    return document;
  }

  async function deleteDocument(id: string) {
    await businessApi.documents.remove(id);
    setDocuments((current) => current.filter((item) => item.id !== id));
    await refreshDashboard();
  }

  async function runAutomations() {
    const result = await businessApi.runAutomations();
    setAutomations(result.automations);
    setTasks((current) => [
      ...result.createdTasks,
      ...current.filter((item) => !result.createdTasks.some((created) => created.id === item.id)),
    ]);
    await refreshDashboard();
    return { ran: result.ran, created: result.createdTasks.length };
  }

  async function createAutomation(data: Partial<Automation>) {
    const automation = await businessApi.automations.create(data);
    setAutomations((current) => [automation, ...current]);
    return automation;
  }

  async function updateAutomation(id: string, data: Partial<Automation>) {
    const automation = await businessApi.automations.update(id, data);
    setAutomations((current) => current.map((item) => item.id === id ? automation : item));
    return automation;
  }

  async function deleteAutomation(id: string) {
    await businessApi.automations.remove(id);
    setAutomations((current) => current.filter((item) => item.id !== id));
  }

  const value = {
      dashboard,
      customers,
      employees,
      tasks,
      invoices,
      expenses,
      documents,
      automations,
      loading,
      error,

      refreshAll,
      refreshDashboard,

      createCustomer,
      updateCustomer,
      deleteCustomer,

      createEmployee,
      updateEmployee,
      deleteEmployee,

      createTask,
      createInvoiceFromTask,
      updateTask,
      deleteTask,

      createInvoice,
      updateInvoice,
      deleteInvoice,

      createExpense,
      updateExpense,
      deleteExpense,

      createDocument,
      deleteDocument,
      runAutomations,
      createAutomation,
      updateAutomation,
      deleteAutomation,
    };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}
