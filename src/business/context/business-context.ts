import { createContext, useContext } from "react";

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

export interface BusinessContextValue {
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
  createCustomer: (data: Partial<Customer>) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  createEmployee: (data: Partial<Employee>) => Promise<Employee>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<Employee>;
  deleteEmployee: (id: string) => Promise<void>;
  createTask: (data: Partial<BusinessTask>) => Promise<BusinessTask>;
  createInvoiceFromTask: (taskId: string, amount: number) => Promise<Invoice>;
  updateTask: (id: string, data: Partial<BusinessTask>) => Promise<BusinessTask>;
  deleteTask: (id: string) => Promise<void>;
  createInvoice: (data: Partial<Invoice>) => Promise<Invoice>;
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;
  createExpense: (data: Partial<Expense>) => Promise<Expense>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  createDocument: (data: Partial<BusinessDocument>) => Promise<BusinessDocument>;
  deleteDocument: (id: string) => Promise<void>;
  runAutomations: () => Promise<{ ran: number; created: number }>;
  createAutomation: (data: Partial<Automation>) => Promise<Automation>;
  updateAutomation: (id: string, data: Partial<Automation>) => Promise<Automation>;
  deleteAutomation: (id: string) => Promise<void>;
}

export const BusinessContext = createContext<BusinessContextValue | null>(null);

export function useBusiness() {
  const context = useContext(BusinessContext);

  if (!context) {
    throw new Error("useBusiness must be used inside BusinessProvider.");
  }

  return context;
}
