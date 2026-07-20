import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("ofir@nexora.ai");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    setLoading(true);

    setTimeout(() => {
      localStorage.setItem("nexora_logged_in", "true");
      localStorage.setItem("nexora_user", email);
      localStorage.setItem("nexora_remember", String(remember));
      window.location.href = "/";
    }, 700);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] p-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.25),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(168,85,247,0.18),transparent_30%)]" />

      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-[linear-gradient(rgba(34,211,238,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.12)_1px,transparent_1px)] bg-[size:54px_54px]" />
      </div>

      <div className="relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_440px]">
        <div className="hidden flex-col justify-between rounded-[2rem] border border-white/10 bg-slate-900/60 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl lg:flex">
          <div>
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/15 text-cyan-300">
              <Sparkles size={30} />
            </div>

            <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
              Nexora Command OS
            </p>

            <h1 className="mt-4 max-w-xl text-6xl font-black leading-tight">
              Mission control for modern operations.
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">
              Fleet, tasks, sites, AI insights and live command tools in one
              operational workspace.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Mini label="Fleet" value="Live" />
            <Mini label="AI" value="Ready" />
            <Mini label="Map" value="Online" />
          </div>
        </div>

        <div className="rounded-[2rem] border border-cyan-400/20 bg-slate-900/90 p-8 shadow-2xl shadow-cyan-500/20 backdrop-blur-2xl">
          <div className="mb-8">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
              <ShieldCheck />
            </div>

            <h2 className="text-3xl font-black">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-400">
              Sign in to Nexora Command OS.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-300">
                Email
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950 px-4 py-4">
                <Mail size={18} className="text-cyan-300" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
                  placeholder="Email"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-300">
                Password
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950 px-4 py-4">
                <Lock size={18} className="text-cyan-300" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  type="checkbox"
                  className="h-4 w-4"
                />
                Remember me
              </label>

              <button className="font-bold text-cyan-300 hover:text-cyan-200">
                Forgot password?
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-4 font-black text-white shadow-xl shadow-cyan-500/20 transition hover:scale-[1.01] disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Demo login now. Supabase Auth will replace this later.
          </p>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}