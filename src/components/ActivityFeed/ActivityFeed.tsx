const activities = [
  { time: "09:21", text: "Team Alpha uploaded 8 photos" },
  { time: "09:34", text: "Vehicle BW-104 inspection required" },
  { time: "10:12", text: "Calibration task completed" },
  { time: "11:05", text: "New issue reported at Site North" },
];

export default function ActivityFeed() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-xl font-semibold text-slate-950">Live Activity</h2>

      <div className="mt-5 space-y-4">
        {activities.map((item) => (
          <div key={item.time} className="flex gap-4">
            <span className="text-sm font-medium text-slate-400">{item.time}</span>
            <p className="text-sm text-slate-700">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}