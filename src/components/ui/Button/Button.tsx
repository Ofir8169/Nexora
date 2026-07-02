type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  onClick?: () => void;
};

export default function Button({
  children,
  variant = "primary",
  onClick,
}: ButtonProps) {
  const styles = {
    primary: "bg-slate-950 text-white hover:bg-slate-800",
    secondary: "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-500",
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${styles[variant]}`}
    >
      {children}
    </button>
  );
}