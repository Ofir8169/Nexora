import { useEffect, useMemo, useState } from "react";
import { BarChart3, Bot, BriefcaseBusiness, CalendarCheck2, CalendarDays, ClipboardList, CreditCard, FileText, FolderOpen, Map, MapPin, Play, Plus, Search, Settings, ShieldCheck, Truck, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useBusiness } from "../../business/context/business-context";
import { canAccess, getUserRole } from "../../lib/preferences";

type Command = {
  label: string;
  description: string;
  icon: typeof Search;
  path?: string;
  state?: { view?: string; quickCreate?: string };
  action?: () => Promise<void>;
};

export default function CommandPalette() {
  const navigate = useNavigate();
  const business = useBusiness();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [running, setRunning] = useState(false);
  const role = getUserRole();

  const commands = useMemo<Command[]>(() => [
    { label: "Open dashboard", description: "Workspace overview", path: "/", icon: BarChart3 },
    { label: "Open my workday", description: "Focused field service queue", path: "/work", icon: CalendarCheck2 },
    { label: "Open command center", description: "Operational control", path: "/command", icon: Bot },
    { label: "Open tasks", description: "Operational task list", path: "/tasks", icon: ClipboardList },
    { label: "Open fleet", description: "Vehicles and readiness", path: "/fleet", icon: Truck },
    { label: "Open sites", description: "Sites and risk", path: "/sites", icon: MapPin },
    { label: "Open employees", description: "Team availability", path: "/employees", icon: Users },
    { label: "Open live map", description: "Live operational map", path: "/map", icon: Map },
    { label: "Open Business OS", description: "Customers and finance", path: "/business", icon: BriefcaseBusiness },
    { label: "Open document center", description: "Business files", path: "/business", state: { view: "documents" }, icon: FolderOpen },
    { label: "Open business calendar", description: "Tasks and deadlines", path: "/business", state: { view: "calendar" }, icon: CalendarDays },
    { label: "Create customer", description: "Quick business action", path: "/business", state: { quickCreate: "customer" }, icon: Plus },
    { label: "Open analytics", description: "Charts and performance", path: "/analytics", icon: BarChart3 },
    { label: "Generate report", description: "Export workspace report", path: "/reports", icon: FileText },
    { label: "Ask AI Commander", description: "Get an action plan", path: "/ai", icon: Bot },
    { label: "Open settings", description: "Workspace configuration", path: "/settings", icon: Settings },
    { label: "Open team access", description: "Users and role permissions", path: "/team", icon: ShieldCheck },
    { label: "Open plans and trial", description: "Product readiness and billing preview", path: "/plans", icon: CreditCard },
    { label: "Run business automations", description: "Check active workflows now", icon: Play, action: async () => { const result = await business.runAutomations(); toast.success(`${result.ran} workflows checked · ${result.created} tasks created`); } },
  ].filter((command) => !command.path || canAccess(role, command.path)), [business, role]);

  const filtered = commands.filter((command) => `${command.label} ${command.description}`.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen((value) => !value); }
      if (event.key === "Escape") setOpen(false);
    }
    function handleOpen() { setOpen(true); }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("nexora:command", handleOpen);
    return () => { window.removeEventListener("keydown", handleKeyDown); window.removeEventListener("nexora:command", handleOpen); };
  }, []);

  async function runCommand(command: Command) {
    if (command.action) {
      setRunning(true);
      try { await command.action(); } catch (error) { toast.error(error instanceof Error ? error.message : "Command failed"); } finally { setRunning(false); }
    } else if (command.path) {
      navigate(command.path, { state: command.state });
    }
    setOpen(false);
    setQuery("");
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center bg-slate-950/30 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}>
      <div role="dialog" aria-modal="true" aria-label="Command palette" className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5"><Search size={18} className="text-slate-400" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type a command or destination…" className="min-w-0 flex-1 text-sm text-slate-900 outline-none" /><kbd className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-400">ESC</kbd><button type="button" aria-label="Close commands" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X size={16} /></button></div>
        <div className="max-h-[420px] overflow-y-auto p-2">
          {filtered.length ? filtered.map((command) => { const Icon = command.icon; return <button type="button" disabled={running} key={command.label} onClick={() => void runCommand(command)} className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-blue-50 disabled:opacity-50"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500"><Icon size={17} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">{command.label}</span><span className="block text-xs text-slate-500">{command.description}</span></span><span className="text-slate-300">↵</span></button>; }) : <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">No matching commands.</div>}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-[11px] text-slate-400"><span>Navigate and take actions from anywhere</span><span>⌘K to toggle</span></div>
      </div>
    </div>
  );
}
