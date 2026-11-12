"use client";

// Salida desde la glorieta Manuel Revelles (la "rotonda de los toros", con la
// escultura "El encierro", junto al Lidl) por la Av. del Prado Bastero (M-618)
// hasta la glorieta de Prado Bastero y la incorporación a la M-607.
// No hay cámaras públicas en ese tramo, así que se muestra el mapa de tráfico
// en vivo de Waze (embebible sin API key) centrado entre ambas glorietas.
const CENTRO = { lat: 40.6632, lon: -3.7558 };
const ZOOM = 16;

const WAZE_EMBED = `https://embed.waze.com/iframe?zoom=${ZOOM}&lat=${CENTRO.lat}&lon=${CENTRO.lon}`;
const GOOGLE_MAPS_TRAFICO = `https://www.google.com/maps/@${CENTRO.lat},${CENTRO.lon},${ZOOM}z/data=!5m1!1e1`;

export default function SalidaColmenar() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="px-4 pt-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Salida rotonda de los toros → M-607
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Glorieta &ldquo;El encierro&rdquo; (Lidl) · Av. Prado Bastero ·
          glorieta de Prado Bastero. Tráfico en vivo de Waze: en rojo o
          naranja, hay retención.
        </p>
      </div>

      <div className="relative mt-2 aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800">
        {/* No se recarga con el refresco de la página: el mapa de Waze ya se
            actualiza solo, y recargarlo volvería a mostrar su aviso de cookies
            en navegadores que bloquean cookies de terceros (Safari iOS). */}
        <iframe
          src={WAZE_EMBED}
          title="Mapa de tráfico en vivo de la salida de Colmenar Viejo por la Av. Prado Bastero"
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          allowFullScreen
        />
      </div>

      <div className="flex justify-end px-4 py-2">
        <a
          href={GOOGLE_MAPS_TRAFICO}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
        >
          Ver en Google Maps (capa de tráfico) ↗
        </a>
      </div>
    </div>
  );
}
