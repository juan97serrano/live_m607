import { NextResponse } from "next/server";
import { getIncidenciasM607 } from "@/lib/datex";

export const revalidate = 90;

export async function GET() {
  try {
    const data = await getIncidenciasM607();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=90, stale-while-revalidate=180",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo obtener el estado del tráfico" },
      { status: 502 }
    );
  }
}
