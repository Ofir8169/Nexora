export type CustomerStatus =
  | "Active"
  | "Lead"
  | "Inactive"
  | "Blocked";

export type PriorityLevel =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

export type EmployeeStatus =
  | "Available"
  | "Busy"
  | "Offline"
  | "Vacation";

export type TaskStatus =
  | "Open"
  | "In Progress"
  | "Waiting"
  | "Done"
  | "Cancelled";

export type InvoiceStatus =
  | "Draft"
  | "Sent"
  | "Paid"
  | "Partial"
  | "Overdue"
  | "Cancelled";

export type DocumentType =
  | "Invoice"
  | "Receipt"
  | "Quotation"
  | "Contract"
  | "Expense"
  | "Other";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  priority: PriorityLevel;
  balance: number;
  notes: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: EmployeeStatus;
  workload: number;
  priority: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BusinessTask {
  id: string;
  title: string;
  description: string;
  customerId?: string;
  assigneeId?: string;
  status: TaskStatus;
  urgency: number;
  businessValue: number;
  risk: number;
  customerImportance: number;
  priorityScore: number;
  priorityLabel?: PriorityLevel;
  dueDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total?: number;
}

export interface Invoice {
  id: string;
  documentNumber: string;
  type: "Invoice" | "Receipt" | "Quotation";
  customerId: string;
  status: InvoiceStatus;
  subtotal: number;
  vatRate?: number;
  vat: number;
  total: number;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Expense {
  id: string;
  supplier: string;
  description: string;
  category: string;
  amount: number;
  vat: number;
  total: number;
  date: string;
  status: "Paid" | "Pending";
  createdAt: string;
  updatedAt?: string;
}

export interface BusinessDocument {
  id: string;
  name: string;
  type: DocumentType;
  customerId?: string;
  employeeId?: string;
  fileName?: string;
  fileUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  enabled: boolean;
  lastRun: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  entityId?: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  customers: {
    total: number;
    active: number;
    leads: number;
  };

  employees: {
    total: number;
    available: number;
  };

  tasks: {
    total: number;
    open: number;
    critical: number;
    completed: number;
  };

  finance: {
    totalRevenue: number;
    paidRevenue: number;
    outstandingRevenue: number;
    totalExpenses: number;
    profit: number;
    overdueInvoices: number;
  };

  recentActivities: Activity[];
  priorityTasks: BusinessTask[];
}