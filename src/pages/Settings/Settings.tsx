import { RotateCcw, Settings as SettingsIcon, Shield, Database } from "lucide-react";
import { useApp } from "../../context/AppContext";
import Card from "../../components/ui/Card/Card";

export default function Settings() {
  const { resetDemoData } = useApp();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600">System</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-950">Settings</h1>
        <p className="mt-2 text-slate-500">
          Manage local demo data and system preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Workspace">
          <div className="space-y-4 text-sm text-slate-700">
            <SettingRow icon={<SettingsIcon />} label="Workspace" value="OpsFlow Demo" />
            <SettingRow icon={<Shield />} label="Mode" value="Local MVP" />
            <SettingRow icon={<Database />} label="Storage" value="localStorage" />
          </div>
        </Card>

        <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm lg:col-span-2">
          <h2 className="text-xl font-semibold">Demo Data</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            This version stores data locally on your computer. You can reset the
            demo data anytime. Later we will connect this to Supabase.
          </p>

          <button
            onClick={resetDemoData}
            className="mt-6 flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-500"
          >
            <RotateCcw size={18} />
            Reset Demo Data
          </button>
        </div>
      </div>
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
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className="text-blue-600">{icon}</div>
        <span className="font-semibold">{label}</span>
      </div>

      <span className="text-slate-500">{value}</span>
    </div>
  );
}