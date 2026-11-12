"use client";

import { useCallback, useEffect, useState } from "react";
import { CAMARAS, ZONAS } from "@/lib/camaras";
import type { Incidencia } from "@/lib/datex";
import CamaraCard from "./CamaraCard";
import IncidentBanner from "./IncidentBanner";
import SalidaColmenar from "./SalidaColmenar";

const REFRESH_MS = 90_000;

export default function Dashboard() {
  const [tick, setTick] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [incidencias, setIncidencias] = useState<Incidencia[] | null>(null);
  const [incidenciasLoading, setIncidenciasLoading] = useState(true);
  const [incidenciasError, setIncidenciasError] = useState(false);

  const cargarIncidencias = useCallback(async () => {
    try {
      const res = await fetch("/api/incidencias", { cache: "no-store" });
      if (!res.ok) throw new Error("upstream error");
      const data = await res.json();
      setIncidencias(data.incidencias);
      setIncidenciasError(false);
    } catch {
      setIncidenciasError(true);
    } finally {
      setIncidenciasLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    // Fetch inicial al montar; el estado se actualiza de forma asíncrona
    // tras el await interno, no de forma síncrona en el cuerpo del efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarIncidencias();

    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setTick((t) => t + 1);
      cargarIncidencias();
    }, REFRESH_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        setTick((t) => t + 1);
        cargarIncidencias();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [cargarIncidencias]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pb-10 pt-4">
      <IncidentBanner
        incidencias={incidencias}
        loading={incidenciasLoading}
        errored={incidenciasError}
      />

      {lastUpdated && (
        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          Actualizado {lastUpdated.toLocaleTimeString("es-ES")} · se refresca
          solo cada 90s
        </p>
      )}

      <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
        Cámaras en orden del trayecto Colmenar Viejo → Madrid
      </p>

      {ZONAS.map((zona) => (
        <section key={zona} className="flex flex-col gap-3">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {zona}
          </h2>
          {zona === "Colmenar Viejo" && <SalidaColmenar />}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {CAMARAS.filter((c) => c.zona === zona).map((camara) => (
              <CamaraCard key={camara.id} camara={camara} tick={tick} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
