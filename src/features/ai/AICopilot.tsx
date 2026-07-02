import { Bot, Sparkles, ArrowRight } from "lucide-react";

const insights = [
  {
    level: "Critical",
    text: "Truck BW-104 should not leave the site until inspection is completed.",
  },
  {
    level: "Warning",
    text: "Site North is running 45 minutes behind schedule.",
  },
  {
    level: "Suggestion",
    text: "Reassign Maya to assist Ron and balance today's workload.",
  },
];

export default function AICopilot() {
  return (
    <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
          <Bot size={24} />
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400">
            OpsFlow AI
          </p>

          <h2 className="text-2xl font-bold">
            Operational Copilot
          </h2>
        </div>
      </div>

      <p className="mt-6 text-sm leading-7 text-slate-300">
        Good morning Ofir.
        Based on today's operational data, here are the highest priority actions.
      </p>

      <div className="mt-8 space-y-4">
        {insights.map((item) => (
          <div
            key={item.text}
            className="rounded-2xl bg-white/10 p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-300">
                {item.level}
              </span>
            </div>

            <p className="text-sm leading-6 text-slate-200">
              {item.text}
            </p>
          </div>
        ))}
      </div>

      <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-sm font-semibold transition hover:bg-blue-500">
        Open AI Assistant
        <ArrowRight size={18} />
      </button>
    </div>
  );
}