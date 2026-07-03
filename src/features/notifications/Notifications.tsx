import { useEffect, useState } from "react";
import { AlertTriangle, Bell, Bot, CheckCircle2 } from "lucide-react";

type Notification = {
  id: number;
  time: string;
  type: "critical" | "warning" | "success" | "ai";
  title: string;
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("opsflow_notifications");
    setNotifications(saved ? JSON.parse(saved) : []);
  }, []);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-3">
        <Bell className="text-blue-600" />
        <h2 className="text-xl font-semibold text-slate-950">Notifications</h2>
      </div>

      <div className="mt-5 space-y-4">
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500">No notifications yet.</p>
        ) : (
          notifications.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="mt-1">{getIcon(item.type)}</div>
              <div>
                <p className="text-xs font-semibold text-slate-400">{item.time}</p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {item.title}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function getIcon(type: string) {
  if (type === "critical") return <AlertTriangle size={18} className="text-red-500" />;
  if (type === "warning") return <AlertTriangle size={18} className="text-orange-500" />;
  if (type === "success") return <CheckCircle2 size={18} className="text-green-500" />;
  return <Bot size={18} className="text-blue-500" />;
}