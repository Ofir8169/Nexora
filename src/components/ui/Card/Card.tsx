type CardProps = {
  title?: string;
  children: React.ReactNode;
};

export default function Card({ title, children }: CardProps) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      {title && (
        <h2 className="mb-5 text-xl font-bold text-slate-900">
          {title}
        </h2>
      )}

      {children}
    </div>
  );
}