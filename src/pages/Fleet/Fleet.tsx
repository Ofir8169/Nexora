import {
  AlertTriangle,
  CheckCircle2,
  Truck,
  Wrench,
  Battery,
  MapPin,
} from "lucide-react";
import Badge from "../../components/ui/Badge/Badge";
import Card from "../../components/ui/Card/Card";

const vehicles = [
  {
    name: "Truck BW-104",
    type: "Service Truck",
    site: "Site North",
    status: "Critical",
    health: "62%",
    issues: 2,
  },
  {
    name: "Truck 08",
    type: "Heavy Vehicle",
    site: "Haifa Yard",
    status: "Active",
    health: "91%",
    issues: 0,
  },
  {
    name: "Van 12",
    type: "Field Crew",
    site: "Tel Aviv Project",
    status: "Maintenance",
    health: "74%",
    issues: 1,
  },
  {
    name: "Generator Unit 3",
    type: "Equipment",
    site: "Jerusalem Site",
    status: "Active",
    health: "88%",
    issues: 0,
  },
];

export default function Fleet() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600">Assets</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-950">Fleet</h1>
        <p className="mt-2 text-slate-500">
          Monitor vehicles, equipment health, open issues and operational
          readiness.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <FleetStat icon={<Truck />} title="Total Assets" value="24" />
        <FleetStat icon={<CheckCircle2 />} title="Operational" value="19" />
        <FleetStat icon={<Wrench />} title="Maintenance" value="3" />
        <FleetStat icon={<AlertTriangle />} title="Critical" value="2" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="overflow-hidden">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.name}
                className="grid grid-cols-5 items-center border-b border-slate-100 py-5 last:border-b-0 hover:bg-slate-50"
              >
                <div className="col-span-2">
                  <p className="font-semibold text-slate-950">{vehicle.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{vehicle.type}</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin size={16} />
                  {vehicle.site}
                </div>

                <Badge color={getBadgeColor(vehicle.status)}>
                  {vehicle.status}
                </Badge>

                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {vehicle.health}
                  </p>
                  <p className="text-xs text-slate-500">
                    {vehicle.issues} open issues
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <aside className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <Battery className="text-blue-400" />
            <h2 className="text-xl font-semibold">AI Fleet Brief</h2>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            Truck BW-104 should not be deployed before inspection. Van 12 is due
            for maintenance within 48 hours. Fleet readiness is currently 79%.
          </p>

          <div className="mt-6 space-y-3">
            <AIAction text="Assign backup vehicle to Site North" />
            <AIAction text="Open maintenance task for Van 12" />
            <AIAction text="Review critical issues before 12:00" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function FleetStat({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        {icon}
      </div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function AIAction({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 text-sm text-slate-300">
      {text}
    </div>
  );
}

function getBadgeColor(status: string): "green" | "orange" | "red" | "blue" {
  if (status === "Critical") return "red";
  if (status === "Maintenance") return "orange";
  if (status === "Active") return "green";
  return "blue";
}