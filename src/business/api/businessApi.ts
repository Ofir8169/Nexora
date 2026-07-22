import { API_URL } from "./config";
import { clearAuth, getAuthHeaders } from "../../lib/auth";

import type {
  Activity,
  Automation,
  BusinessDocument,
  BusinessTask,
  Customer,
  DashboardSummary,
  Employee,
  Expense,
  Invoice,
} from "../types/business";

interface ApiErrorResponse {
  message?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
      window.location.reload();
      throw new Error("Your session expired. Please sign in again.");
    }
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const errorData = (await response.json()) as ApiErrorResponse;

      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // The server did not return JSON.
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function createCrudApi<T>(endpoint: string) {
  return {
    getAll(): Promise<T[]> {
      return request<T[]>(endpoint);
    },

    getById(id: string): Promise<T> {
      return request<T>(`${endpoint}/${id}`);
    },

    create(data: Partial<T>): Promise<T> {
      return request<T>(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    update(id: string, data: Partial<T>): Promise<T> {
      return request<T>(`${endpoint}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    remove(id: string): Promise<{
      message: string;
      item: T;
    }> {
      return request(`${endpoint}/${id}`, {
        method: "DELETE",
      });
    },
  };
}

export const businessApi = {
  dashboard: {
    get(): Promise<DashboardSummary> {
      return request<DashboardSummary>("/dashboard");
    },
  },

  customers: createCrudApi<Customer>("/customers"),

  employees: createCrudApi<Employee>("/employees"),

  tasks: createCrudApi<BusinessTask>("/tasks"),

  createInvoiceFromTask(taskId: string, amount: number): Promise<Invoice> {
    return request(`/tasks/${taskId}/invoice`, { method: "POST", body: JSON.stringify({ amount }) });
  },

  invoices: createCrudApi<Invoice>("/invoices"),

  expenses: createCrudApi<Expense>("/expenses"),

  documents: createCrudApi<BusinessDocument>("/documents"),

  automations: createCrudApi<Automation>("/automations"),

  runAutomations(): Promise<{ ran: number; createdTasks: BusinessTask[]; automations: Automation[] }> {
    return request("/automations/run", { method: "POST" });
  },

  activities: createCrudApi<Activity>("/activities"),
};
