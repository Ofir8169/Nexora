import { useEffect, useState } from "react";
import { toast } from "sonner";

import { employees as initialEmployees } from "../data/employees";
import { fleet as initialFleet } from "../data/fleet";
import { notifications as initialNotifications } from "../data/notifications";
import { sites as initialSites } from "../data/sites";
import { tasks as initialTasks } from "../data/tasks";
import { createNotification } from "../services/notificationService";
import { opsApi } from "../services/opsApi";
import { AppContext } from "./app-context";
import { getLocale, localized } from "../lib/preferences";

type Task = (typeof initialTasks)[number];
type Vehicle = (typeof initialFleet)[number];
type Employee = (typeof initialEmployees)[number];
type Site = (typeof initialSites)[number];
type Notification = (typeof initialNotifications)[number];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [fleet, setFleet] = useState<Vehicle[]>(initialFleet);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [notifications] = useState<Notification[]>(initialNotifications);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      opsApi.tasks.list(),
      opsApi.fleet.list(),
      opsApi.employees.list(),
      opsApi.sites.list(),
    ])
      .then(([taskData, fleetData, employeeData, siteData]) => {
        if (cancelled) return;
        setTasks(taskData);
        setFleet(fleetData);
        setEmployees(employeeData);
        setSites(siteData);
      })
      .catch(() => {
        toast.warning("Using offline operations data", {
          description: "Start the workspace with npm run dev to enable syncing.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function persist(operation: Promise<unknown>) {
    void operation.catch((error: unknown) => {
      toast.error("Could not sync with the server", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    });
  }

  function addTask(task: Task) {
    setTasks((current) => [...current, task]);
    persist(opsApi.tasks.create(task));
    createNotification(`Task "${task.title}" created`, "success");
    toast.success("Task created", { description: task.title });
  }

  function updateTask(task: Task) {
    setTasks((current) => current.map((item) => (item.id === task.id ? task : item)));
    persist(opsApi.tasks.update(task));
    createNotification(`Task "${task.title}" updated`, "success");
    toast.success("Task updated", { description: task.title });
  }

  function deleteTask(id: number) {
    const item = tasks.find((task) => task.id === id);
    setTasks((current) => current.filter((task) => task.id !== id));
    persist(opsApi.tasks.remove(id));
    createNotification(item ? `Task "${item.title}" deleted` : "Task deleted", "warning");
    toast.success(t("Task deleted", "המשימה נמחקה"), item ? {
      action: {
        label: t("Undo", "ביטול"),
        onClick: () => {
          setTasks((current) => current.some((task) => task.id === item.id) ? current : [...current, item]);
          persist(opsApi.tasks.create(item));
          toast.success(t("Task restored", "המשימה שוחזרה"));
        },
      },
    } : undefined);
  }

  function completeTask(id: number) {
    const item = tasks.find((task) => task.id === id);
    if (!item) return;
    const completed = { ...item, status: "Done" };
    setTasks((current) => current.map((task) => (task.id === id ? completed : task)));
    persist(opsApi.tasks.update(completed));
    createNotification(`Task "${item.title}" completed`, "success");
    toast.success("Task completed");
  }

  function addVehicle(vehicle: Vehicle) {
    setFleet((current) => [...current, vehicle]);
    persist(opsApi.fleet.create(vehicle));
    createNotification(`Vehicle "${vehicle.name}" created`, "success");
    toast.success("Vehicle created", { description: vehicle.name });
  }

  function updateVehicle(vehicle: Vehicle) {
    setFleet((current) => current.map((item) => (item.id === vehicle.id ? vehicle : item)));
    persist(opsApi.fleet.update(vehicle));
    toast.success("Vehicle updated", { description: vehicle.name });
  }

  function deleteVehicle(id: number) {
    const item = fleet.find((vehicle) => vehicle.id === id);
    setFleet((current) => current.filter((vehicle) => vehicle.id !== id));
    persist(opsApi.fleet.remove(id));
    toast.success(t("Vehicle deleted", "הרכב נמחק"), item ? { action: { label: t("Undo", "ביטול"), onClick: () => {
      setFleet((current) => current.some((vehicle) => vehicle.id === item.id) ? current : [...current, item]);
      persist(opsApi.fleet.create(item));
      toast.success(t("Vehicle restored", "הרכב שוחזר"));
    } } } : undefined);
  }

  function addEmployee(employee: Employee) {
    setEmployees((current) => [...current, employee]);
    persist(opsApi.employees.create(employee));
    toast.success("Employee created", { description: employee.name });
  }

  function updateEmployee(employee: Employee) {
    setEmployees((current) => current.map((item) => (item.id === employee.id ? employee : item)));
    persist(opsApi.employees.update(employee));
    toast.success("Employee updated", { description: employee.name });
  }

  function deleteEmployee(id: number) {
    const item = employees.find((employee) => employee.id === id);
    setEmployees((current) => current.filter((employee) => employee.id !== id));
    persist(opsApi.employees.remove(id));
    toast.success(t("Employee deleted", "העובד נמחק"), item ? { action: { label: t("Undo", "ביטול"), onClick: () => {
      setEmployees((current) => current.some((employee) => employee.id === item.id) ? current : [...current, item]);
      persist(opsApi.employees.create(item));
      toast.success(t("Employee restored", "העובד שוחזר"));
    } } } : undefined);
  }

  function addSite(site: Site) {
    setSites((current) => [...current, site]);
    persist(opsApi.sites.create(site));
    toast.success("Site created", { description: site.name });
  }

  function updateSite(site: Site) {
    setSites((current) => current.map((item) => (item.id === site.id ? site : item)));
    persist(opsApi.sites.update(site));
    toast.success("Site updated", { description: site.name });
  }

  function deleteSite(id: number) {
    const item = sites.find((site) => site.id === id);
    setSites((current) => current.filter((site) => site.id !== id));
    persist(opsApi.sites.remove(id));
    toast.success(t("Site deleted", "האתר נמחק"), item ? { action: { label: t("Undo", "ביטול"), onClick: () => {
      setSites((current) => current.some((site) => site.id === item.id) ? current : [...current, item]);
      persist(opsApi.sites.create(item));
      toast.success(t("Site restored", "האתר שוחזר"));
    } } } : undefined);
  }

  function resetDemoData() {
    setTasks(initialTasks);
    setFleet(initialFleet);
    setEmployees(initialEmployees);
    setSites(initialSites);
    persist(
      Promise.all([
        opsApi.tasks.replaceAll(initialTasks),
        opsApi.fleet.replaceAll(initialFleet),
        opsApi.employees.replaceAll(initialEmployees),
        opsApi.sites.replaceAll(initialSites),
      ])
    );
    toast.success("Demo data restored");
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
