export default function StatSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
      <div className="mt-3">{children}</div>
    </section>
  );
}
