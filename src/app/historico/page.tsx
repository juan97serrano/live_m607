import Link from "next/link";
import { getEstadisticas } from "@/lib/historico";
import BarChart from "@/components/stats/BarChart";
import StatSection from "@/components/stats/StatSection";
import TablaDetalle from "@/components/stats/TablaDetalle";

export const revalidate = 600;

const DIAS_ORDEN = [1, 2, 3, 4, 5, 6, 0]; // lunes..domingo, a partir del DOW de Postgres (0=domingo)
const DIAS_LABEL: Record<number, string> = {
  0: "Dom",
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
};

const SEVERIDAD_COLOR: Record<string, string> = {
  baja: "var(--status-good)",
  media: "var(--status-warning)",
  alta: "var(--status-serious)",
  "muy alta": "var(--status-critical)",
};

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatFechaHora(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

export default async function HistoricoPage() {
  const stats = await getEstadisticas();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:underline dark:text-slate-400"
          >
            ← Volver a las cámaras
          </Link>
          <h1 className="text-lg font-bold">Histórico M-607</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Estadísticas de incidencias registradas en el tramo Madrid – Colmenar Viejo
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pb-10 pt-4">
        {stats === null && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            El histórico todavía no está configurado (falta la base de datos).
          </div>
        )}

        {stats !== null && stats.total === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Todavía no hay incidencias registradas. Empezamos a recopilar datos
            desde ahora — vuelve más adelante para ver estadísticas.
          </div>
        )}

        {stats !== null && stats.total > 0 && (
          <>
            <StatSection
              title={`${stats.total} incidencias registradas`}
              subtitle={
                stats.desde
                  ? `Recopilando datos desde el ${formatFecha(stats.desde)}`
                  : undefined
              }
            >
              {stats.duracionMediaMinutos !== null && (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Duración media de una incidencia:{" "}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatDuracion(stats.duracionMediaMinutos)}
                  </span>
                </p>
              )}
            </StatSection>

            <StatSection
              title="Por hora del día"
              subtitle="Hora de inicio de la incidencia (hora local)"
            >
              <BarChart
                data={stats.porHora.map((h) => ({
                  label: String(h.hora),
                  value: h.total,
                  title: `${h.hora}:00`,
                }))}
                showLabelEvery={3}
              />
              <TablaDetalle
                headers={["Hora", "Incidencias"]}
                rows={stats.porHora.map((h) => [`${h.hora}:00`, h.total])}
              />
            </StatSection>

            <StatSection title="Por día de la semana">
              <BarChart
                data={DIAS_ORDEN.map((dow) => {
                  const item = stats.porDiaSemana.find((d) => d.dia === dow);
                  return {
                    label: DIAS_LABEL[dow],
                    value: item?.total ?? 0,
                  };
                })}
              />
            </StatSection>

            {stats.porCausa.length > 0 && (
              <StatSection title="Por causa">
                <BarChart
                  data={stats.porCausa.map((c) => ({
                    label: c.etiqueta.length > 8 ? c.etiqueta.slice(0, 8) + "…" : c.etiqueta,
                    value: c.total,
                    title: c.etiqueta,
                  }))}
                />
                <TablaDetalle
                  headers={["Causa", "Incidencias"]}
                  rows={stats.porCausa.map((c) => [c.etiqueta, c.total])}
                />
              </StatSection>
            )}

            {stats.porSeveridad.length > 0 && (
              <StatSection title="Por severidad">
                <div className="viz-root space-y-2">
                  {stats.porSeveridad.map((s) => (
                    <div key={s.etiqueta} className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            SEVERIDAD_COLOR[s.etiqueta] ?? "var(--series-1)",
                        }}
                      />
                      <span className="w-20 shrink-0 text-xs text-slate-600 dark:text-slate-300">
                        {s.etiqueta}
                      </span>
                      <span className="text-xs font-medium tabular-nums text-slate-900 dark:text-slate-100">
                        {s.total}
                      </span>
                    </div>
                  ))}
                </div>
              </StatSection>
            )}

            {stats.porTramo.length > 0 && (
              <StatSection
                title="Por tramo"
                subtitle="Punto kilométrico de la incidencia, agrupado cada 5 km"
              >
                <BarChart
                  data={stats.porTramo.map((t) => ({
                    label: `${t.tramo}`,
                    value: t.total,
                    title: `PK ${t.tramo}-${t.tramo + 5}`,
                  }))}
                />
              </StatSection>
            )}

            {stats.ultimasCerradas.length > 0 && (
              <StatSection title="Últimas incidencias resueltas">
                <ul className="space-y-2 text-sm">
                  {stats.ultimasCerradas.map((inc) => (
                    <li
                      key={inc.id}
                      className="border-b border-slate-100 pb-2 last:border-0 last:pb-0 dark:border-slate-800"
                    >
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {inc.causa}
                      </span>
                      {inc.municipio && <span> · {inc.municipio}</span>}
                      {inc.pk !== null && <span> · PK {inc.pk}</span>}
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        {inc.startTime ? formatFechaHora(inc.startTime) : "?"} →{" "}
                        {inc.endTime ? formatFechaHora(inc.endTime) : "?"}
                      </span>
                    </li>
                  ))}
                </ul>
              </StatSection>
            )}
          </>
        )}
      </main>

      <footer className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        Datos: Dirección General de Tráfico (DGT)
      </footer>
    </div>
  );
}
