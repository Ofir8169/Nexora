import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { businessApi } from "../api/businessApi";

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

interface BusinessContextValue {
  dashboard: DashboardSummary | null;
  customers: Customer[];
  employees: Employee[];
  tasks: BusinessTask[];
  invoices: Invoice[];
  expenses: Expense[];
  documents: BusinessDocument[];
  automations: Automation[];

  loading: boolean;
  error: string | null;

  refreshAll: () => Promise<void>;
  refreshDashboard: () => Promise<void>;

  createCustomer: (
    data: Partial<Customer>
  ) => Promise<Customer>;

  updateCustomer: (
    id: string,
    data: Partial<Customer>
  ) => Promise<Customer>;

  deleteCustomer: (id: string) => Promise<void>;

  createEmployee: (
    data: Partial<Employee>
  ) => Promise<Employee>;

  updateEmployee: (
    id: string,
    data: Partial<Employee>
  ) => Promise<Employee>;

  deleteEmployee: (id: string) => Promise<void>;

  createTask: (
    data: Partial<BusinessTask>
  ) => Promise<BusinessTask>;

  updateTask: (
    id: string,
    data: Partial<BusinessTask>
  ) => Promise<BusinessTask>;

  deleteTask: (id: string) => Promise<void>;

  createInvoice: (
    data: Partial<Invoice>
  ) => Promise<Invoice>;

  updateInvoice: (
    id: string,
    data: Partial<Invoice>
  ) => Promise<Invoice>;

  deleteInvoice: (id: string) => Promise<void>;

  createExpense: (
    data: Partial<Expense>
  ) => Promise<Expense>;

  updateExpense: (
    id: string,
    data: Partial<Expense>
  ) => Promise<Expense>;

  deleteExpense: (id: string) => Promise<void>;
}

const BusinessContext =
  createContext<BusinessContextValue | null>(null);

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
    void refreshAll();
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

  const value = useMemo<BusinessContextValue>(
    () => ({
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
      updateTask,
      deleteTask,

      createInvoice,
      updateInvoice,
      deleteInvoice,

      createExpense,
      updateExpense,
      deleteExpense,
    }),
    [
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
    ]
  );

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);

  if (!context) {
    throw new Error(
      "useBusiness must be used inside BusinessProvider."
    );
  }

  return context;
}