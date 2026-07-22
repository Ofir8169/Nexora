import { createContext, useContext } from "react";

import { employees as initialEmployees } from "../data/employees";
import { fleet as initialFleet } from "../data/fleet";
import { notifications as initialNotifications } from "../data/notifications";
import { sites as initialSites } from "../data/sites";
import { tasks as initialTasks } from "../data/tasks";

type Task = (typeof initialTasks)[0];
type Vehicle = (typeof initialFleet)[0];
type Employee = (typeof initialEmployees)[0];
type Site = (typeof initialSites)[0];
type Notification = (typeof initialNotifications)[0];

export type AppContextValue = {
  tasks: Task[];
  fleet: Vehicle[];
  employees: Employee[];
  sites: Site[];
  notifications: Notification[];
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: number) => void;
  completeTask: (id: number) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (id: number) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: number) => void;
  addSite: (site: Site) => void;
  updateSite: (site: Site) => void;
  deleteSite: (id: number) => void;
  resetDemoData: () => void;
};

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
}
