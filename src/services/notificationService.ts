export type NotificationType = "success" | "warning" | "critical" | "ai";

export function createNotification(title: string, type: NotificationType) {
  const current = JSON.parse(
    localStorage.getItem("opsflow_notifications") ?? "[]"
  );

  const notification = {
    id: Date.now(),
    title,
    type,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  localStorage.setItem(
    "opsflow_notifications",
    JSON.stringify([notification, ...current])
  );

  return notification;
}