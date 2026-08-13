import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-lg font-bold">M-607 en directo</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Madrid ↔ Colmenar Viejo · cámaras y estado del tráfico DGT
          </p>
        </div>
      </header>

      <main className="flex-1">
        <Dashboard />
      </main>

      <footer className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        Datos e imágenes: Dirección General de Tráfico (DGT)
      </footer>
    </div>
  );
}
