import React from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";

import StableMap from "../../components/maps/StableMap";
import { useApp } from "../../context/AppContext";

const locations = [
  { lat: 32.584, lng: 35.184 },
  { lat: 32.085, lng: 34.781 },
  { lat: 32.794, lng: 34.989 },
  { lat: 31.768, lng: 35.213 },
];

export default function Dashboard() {
  const { fleet, employees, tasks, sites } = useApp();

  const criticalFleet = fleet.filter(
    (vehicle) => vehicle.status === "Critical"
  ).length;

  const availableEmployees = employees.filter(
    (employee) => employee.status === "Available"
  ).length;

  const openTasks = tasks.filter(
    (task) => task.status !== "Done"
  );

  const completedTasks = tasks.filter(
    (task) => task.status === "Done"
  ).length;

  const readiness =
    fleet.length === 0
      ? 100
      : Math.round(
          ((fleet.length - criticalFleet) / fleet.length) * 100
        );

  const dashboardMarkers = sites.map((site, index) => ({
    id: String(site.id),
    lat: locations[index % locations.length].lat,
    lng: locations[index % locations.length].lng,
    title: site.name,
    lines: [
      `Risk: ${site.risk}%`,
      `Vehicles: ${site.vehicles}`,
      `Employees: ${site.employees}`,
    ],
  }));

  const priorityTasks = [...openTasks]
    .sort((a: any, b: any) => {
      const pa = Number(a.priorityScore ?? 0);
      const pb = Number(b.priorityScore ?? 0);
      return pb - pa;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-400">
            Mission Control
          </p>

      <h1 className="mt-2 text-4xl font-black text-white">
        Operational Dashboard
      </h1>

      <p className="mt-2 max-w-2xl text-slate-400">
        Monitor fleet, employees, sites and missions from one command center.
      </p>
    </div>

    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>

        <span className="font-semibold text-emerald-300">
          All Systems Online
        </span>
      </div>
    </div>
  </section>

  <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

    <StatCard
      icon={<ShieldCheck size={20} />}
      label="Readiness"
      value={`${readiness}%`}
      note="Fleet readiness"
      tone="green"
    />

    <StatCard
      icon={<Truck size={20} />}
      label="Fleet"
      value={fleet.length}
      note={`${criticalFleet} critical`}
      tone="cyan"
    />

    <StatCard
      icon={<Clock3 size={20} />}
      label="Open Tasks"
      value={openTasks.length}
      note={`${completedTasks} completed`}
      tone="orange"
    />

    <StatCard
      icon={<Users size={20} />}
      label="Employees"
      value={employees.length}
      note={`${availableEmployees} available`}
      tone="blue"
    />

  </section>

  <section className="grid gap-6 xl:grid-cols-[1.7fr_380px]">

    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900">

      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

        <div>

          <h2 className="text-xl font-bold text-white">
            Live Operations Map
          </h2>

          <p className="text-sm text-slate-400">
            Active Sites
          </p>

        </div>

        <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
          LIVE
        </div>

      </div>

      <StableMap
        markers={dashboardMarkers}
        center={[32.25,35]}
        zoom={8}
        height="520px"
        interactive={false}
      />

    </div>

    <div className="space-y-5">

      <div className="rounded-3xl border border-cyan-500/20 bg-slate-900 p-6">

        <div className="flex items-center gap-3">

          <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
            <Bot size={24}/>
          </div>

          <div>

            <h2 className="font-bold text-white">
              AI Commander
            </h2>

            <p className="text-xs text-slate-400">
              Live Recommendations
            </p>

          </div>

        </div>

        <div className="mt-6 space-y-4">

          <InsightCard
            title="Fleet"
            text={
              criticalFleet
                ? `${criticalFleet} vehicle requires maintenance`
                : "Fleet operating normally"
            }
            critical={criticalFleet>0}
          />

          <InsightCard
            title="Employees"
            text={`${availableEmployees} operators currently available`}
          />

          <InsightCard
            title="Sites"
            text={`${sites.length} active sites connected`}
          />

        </div>

        <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 font-semibold text-white hover:bg-white/10">

          Open AI Assistant

          <ArrowUpRight size={18}/>

        </button>

      </div><div className="rounded-3xl border border-white/10 bg-slate-900 p-6">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="font-bold text-white">
              System Pulse
            </h2>

            <p className="text-xs text-slate-400">
              Live infrastructure status
            </p>

          </div>

          <Activity className="text-cyan-400" size={20} />

        </div>

        <div className="mt-6 space-y-4">

          <PulseRow
            label="Connected Sites"
            value={`${sites.length}`}
          />

          <PulseRow
            label="Fleet Online"
            value={`${fleet.length-criticalFleet}/${fleet.length}`}
          />

          <PulseRow
            label="Available Operators"
            value={`${availableEmployees}`}
          />

          <PulseRow
            label="Open Tasks"
            value={`${openTasks.length}`}
          />

        </div>

      </div>

    </div>

  </section>

  <section className="grid gap-6 xl:grid-cols-2">

    <div className="rounded-3xl border border-white/10 bg-slate-900">

      <div className="border-b border-white/10 px-6 py-5">

        <div className="flex items-center gap-3">

          <AlertTriangle
            className="text-orange-400"
            size={20}
          />

          <h2 className="font-bold text-white">
            Priority Tasks
          </h2>

        </div>

      </div>

      <div className="divide-y divide-white/5">

        {priorityTasks.length > 0 ? (

          priorityTasks.map((task:any)=>(
            <div
              key={task.id}
              className="flex items-center justify-between px-6 py-5"
            >

              <div>

                <p className="font-semibold text-white">
                  {task.title}
                </p>

                <p className="text-sm text-slate-400">
                  {task.status}
                </p>

              </div>

              <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">
                Priority
              </span>

            </div>
          ))

        ) : (

          <EmptyState
            text="No priority tasks"
          />

        )}

      </div>

    </div>

    <div className="rounded-3xl border border-white/10 bg-slate-900">

      <div className="border-b border-white/10 px-6 py-5">

        <div className="flex items-center gap-3">

          <CheckCircle2
            className="text-emerald-400"
            size={20}
          />

          <h2 className="font-bold text-white">
            Recent Activity
          </h2>

        </div>

      </div>

      <div className="p-3">

        <ActivityRow
          icon={<Truck size={18}/>}
          title="Fleet synchronized"
          text={`${fleet.length} vehicles connected`}
        />

        <ActivityRow
          icon={<Users size={18}/>}
          title="Employees updated"
          text={`${availableEmployees} operators available`}
        />

        <ActivityRow
          icon={<MapPin size={18}/>}
          title="Sites connected"
          text={`${sites.length} active sites`}
        />

        <ActivityRow
          icon={<Clock3 size={18}/>}
          title="Task queue refreshed"
          text={`${openTasks.length} active tasks`}
        />

      </div>

    </div>

  </section>

</div>

);
}
type StatTone = "green" | "cyan" | "orange" | "blue";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  note: string;
  tone: StatTone;
}

