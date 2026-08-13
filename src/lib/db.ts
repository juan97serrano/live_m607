import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sqlClient: NeonQueryFunction<false, false> | null = null;

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql(): NeonQueryFunction<false, false> {
  if (sqlClient) return sqlClient;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL no configurada");
  }
  sqlClient = neon(url);
  return sqlClient;
}

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS incidencias_historico (
          id TEXT PRIMARY KEY,
          causa TEXT NOT NULL,
          detalle TEXT,
          severidad TEXT,
          pk NUMERIC,
          municipio TEXT,
          estado TEXT NOT NULL DEFAULT 'active',
          start_time TIMESTAMPTZ,
          end_time TIMESTAMPTZ,
          first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_incidencias_start_time ON incidencias_historico (start_time)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_incidencias_estado ON incidencias_historico (estado)`;
    })();
  }
  return schemaReady;
}
