import { tasks } from "../data/tasks";

export function getTasks() {
  return tasks;
}

export function getTaskById(id: number) {
  return tasks.find((task) => task.id === id);
}

export function getCriticalTasks() {
  return tasks.filter((task) => task.priority === "Critical");
}