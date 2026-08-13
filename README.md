# M-607 en directo

App web mobile-first con el estado en tiempo real de la M-607 en el tramo
Madrid – Colmenar Viejo: cámaras oficiales de la DGT y avisos de incidencias
activas (obras, accidentes, cortes, retenciones).

## Fuentes de datos

Todo se obtiene de fuentes públicas y gratuitas de la Dirección General de
Tráfico, sin API keys:

- **Cámaras**: imágenes JPG servidas por `etraffic.dgt.es`, proxied desde
  `/api/camara/[id]` (ver `src/lib/camaras.ts` para la lista de cámaras).
- **Incidencias**: feed DATEX II v3.7 público de
  [nap.dgt.es](https://nap.dgt.es/dataset/incidencias-dgt-datex2-v3-7),
  filtrado por `roadName === "M-607"` en `/api/incidencias`
  (ver `src/lib/datex.ts`).

Ambas rutas cachean la respuesta ~90s (`export const revalidate = 90`) para
no saturar los servidores de la DGT; el cliente refresca cada 90s y pausa el
polling cuando la pestaña no está visible.

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Despliegue

Pensado para desplegarse en [Vercel](https://vercel.com) importando este
repositorio; no requiere variables de entorno.
