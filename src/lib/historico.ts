import { getIncidenciasM607 } from "./datex";
import { ensureSchema, getSql, isDbConfigured } from "./db";

export async function collectIncidencias(): Promise<{
  nuevas: number;
  actualizadas: number;
  cerradas: number;
  activas: number;
}> {
  await ensureSchema();
  const sql = getSql();
  const { incidencias } = await getIncidenciasM607();
  const activeIds = incidencias.map((i) => i.id);

  let nuevas = 0;
  let actualizadas = 0;

  for (const inc of incidencias) {
    const startTime = inc.desde ? new Date(inc.desde) : null;
    const rows = (await sql`
      INSERT INTO incidencias_historico
        (id, causa, detalle, severidad, pk, municipio, estado, start_time, first_seen_at, last_seen_at)
      VALUES
        (${inc.id}, ${inc.causa}, ${inc.detalle || null}, ${inc.severidad}, ${inc.pk}, ${inc.municipio}, 'active', ${startTime}, now(), now())
      ON CONFLICT (id) DO UPDATE SET
        last_seen_at = now(),
        estado = 'active',
        causa = EXCLUDED.causa,
        detalle = EXCLUDED.detalle,
        severidad = EXCLUDED.severidad,
        pk = EXCLUDED.pk,
        municipio = EXCLUDED.municipio
      RETURNING (xmax = 0) AS inserted
    `) as { inserted: boolean }[];
    if (rows[0]?.inserted) nuevas++;
    else actualizadas++;
  }

  const closedRows = (
    activeIds.length > 0
      ? await sql`
          UPDATE incidencias_historico
          SET estado = 'closed', end_time = now()
          WHERE estado = 'active' AND id <> ALL(${activeIds}::text[])
          RETURNING id
        `
      : await sql`
          UPDATE incidencias_historico
          SET estado = 'closed', end_time = now()
          WHERE estado = 'active'
          RETURNING id
        `
  ) as { id: string }[];

  return {
    nuevas,
    actualizadas,
    cerradas: closedRows.length,
    activas: incidencias.length,
  };
}

export type ConteoPorHora = { hora: number; total: number };
export type ConteoPorDia = { dia: number; total: number };
export type ConteoPorEtiqueta = { etiqueta: string; total: number };
export type ConteoPorTramo = { tramo: number; total: number };
export type IncidenciaCerrada = {
  id: string;
  causa: string;
  detalle: string | null;
  pk: number | null;
  municipio: string | null;
  startTime: string | null;
  endTime: string | null;
};

export type Estadisticas = {
  total: number;
  desde: string | null;
  porHora: ConteoPorHora[];
  porDiaSemana: ConteoPorDia[];
  porCausa: ConteoPorEtiqueta[];
  porSeveridad: ConteoPorEtiqueta[];
  porTramo: ConteoPorTramo[];
  duracionMediaMinutos: number | null;
  ultimasCerradas: IncidenciaCerrada[];
};

const ZONA = "Europe/Madrid";

export async function getEstadisticas(): Promise<Estadisticas | null> {
  if (!isDbConfigured()) return null;

  await ensureSchema();
  const sql = getSql();

  const [resumen] = (await sql`
    SELECT COUNT(*)::int AS total, MIN(first_seen_at) AS desde
    FROM incidencias_historico
  `) as { total: number; desde: string | null }[];

  if (!resumen || resumen.total === 0) {
    return {
      total: 0,
      desde: null,
      porHora: horasVacias(),
      porDiaSemana: diasVacios(),
      porCausa: [],
      porSeveridad: [],
      porTramo: [],
      duracionMediaMinutos: null,
      ultimasCerradas: [],
    };
  }

  const [horasRaw, diasRaw, causaRaw, severidadRaw, tramoRaw, duracionRaw, cerradasRaw] =
    await Promise.all([
      sql`
        SELECT EXTRACT(HOUR FROM start_time AT TIME ZONE ${ZONA})::int AS hora, COUNT(*)::int AS total
        FROM incidencias_historico
        WHERE start_time IS NOT NULL
        GROUP BY hora
      `,
      sql`
        SELECT EXTRACT(DOW FROM start_time AT TIME ZONE ${ZONA})::int AS dia, COUNT(*)::int AS total
        FROM incidencias_historico
        WHERE start_time IS NOT NULL
        GROUP BY dia
      `,
      sql`
        SELECT causa AS etiqueta, COUNT(*)::int AS total
        FROM incidencias_historico
        GROUP BY causa
        ORDER BY total DESC
      `,
      sql`
        SELECT severidad AS etiqueta, COUNT(*)::int AS total
        FROM incidencias_historico
        WHERE severidad IS NOT NULL
        GROUP BY severidad
        ORDER BY total DESC
      `,
      sql`
        SELECT FLOOR(pk / 5) * 5 AS tramo, COUNT(*)::int AS total
        FROM incidencias_historico
        WHERE pk IS NOT NULL
        GROUP BY tramo
        ORDER BY tramo
      `,
      sql`
        SELECT AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 60) AS minutos
        FROM incidencias_historico
        WHERE estado = 'closed' AND start_time IS NOT NULL AND end_time IS NOT NULL
      `,
      sql`
        SELECT id, causa, detalle, pk, municipio, start_time AS "startTime", end_time AS "endTime"
        FROM incidencias_historico
        WHERE estado = 'closed'
        ORDER BY end_time DESC
        LIMIT 10
      `,
    ]);

  const porHoraMap = new Map<number, number>(
    (horasRaw as ConteoPorHora[]).map((r) => [r.hora, r.total])
  );
  const porDiaMap = new Map<number, number>(
    (diasRaw as ConteoPorDia[]).map((r) => [r.dia, r.total])
  );

  const duracionMinutos = (duracionRaw as { minutos: string | null }[])[0]?.minutos;

  return {
    total: resumen.total,
    desde: resumen.desde,
    porHora: horasVacias().map((h) => ({
      hora: h.hora,
      total: porHoraMap.get(h.hora) ?? 0,
    })),
    porDiaSemana: diasVacios().map((d) => ({
      dia: d.dia,
      total: porDiaMap.get(d.dia) ?? 0,
    })),
    porCausa: causaRaw as ConteoPorEtiqueta[],
    porSeveridad: severidadRaw as ConteoPorEtiqueta[],
    porTramo: tramoRaw as ConteoPorTramo[],
    duracionMediaMinutos: duracionMinutos ? Math.round(Number(duracionMinutos)) : null,
    ultimasCerradas: cerradasRaw as IncidenciaCerrada[],
  };
}

function horasVacias(): ConteoPorHora[] {
  return Array.from({ length: 24 }, (_, hora) => ({ hora, total: 0 }));
}

function diasVacios(): ConteoPorDia[] {
  return Array.from({ length: 7 }, (_, dia) => ({ dia, total: 0 }));
}
