import Sidebar from "../components/Sidebar/Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f5f7fb]">
      <Sidebar />

      <main className="flex-1 p-8">
        <section className="mx-auto max-w-7xl">{children}</section>
      </main>
    </div>
  );
}