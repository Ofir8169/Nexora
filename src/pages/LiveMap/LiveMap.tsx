import {
  AlertTriangle,
  Bot,
  Layers,
  MapPin,
  RadioTower,
  Route,
  Satellite,
  Truck,
  Users,
} from "lucide-react";
import { useState } from "react";

import StableMap from "../../components/maps/StableMap";
import { useApp } from "../../context/app-context";

import PageHeader from "../../components/ui-v2/PageHeader";
import Panel from "../../components/ui-v2/Panel";
import KPI from "../../components/ui-v2/KPI";

const locations = [
  { lat: 32.584, lng: 35.184 },
  { lat: 32.085, lng: 34.781 },
  { lat: 32.794, lng: 34.989 },
  { lat: 31.768, lng: 35.213 },
];

export default function LiveMap() {

  const [layers, setLayers] = useState<Record<string, boolean>>({
    Satellite: true,
    Terrain: false,
    Routes: true,
    Fleet: true,
    Sites: true,
    "AI Overlay": false,
    Telemetry: true,
  });

  const toggleLayer = (title: string) =>
    setLayers((current) => ({ ...current, [title]: !current[title] }));

  const {
    sites,
    fleet,
    employees,
    tasks,
  } = useApp();

  const criticalFleet =
    fleet.filter(v => v.status === "Critical").length;

  const highRiskSites =
    sites.filter(s => s.risk >= 70).length;

  const openTasks =
    tasks.filter(t => t.status !== "Done").length;

  const operationsMarkers = [

    ...sites.map((site, index) => ({

      id: `site-${site.id}`,

      lat: locations[index % locations.length].lat,

      lng: locations[index % locations.length].lng,

      title: site.name,

      lines: [

        `Risk: ${site.risk}%`,

        `Vehicles: ${site.vehicles}`,

        `Employees: ${site.employees}`,

      ],

    })),

    ...fleet.map((vehicle, index) => ({

      id: `vehicle-${vehicle.id}`,

      lat:
        locations[index % locations.length].lat +
        0.035,

      lng:
        locations[index % locations.length].lng +
        0.035,

      title: vehicle.name,

      lines: [

        `Status: ${vehicle.status}`,

        `Site: ${vehicle.site}`,

        `Health: ${vehicle.health}`,

      ],

    })),

  ];

  return (

    <div className="space-y-8 pb-10">
    <PageHeader
  eyebrow="OPERATIONS"
  title="Operations Center"
  description="Live command map for fleet, telemetry, operators and mission awareness."
  action={
    <div className="rounded-2xl border border-green-400/30 bg-green-500/10 px-5 py-3 font-bold text-green-300">
      ● LIVE
    </div>
  }
/>

<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

  <KPI
    icon={<MapPin />}
    title="Sites"
    value={sites.length}
    note={`${highRiskSites} High Risk`}
    color="cyan"
  />

  <KPI
    icon={<Truck />}
    title="Fleet"
    value={fleet.length}
    note={`${criticalFleet} Critical`}
    color="green"
  />

  <KPI
    icon={<Users />}
    title="Operators"
    value={employees.length}
    note="Available"
    color="blue"
  />

  <KPI
    icon={<AlertTriangle />}
    title="Open Tasks"
    value={openTasks}
    note="Need Attention"
    color="orange"
  />

</div>

<div className="grid min-w-0 gap-6 xl:grid-cols-[300px_minmax(0,1fr)_340px]">

  <Panel title="Layers">

    <div className="space-y-3">

      <LayerButton
        icon={<Satellite size={18}/>}
        title="Satellite"
        active={layers.Satellite}
        onToggle={() => toggleLayer("Satellite")}
      />

      <LayerButton
        icon={<Layers size={18}/>}
        title="Terrain"
        active={layers.Terrain}
        onToggle={() => toggleLayer("Terrain")}
      />

      <LayerButton
        icon={<Route size={18}/>}
        title="Routes"
        active={layers.Routes}
        onToggle={() => toggleLayer("Routes")}
      />

      <LayerButton
        icon={<Truck size={18}/>}
        title="Fleet"
        active={layers.Fleet}
        onToggle={() => toggleLayer("Fleet")}
      />

      <LayerButton
        icon={<MapPin size={18}/>}
        title="Sites"
        active={layers.Sites}
        onToggle={() => toggleLayer("Sites")}
      />

      <LayerButton
        icon={<Bot size={18}/>}
        title="AI Overlay"
        active={layers["AI Overlay"]}
        onToggle={() => toggleLayer("AI Overlay")}
      />

      <LayerButton
        icon={<RadioTower size={18}/>}
        title="Telemetry"
        active={layers.Telemetry}
        onToggle={() => toggleLayer("Telemetry")}
      />

    </div>

  </Panel>

  <Panel
    title="Live Command Map"
    className="min-w-0"
  >

    <div className="relative h-[720px] overflow-hidden rounded-2xl">

      <StableMap
        markers={operationsMarkers.filter((marker) =>
          marker.id.startsWith("site-") ? layers.Sites : layers.Fleet
        )}
        height="720px"
        center={[32.30,35]}
        zoom={8}
        interactive
      />

      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl">

        <p className="text-xs font-black uppercase tracking-widest text-cyan-400">
          MAP MODE
        </p>

        <p className="text-sm font-bold text-white">
          Live Assets
        </p>

      </div>

    </div>

  </Panel>

  <Panel title="AI Operations Feed">

    <div className="space-y-4">

      <AIItem
        title="Fleet"
        text={
          criticalFleet
            ? `${criticalFleet} critical vehicle detected`
            : "Fleet healthy"
        }
        tone="cyan"
      />

      <AIItem
        title="Sites"
        text={
          highRiskSites
            ? `${highRiskSites} high risk sites`
            : "Sites stable"
        }
        tone="orange"
      />

      <AIItem
        title="Planning"
        text="AI route planning module ready."
        tone="purple"
      />

    </div>

  </Panel>

</div>
<div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">

  <Panel title="Fleet Overview">

    <div className="overflow-hidden rounded-2xl border border-white/10">

      <table className="w-full">

        <thead className="bg-slate-900">

          <tr className="text-left text-xs uppercase tracking-wider text-slate-400">

            <th className="px-4 py-3">Vehicle</th>

            <th className="px-4 py-3">Site</th>

            <th className="px-4 py-3">Health</th>

            <th className="px-4 py-3">Status</th>

          </tr>

        </thead>

        <tbody>

          {fleet.map(vehicle => (

            <tr
              key={vehicle.id}
              className="border-t border-white/5 hover:bg-slate-900/60"
            >

              <td className="px-4 py-3 font-bold text-white">
                {vehicle.name}
              </td>

              <td className="px-4 py-3 text-slate-300">
                {vehicle.site}
              </td>

              <td className="px-4 py-3 text-slate-300">
                {vehicle.health}
              </td>

              <td className="px-4 py-3">

                <StatusBadge
                  value={vehicle.status}
                />

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  </Panel>

  <Panel title="Mission Timeline">

    <div className="space-y-4">

      <TimelineItem
        time="08:20"
        title="Mission Started"
        text="BW104 assigned to Alpha site."
      />

      <TimelineItem
        time="09:05"
        title="Telemetry Updated"
        text="Fleet communication synchronized."
      />

      <TimelineItem
        time="10:40"
        title="AI Recommendation"
        text="Maintenance suggested for BW106."
      />

      <TimelineItem
        time="11:55"
        title="Operator Assigned"
        text="Mission reassigned automatically."
      />

    </div>

  </Panel>

</div>

</div>

);
}function LayerButton({
  icon,
  title,
  active = false,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  active?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`flex w-full items-center justify-between rounded-2xl border p-4 transition ${
        active
          ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
          : "border-white/10 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-bold">{title}</span>
      </div>

      <div
        className={`h-2.5 w-2.5 rounded-full ${
          active ? "bg-cyan-400" : "bg-slate-600"
        }`}
      />
    </button>
  );
}

function AIItem({
  title,
  text,
  tone,
}: {
  title: string;
  text: string;
  tone: "cyan" | "orange" | "purple";
}) {
  const colors = {
    cyan: "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
    orange: "border-orange-400/20 bg-orange-500/10 text-orange-300",
    purple: "border-purple-400/20 bg-purple-500/10 text-purple-300",
  };

  return (
    <div className={`rounded-2xl border p-4 ${colors[tone]}`}>
      <p className="font-black">{title}</p>

      <p className="mt-2 text-sm leading-6 text-slate-200">
        {text}
      </p>
    </div>
  );
}

function StatusBadge({
  value,
}: {
  value: string;
}) {
  const color =
    value === "Critical"
      ? "border-red-400/30 bg-red-500/10 text-red-300"
      : value === "Maintenance"
      ? "border-orange-400/30 bg-orange-500/10 text-orange-300"
      : "border-green-400/30 bg-green-500/10 text-green-300";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-black ${color}`}
    >
      {value}
    </span>
  );
}

function TimelineItem({
  time,
  title,
  text,
}: {
  time: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <div className="min-w-[60px] text-xs font-black text-cyan-400">
        {time}
      </div>

      <div>
        <p className="font-black text-white">
          {title}
        </p>

        <p className="mt-1 text-sm leading-6 text-slate-400">
          {text}
        </p>
      </div>
    </div>
  );
}
