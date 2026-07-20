import { API_URL } from "./config";

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
      ...options.headers,
    },
  });

  if (!response.ok) {
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

  invoices: createCrudApi<Invoice>("/invoices"),

  expenses: createCrudApi<Expense>("/expenses"),

  documents: createCrudApi<BusinessDocument>("/documents"),

  automations: createCrudApi<Automation>("/automations"),

  activities: createCrudApi<Activity>("/activities"),
};