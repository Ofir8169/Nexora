import Header from "../../components/Header/Header";
import ActivityFeed from "../../components/ActivityFeed/ActivityFeed";
import StatCard from "../../components/StatCard/StatCard";
import AICopilot from "../../features/ai/AICopilot";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  Bot,
  MapPin,
} from "lucide-react";

export default function Dashboard() {
  return (
    <>
      <Header />

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard icon={<CheckCircle2 />} title="Completed" value="18" />
        <StatCard icon={<Clock />} title="In Progress" value="8" />
        <StatCard icon={<AlertTriangle />} title="Critical" value="2" />
        <StatCard icon={<Truck />} title="Vehicles" value="6" />
        <StatCard icon={<Activity />} title="Live Events" value="34" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <Bot className="text-blue-400" />
            <h2 className="text-xl font-semibold">AI Mission Brief</h2>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            Today has 12 active missions. Truck BW-104 requires inspection before
            deployment. Site North has 2 open safety issues. Recommended action:
            assign a backup vehicle and complete the safety checklist before 12:00.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <MiniCard title="Risk Level" value="Medium" />
            <MiniCard title="Blocked Tasks" value="2" />
            <MiniCard title="AI Actions" value="5" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-3">
            <MapPin className="text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-950">
              Mission Board
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            <Mission title="BW-104 Inspection" status="Critical" />
            <Mission title="Site North Deployment" status="In Progress" />
            <Mission title="Generator Maintenance" status="In Progress" />
            <Mission title="Safety Review" status="Completed" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
          <h2 className="text-xl font-semibold text-slate-950">
            Live Timeline
          </h2>

          <div className="mt-5 space-y-5">
            <Timeline time="09:12" text="Ofir completed BW-104 visual inspection." />
            <Timeline time="09:18" text="Maya uploaded 12 field photos." />
            <Timeline time="09:27" text="AI recommended backup vehicle for Site North." />
            <Timeline time="09:41" text="New critical issue opened at Haifa Yard." />
          </div>
        </div>

        <AICopilot />
        
      </div>
    </>
  );
}

function MiniCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function Mission({ title, status }: { title: string; status: string }) {
  const color =
    status === "Critical"
      ? "bg-red-100 text-red-700"
      : status === "Completed"
      ? "bg-green-100 text-green-700"
      : "bg-orange-100 text-orange-700";

  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
      <p className="font-semibold text-slate-900">{title}</p>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}>
        {status}
      </span>
    </div>
  );
}

function Timeline({ time, text }: { time: string; text: string }) {
  return (
    <div className="flex gap-4">
      <span className="w-12 text-sm font-semibold text-slate-400">{time}</span>
      <p className="text-sm text-slate-700">{text}</p>
    </div>
  );
}