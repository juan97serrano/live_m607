import { NextRequest, NextResponse } from "next/server";
import { CAMARAS } from "@/lib/camaras";

export const revalidate = 90;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const camaraId = Number(id);

  if (!CAMARAS.some((c) => c.id === camaraId)) {
    return NextResponse.json({ error: "Cámara desconocida" }, { status: 404 });
  }

  try {
    const upstream = await fetch(
      `https://etraffic.dgt.es/camarasEtraffic/${camaraId}.jpg`,
      { next: { revalidate: 90 } }
    );

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: "Cámara no disponible" },
        { status: 502 }
      );
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=60, s-maxage=90, stale-while-revalidate=120",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Cámara no disponible" },
      { status: 502 }
    );
  }
}
