"use client";

import type { Incidencia } from "@/lib/datex";

function formatHora(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function IncidentBanner({
  incidencias,
  loading,
  errored,
}: {
  incidencias: Incidencia[] | null;
  loading: boolean;
  errored: boolean;
}) {
  if (loading && incidencias === null) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Comprobando incidencias en la M-607…
      </div>
    );
  }

  if (errored) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        No se ha podido consultar el estado del tráfico de la DGT ahora mismo.
      </div>
    );
  }

  if (!incidencias || incidencias.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
        ✓ Sin incidencias activas en el tramo Madrid – Colmenar Viejo
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm dark:border-rose-900 dark:bg-rose-950">
      <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">
        ⚠ {incidencias.length}{" "}
        {incidencias.length === 1 ? "incidencia activa" : "incidencias activas"}
      </p>
      <ul className="space-y-1.5">
        {incidencias.map((inc) => (
          <li
            key={inc.id}
            className="text-sm text-rose-900 dark:text-rose-100"
          >
            <span className="font-medium">{inc.causa}</span>
            {inc.detalle && <span> · {inc.detalle}</span>}
            {inc.pk !== null && <span> · PK {inc.pk}</span>}
            {inc.municipio && <span> · {inc.municipio}</span>}
            {inc.desde && (
              <span className="block text-xs text-rose-700/80 dark:text-rose-300/80">
                Desde {formatHora(inc.desde)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
