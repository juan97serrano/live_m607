export default function TablaDetalle({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  if (rows.length === 0) return null;

  return (
    <details className="mt-2 text-xs">
      <summary className="cursor-pointer select-none text-slate-500 dark:text-slate-400">
        Ver tabla
      </summary>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-left">
          <thead>
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="border-b border-slate-200 pb-1 pr-3 font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="py-0.5 pr-3 tabular-nums">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
