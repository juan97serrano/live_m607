import { NextRequest, NextResponse } from "next/server";
import { collectIncidencias } from "@/lib/historico";
import { isDbConfigured } from "@/lib/db";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET no configurado en el servidor" },
      { status: 500 }
    );
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_URL no configurada" },
      { status: 500 }
    );
  }

  try {
    const resultado = await collectIncidencias();
    return NextResponse.json({ ok: true, ...resultado });
  } catch (err) {
    console.error("Error recolectando incidencias:", err);
    return NextResponse.json(
      { error: "Fallo al recolectar incidencias" },
      { status: 502 }
    );
  }
}
