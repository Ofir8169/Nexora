import CountUp from "react-countup";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";

type KPICardProps = {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: "blue" | "green" | "purple" | "orange" | "red";
};

const chartData = [
  { value: 12 },
  { value: 18 },
  { value: 15 },
  { value: 24 },
  { value: 21 },
  { value: 28 },
  { value: 34 },
];

export default function KPICard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
}: KPICardProps) {
  const styles = {
    blue: {
      card: "border-blue-400/40 shadow-blue-500/20",
      icon: "bg-blue-500/20 text-blue-300 border-blue-400/40",
      line: "#3b82f6",
      text: "text-blue-300",
    },
    green: {
      card: "border-green-400/40 shadow-green-500/20",
      icon: "bg-green-500/20 text-green-300 border-green-400/40",
      line: "#22c55e",
      text: "text-green-300",
    },
    purple: {
      card: "border-purple-400/40 shadow-purple-500/20",
      icon: "bg-purple-500/20 text-purple-300 border-purple-400/40",
      line: "#a855f7",
      text: "text-purple-300",
    },
    orange: {
      card: "border-orange-400/40 shadow-orange-500/20",
      icon: "bg-orange-500/20 text-orange-300 border-orange-400/40",
      line: "#f59e0b",
      text: "text-orange-300",
    },
    red: {
      card: "border-red-400/40 shadow-red-500/20",
      icon: "bg-red-500/20 text-red-300 border-red-400/40",
      line: "#ef4444",
      text: "text-red-300",
    },
  };

  const s = styles[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.35 }}
      className={`relative overflow-hidden rounded-3xl border bg-slate-900/85 p-5 shadow-2xl backdrop-blur-xl ${s.card}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div
            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border ${s.icon}`}
          >
            {icon}
          </div>

          <p className="text-sm font-bold text-slate-300">{title}</p>

          <p className="mt-2 text-4xl font-black text-white">
            <CountUp end={value} duration={0.9} />
          </p>

          {subtitle && (
            <p className={`mt-2 text-sm font-black ${s.text}`}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="h-24 w-28">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <Area
                type="monotone"
                dataKey="value"
                stroke={s.line}
                fill={s.line}
                fillOpacity={0.18}
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}