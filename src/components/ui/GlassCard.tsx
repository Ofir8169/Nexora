type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`rounded-3xl border border-blue-400/20 bg-slate-900/80 p-6 shadow-2xl shadow-blue-500/10 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}