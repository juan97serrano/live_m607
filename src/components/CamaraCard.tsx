"use client";

import { useState } from "react";
import type { Camara } from "@/lib/camaras";

function CamaraImage({ src, alt }: { src: string; alt: string }) {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  if (status === "error") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500">
        <span className="text-2xl">📷</span>
        <span className="text-xs">Cámara no disponible</span>
      </div>
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
        onLoad={() => setStatus("ok")}
        onError={() => setStatus("error")}
      />
      {status === "loading" && (
        <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-800" />
      )}
    </>
  );
}

export default function CamaraCard({
  camara,
  tick,
}: {
  camara: Camara;
  tick: number;
}) {
  const src = `/api/camara/${camara.id}?b=${tick}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-baseline justify-between px-4 pt-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {camara.nombre}
        </h2>
        <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
          PK {camara.pk.toFixed(1)}
        </span>
      </div>

      <div className="relative mt-2 aspect-video w-full bg-slate-100 dark:bg-slate-800">
        <CamaraImage
          key={src}
          src={src}
          alt={`Cámara DGT M-607 en ${camara.nombre}, PK ${camara.pk}`}
        />
      </div>
    </div>
  );
}
