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

## Histórico de incidencias (`/historico`)

La DGT solo expone el estado *actual* del tráfico, no un archivo histórico.
Por eso la app va guardando en una base de datos cada incidencia que ve en el
feed, para poder calcular estadísticas (horarios con más incidencias, día de
la semana, causa, severidad, tramo, duración media...). Los datos solo
existen desde que esto se pone en marcha — no hay forma de rellenar el
pasado.

Piezas involucradas:

- `src/lib/db.ts` — cliente de [Neon](https://neon.tech) (Postgres serverless)
  y creación del esquema (`incidencias_historico`) si no existe.
- `src/lib/historico.ts` — `collectIncidencias()` compara el feed activo con
  lo guardado (da de alta lo nuevo, actualiza lo que sigue activo, cierra lo
  que desaparece) y `getEstadisticas()` calcula las agregaciones para
  `/historico`.
- `src/app/api/cron/collect/route.ts` — endpoint protegido por `CRON_SECRET`
  que ejecuta la recolección. Se llama desde fuera de Vercel porque el cron
  nativo del plan Hobby solo permite 1 ejecución/día, insuficiente para no
  perder incidencias cortas.
- `.github/workflows/collect-trafico.yml` — GitHub Actions llama a ese
  endpoint cada 15 minutos.

### Configurarlo

1. **Base de datos**: en el dashboard de Vercel del proyecto → *Storage* →
   *Marketplace Database Providers* → añade **Neon** (plan gratuito). Esto
   crea la base de datos y añade la variable de entorno `DATABASE_URL`
   automáticamente al proyecto.
2. **Secreto del cron**: genera uno con `openssl rand -hex 32` y añádelo:
   - En Vercel → *Settings* → *Environment Variables* → `CRON_SECRET`.
   - En GitHub → *Settings* → *Secrets and variables* → *Actions* →
     `CRON_SECRET` (mismo valor) y `APP_URL` (la URL del despliegue, sin
     barra final, ej. `https://live-m607.vercel.app`).
3. Vuelve a desplegar en Vercel para que recoja `DATABASE_URL`. El workflow
   de GitHub Actions ya se dispara solo cada 15 minutos; también puedes
   lanzarlo a mano desde la pestaña *Actions* → *Run workflow* para probarlo.

Sin estas variables, `/historico` sigue funcionando y muestra un aviso de
"no configurado" en vez de romperse.

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Para probar el
histórico en local, copia tu `DATABASE_URL` de Neon a un `.env.local`.

## Despliegue

Pensado para desplegarse en [Vercel](https://vercel.com) importando este
repositorio. El listado de cámaras y las incidencias en vivo no requieren
variables de entorno; el histórico sí (ver arriba).
