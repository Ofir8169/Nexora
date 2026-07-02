type BadgeProps = {
  children: React.ReactNode;
  color?: "green" | "orange" | "red" | "blue";
};

export default function Badge({
  children,
  color = "blue",
}: BadgeProps) {
  const styles = {
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[color]}`}
    >
      {children}
    </span>
  );
}