import { useState } from "react";
import { Activity, ArrowUpRight, CircleAlert, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useBusiness } from "../../business/context/business-context";
import { useApp } from "../../context/app-context";

export default function NexoraPulse() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { fleet, sites, tasks, employees } = useApp();
  const { dashboard } = useBusiness();
  const criticalFleet = fleet.filter((item) => item.status === "Critical").length;
  const highRiskSites = sites.filter((item) => item.risk >= 70).length;
  const priorityTasks = tasks.filter((item) => item.status !== "Done" && ["Critical", "High"].includes(item.priority)).length;
  const overdue = dashboard?.finance.overdueInvoices ?? 0;
  const available = employees.filter((item) => item.status === "Available").length;
  const deductions = criticalFleet * 12 + highRiskSites * 8 + overdue * 7 + Math.min(priorityTasks * 3, 15);
  const score = Math.max(20, 100 - deductions);
  const tone = score >= 80 ? "emerald" : score >= 60 ? "amber" : "red";
  const toneClasses = { emerald: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", red: "bg-red-50 text-red-700" };

  return (
    <div className="relative hidden lg:block">
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className={`flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold ${toneClasses[tone]}`}>
        <Activity size={16} /><span>Pulse</span><span className="rounded-md bg-white/80 px-1.5 py-0.5 text-xs font-bold">{score}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-14 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10">
          <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Nexora Pulse</p><h2 className="mt-1 text-xl font-bold text-slate-950">Workspace score {score}</h2></div><button type="button" aria-label="Close pulse" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X size={17} /></button></div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${score}%` }} /></div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <PulseMetric label="Priority tasks" value={priorityTasks} />
            <PulseMetric label="Critical fleet" value={criticalFleet} />
            <PulseMetric label="High-risk sites" value={highRiskSites} />
            <PulseMetric label="Team available" value={available} />
          </div>
          <div className="mt-4 rounded-xl bg-blue-50 p-3"><div className="flex gap-2"><Sparkles size={16} className="mt-0.5 shrink-0 text-blue-600" /><p className="text-xs leading-5 text-slate-600">{score >= 80 ? "Your workspace is stable. Keep monitoring deadlines." : "Nexora found active risks. Open AI Commander for a prioritized action plan."}</p></div></div>
          <button type="button" onClick={() => { navigate("/ai"); setOpen(false); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Open AI action plan <ArrowUpRight size={16} /></button>
          {overdue > 0 && <p className="mt-3 flex items-center gap-2 text-xs font-medium text-red-600"><CircleAlert size={14} /> {overdue} overdue invoice{overdue === 1 ? "" : "s"}</p>}
        </div>
      )}
    </div>
  );
}

function PulseMetric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>;
}