function StatCard({
  icon,
  label,
  value,
  note,
  tone,
}: StatCardProps) {
  const tones: Record<StatTone, string> = {
    green:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    cyan:
      "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
    orange:
      "border-orange-500/20 bg-orange-500/10 text-orange-300",
    blue:
      "border-blue-500/20 bg-blue-500/10 text-blue-300",
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${tones[tone]}`}
      >
        {icon}
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black text-white">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {note}
      </p>
    </div>
  );
}

interface InsightCardProps {
  title: string;
  text: string;
  critical?: boolean;
}

function InsightCard({
  title,
  text,
  critical = false,
}: InsightCardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        critical
          ? "border-red-500/20 bg-red-500/10"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <p
        className={`text-sm font-bold ${
          critical
            ? "text-red-300"
            : "text-cyan-300"
        }`}
      >
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-300">
        {text}
      </p>
    </div>
  );
}

interface PulseRowProps {
  label: string;
  value: string;
}

function PulseRow({
  label,
  value,
}: PulseRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-sm font-bold text-white">
        {value}
      </span>
    </div>
  );
}

interface ActivityRowProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

function ActivityRow({
  icon,
  title,
  text,
}: ActivityRowProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl px-3 py-4 transition hover:bg-white/[0.03]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-cyan-300">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  text: string;
}

function EmptyState({
  text,
}: EmptyStateProps) {
  return (
    <div className="px-6 py-12 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}