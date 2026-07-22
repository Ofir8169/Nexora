import { employees as employeeSeed } from "../data/employees";
import { fleet as fleetSeed } from "../data/fleet";
import { sites as siteSeed } from "../data/sites";
import { tasks as taskSeed } from "../data/tasks";
import { clearAuth, getAuthHeaders } from "../lib/auth";

export type OperationalTask = (typeof taskSeed)[number];
export type Vehicle = (typeof fleetSeed)[number];
export type OperationalEmployee = (typeof employeeSeed)[number];
export type Site = (typeof siteSeed)[number];

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/ops${path}`, {
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
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? `Operations request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

function collectionApi<T extends { id: number }>(path: string) {
  return {
    list: () => request<T[]>(path),
    create: (item: T) =>
      request<T>(path, { method: "POST", body: JSON.stringify(item) }),
    update: (item: T) =>
      request<T>(`${path}/${item.id}`, {
        method: "PUT",
        body: JSON.stringify(item),
      }),
    remove: (id: number) => request(`${path}/${id}`, { method: "DELETE" }),
    async replaceAll(items: T[]) {
      const current = await request<T[]>(path);
      await Promise.all(current.map((item) => request(`${path}/${item.id}`, { method: "DELETE" })));
      await Promise.all(items.map((item) => request<T>(path, { method: "POST", body: JSON.stringify(item) })));
    },
  };
}

export const opsApi = {
  tasks: collectionApi<OperationalTask>("/tasks"),
  fleet: collectionApi<Vehicle>("/fleet"),
  employees: collectionApi<OperationalEmployee>("/employees"),
  sites: collectionApi<Site>("/sites"),
};
