import { createContext, useContext, useEffect, useState } from "react";

import { tasks as initialTasks } from "../data/tasks";
import { fleet as initialFleet } from "../data/fleet";
import { employees as initialEmployees } from "../data/employees";
import { createNotification } from "../services/notificationService";
import { sites as initialSites } from "../data/sites";
import { notifications as initialNotifications } from "../data/notifications";

type Task = (typeof initialTasks)[0];
type Vehicle = (typeof initialFleet)[0];
type Employee = (typeof initialEmployees)[0];
type Site = (typeof initialSites)[0];
type Notification = (typeof initialNotifications)[0];

type AppContextType = {
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

const AppContext = createContext<AppContextType | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadFromStorage("opsflow_tasks", initialTasks)
  );

  const [fleet, setFleet] = useState<Vehicle[]>(() =>
    loadFromStorage("opsflow_fleet", initialFleet)
  );

  const [employees, setEmployees] = useState<Employee[]>(() =>
    loadFromStorage("opsflow_employees", initialEmployees)
  );

  const [sites, setSites] = useState<Site[]>(() =>
    loadFromStorage("opsflow_sites", initialSites)
  );

  const [notifications] = useState<Notification[]>(initialNotifications);

  useEffect(() => {
    localStorage.setItem("opsflow_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("opsflow_fleet", JSON.stringify(fleet));
  }, [fleet]);

  useEffect(() => {
    localStorage.setItem("opsflow_employees", JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem("opsflow_sites", JSON.stringify(sites));
  }, [sites]);

  function addTask(task: Task) {
  setTasks((prev) => [...prev, task]);
  createNotification(`Task "${task.title}" created`, "success");
}

function updateTask(task: Task) {
  setTasks((prev) => prev.map((item) => (item.id === task.id ? task : item)));
  createNotification(`Task "${task.title}" updated`, "success");
}

function deleteTask(id: number) {
  const taskToDelete = tasks.find((task) => task.id === id);

  setTasks((prev) => prev.filter((task) => task.id !== id));

  createNotification(
    taskToDelete ? `Task "${taskToDelete.title}" deleted` : "Task deleted",
    "warning"
  );
}

function completeTask(id: number) {
  const taskToComplete = tasks.find((task) => task.id === id);

  setTasks((prev) =>
    prev.map((task) => (task.id === id ? { ...task, status: "Done" } : task))
  );

  createNotification(
    taskToComplete
      ? `Task "${taskToComplete.title}" completed`
      : "Task completed",
    "success"
  );
}
  function addVehicle(vehicle: Vehicle) {
  setFleet((prev) => [...prev, vehicle]);
  createNotification(`Vehicle "${vehicle.name}" created`, "success");
}

function updateVehicle(vehicle: Vehicle) {
  setFleet((prev) =>
    prev.map((item) => (item.id === vehicle.id ? vehicle : item))
  );
  createNotification(`Vehicle "${vehicle.name}" updated`, "success");
}

function deleteVehicle(id: number) {
  const vehicleToDelete = fleet.find((vehicle) => vehicle.id === id);

  setFleet((prev) => prev.filter((vehicle) => vehicle.id !== id));

  createNotification(
    vehicleToDelete
      ? `Vehicle "${vehicleToDelete.name}" deleted`
      : "Vehicle deleted",
    "warning"
  );
}

 function addEmployee(employee: Employee) {
  setEmployees((prev) => [...prev, employee]);
  createNotification(`Employee "${employee.name}" created`, "success");
}

function updateEmployee(employee: Employee) {
  setEmployees((prev) =>
    prev.map((item) => (item.id === employee.id ? employee : item))
  );
  createNotification(`Employee "${employee.name}" updated`, "success");
}

function deleteEmployee(id: number) {
  const employeeToDelete = employees.find((employee) => employee.id === id);

  setEmployees((prev) => prev.filter((employee) => employee.id !== id));

  createNotification(
    employeeToDelete
      ? `Employee "${employeeToDelete.name}" deleted`
      : "Employee deleted",
    "warning"
  );
}

 function addSite(site: Site) {
  setSites((prev) => [...prev, site]);
  createNotification(`Site "${site.name}" created`, "success");
}

function updateSite(site: Site) {
  setSites((prev) => prev.map((item) => (item.id === site.id ? site : item)));
  createNotification(`Site "${site.name}" updated`, "success");
}

function deleteSite(id: number) {
  const siteToDelete = sites.find((site) => site.id === id);

  setSites((prev) => prev.filter((site) => site.id !== id));

  createNotification(
    siteToDelete ? `Site "${siteToDelete.name}" deleted` : "Site deleted",
    "warning"
  );
}

  function resetDemoData() {
    localStorage.removeItem("opsflow_tasks");
    localStorage.removeItem("opsflow_fleet");
    localStorage.removeItem("opsflow_employees");
    localStorage.removeItem("opsflow_notifications");
    localStorage.removeItem("opsflow_sites");

    setTasks(initialTasks);
    setFleet(initialFleet);
    setEmployees(initialEmployees);
    setSites(initialSites);
  }

  return (
    <AppContext.Provider
      value={{
        tasks,
        fleet,
        employees,
        sites,
        notifications,

        addTask,
        updateTask,
        deleteTask,
        completeTask,

        addVehicle,
        updateVehicle,
        deleteVehicle,

        addEmployee,
        updateEmployee,
        deleteEmployee,

        addSite,
        updateSite,
        deleteSite,

        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
}