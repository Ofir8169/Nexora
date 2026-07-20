import {
  Database,
  RotateCcw,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  User,
  HardDrive,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function Settings() {
  const { resetDemoData } = useApp();

  return (
    <div className="pb-10 text-white">
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
          System Control
        </p>
        <h1 className="mt-2 text-5xl font-black tracking-tight text-white">
          Settings
        </h1>
        <p className="mt-3 text-lg text-slate-300">
          Manage workspace preferences, local storage and demo data.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Workspace">
          <div className="space-y-4">
            <SettingRow icon={<Sparkles />} label="Product" value="Nexora" />
            <SettingRow icon={<User />} label="User" value="Ofir" />
            <SettingRow icon={<Shield />} label="Mode" value="Local MVP" />
            <SettingRow icon={<Database />} label="Storage" value="localStorage" />
          </div>
        </Panel>

        <div className="xl:col-span-2">
          <Panel title="Demo Data">
            <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6">
              <div className="flex items-center gap-3 text-red-300">
                <HardDrive />
                <h2 className="text-xl font-black">Reset Local Data</h2>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                This version stores data locally on your computer. Resetting demo
                data will restore tasks, fleet, employees and sites to their
                default state.
              </p>

              <button
                onClick={resetDemoData}
                className="mt-6 flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-500"
              >
                <RotateCcw size={18} />
                Reset Demo Data
              </button>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="System Status">
          <Status label="Frontend" value="Online" />
          <Status label="AppContext" value="Active" />
          <Status label="Notifications" value="Enabled" />
        </Panel>

        <Panel title="Future Backend">
          <p className="text-sm leading-7 text-slate-300">
            Supabase will be connected later for authentication, database,
            companies, users and realtime updates.
          </p>
        </Panel>

        <Panel title="AI Layer">
          <p className="text-sm leading-7 text-slate-300">
            Nexora AI is currently running in local demo mode. Future versions
            will connect real operational intelligence.
          </p>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-blue-400/30 bg-slate-900/95 p-6 shadow-2xl shadow-blue-500/20">
      <h2 className="mb-5 text-2xl font-black text-white">{title}</h2>
      {children}
    </div>
  );
}

function SettingRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <div className="flex items-center gap-3">
        <div className="text-cyan-300">{icon}</div>
        <span className="text-sm font-black text-white">{label}</span>
      </div>

      <span className="text-sm font-bold text-slate-300">{value}</span>
    </div>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-2xl border border-green-400/20 bg-green-500/10 p-4">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="text-sm font-black text-green-300">● {value}</span>
    </div>
  );
}