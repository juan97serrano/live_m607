export type BarDatum = { label: string; value: number; title?: string };

export default function BarChart({
  data,
  color = "var(--series-1)",
  showLabelEvery = 1,
}: {
  data: BarDatum[];
  color?: string;
  showLabelEvery?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const peakIndex = data.reduce(
    (best, d, i) => (d.value > data[best].value ? i : best),
    0
  );

  return (
    <div className="viz-root">
      <div className="flex h-32 items-end gap-[2px]">
        {data.map((d, i) => (
          <div
            key={i}
            title={`${d.title ?? d.label}: ${d.value}`}
            className="flex h-full min-w-[6px] flex-1 flex-col items-center justify-end"
          >
            {i === peakIndex && d.value > 0 && (
              <span className="mb-0.5 text-[10px] font-semibold tabular-nums text-slate-600 dark:text-slate-300">
                {d.value}
              </span>
            )}
            <div
              className="w-full rounded-t"
              style={{
                height: `${Math.max(2, (d.value / max) * 100)}%`,
                backgroundColor: d.value > 0 ? color : "transparent",
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-[2px] border-t border-slate-200 pt-1 dark:border-slate-800">
        {data.map((d, i) => (
          <div key={i} className="min-w-[6px] flex-1 text-center">
            {i % showLabelEvery === 0 && (
              <span className="text-[9px] text-slate-400 dark:text-slate-500">
                {d.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
