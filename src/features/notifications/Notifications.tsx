import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Bot,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

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
    <div className="rounded-3xl border border-blue-400/30 bg-slate-900/95 p-6 shadow-2xl shadow-blue-500/20">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300">
            <Bell size={22} />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">
              Notifications
            </h2>

            <p className="text-sm text-slate-400">
              Live Operational Feed
            </p>
          </div>
        </div>

        <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-black text-cyan-300">
          LIVE
        </span>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 p-8 text-center">
            <Bell
              size={34}
              className="mx-auto mb-3 text-slate-600"
            />

            <p className="font-bold text-white">
              No Notifications
            </p>

            <p className="mt-2 text-sm text-slate-500">
              System is operating normally.
            </p>
          </div>
        ) : (
          notifications
            .slice()
            .reverse()
            .map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 transition hover:border-cyan-400/30"
              >
                <div className="flex items-start gap-4">
                  <div>{getIcon(item.type)}</div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white">
                        {item.title}
                      </p>

                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock3 size={12} />
                        {item.time}
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      {getDescription(item.type)}
                    </p>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

function getDescription(type: string) {
  switch (type) {
    case "critical":
      return "Immediate attention required.";

    case "warning":
      return "Review before next deployment.";

    case "success":
      return "Mission completed successfully.";

    default:
      return "Generated automatically by Nexora AI.";
  }
}

function getIcon(type: string) {
  switch (type) {
    case "critical":
      return (
        <div className="rounded-xl bg-red-500/20 p-3 text-red-300">
          <ShieldAlert size={20} />
        </div>
      );

    case "warning":
      return (
        <div className="rounded-xl bg-orange-500/20 p-3 text-orange-300">
          <AlertTriangle size={20} />
        </div>
      );

    case "success":
      return (
        <div className="rounded-xl bg-green-500/20 p-3 text-green-300">
          <CheckCircle2 size={20} />
        </div>
      );

    default:
      return (
        <div className="rounded-xl bg-cyan-500/20 p-3 text-cyan-300">
          <Sparkles size={20} />
        </div>
      );
  }
}