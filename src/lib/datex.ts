import { XMLParser } from "fast-xml-parser";

const DATEX_URL =
  "https://nap.dgt.es/datex2/v3/dgt/SituationPublication/datex2_v37.xml";

// Tramo Madrid - Colmenar Viejo de la M-607 va aprox. del PK 10.9 al 38.3.
// Se amplía un poco el margen superior para no perder incidencias justo
// en el límite del tramo.
const PK_LIMITE_SUPERIOR = 42;

const CAUSA_ES: Record<string, string> = {
  abnormalTraffic: "Tráfico anómalo",
  accident: "Accidente",
  environmentalObstruction: "Obstrucción ambiental",
  infrastructureDamageObstruction: "Daño en infraestructura",
  obstruction: "Obstrucción en la vía",
  poorEnvironment: "Condiciones ambientales adversas",
  publicEvent: "Evento público",
  roadMaintenance: "Obras / mantenimiento",
  roadOrCarriagewayOrLaneManagement: "Gestión de carriles",
  vehicleObstruction: "Vehículo obstruyendo la vía",
};

const SEVERIDAD_ES: Record<string, string> = {
  highest: "muy alta",
  high: "alta",
  medium: "media",
  low: "baja",
};

function humanize(code: string): string {
  return code
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}

export type Incidencia = {
  id: string;
  causa: string;
  detalle: string;
  severidad: string | null;
  pk: number | null;
  municipio: string | null;
  desde: string | null;
  estado: string | null;
};

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export async function getIncidenciasM607(): Promise<{
  updatedAt: string;
  incidencias: Incidencia[];
}> {
  // El XML supera los 2MB, así que no es apto para la Next Data Cache por
  // fetch; el cacheo real lo da `export const revalidate` de la ruta.
  const res = await fetch(DATEX_URL);
  if (!res.ok) {
    throw new Error(`DATEX2 upstream respondió ${res.status}`);
  }
  const xml = await res.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    removeNSPrefix: true,
  });
  const doc = parser.parse(xml);

  const payload = doc?.payload;
  const publicationTime: string | undefined = payload?.publicationTime;
  const situations = asArray(payload?.situation);

  const incidencias: Incidencia[] = [];

  for (const situation of situations) {
    const records = asArray(situation?.situationRecord);
    for (const record of records) {
      const locRef = record?.locationReference;
      const roadName: string | undefined =
        locRef?.supplementaryPositionalDescription?.roadInformation?.roadName;

      if (!roadName || roadName.trim().toUpperCase() !== "M-607") continue;

      const tpeg = locRef?.tpegLinearLocation;
      const fromPk = Number(
        tpeg?.from?._tpegNonJunctionPointExtension?.extendedTpegNonJunctionPoint
          ?.kilometerPoint
      );
      const toPk = Number(
        tpeg?.to?._tpegNonJunctionPointExtension?.extendedTpegNonJunctionPoint
          ?.kilometerPoint
      );
      const pkCandidates = [fromPk, toPk].filter((v) => !Number.isNaN(v));
      const pk = pkCandidates.length ? Math.min(...pkCandidates) : null;

      if (pk !== null && pk > PK_LIMITE_SUPERIOR) continue;

      const municipio: string | null =
        tpeg?.from?._tpegNonJunctionPointExtension?.extendedTpegNonJunctionPoint
          ?.municipality ??
        tpeg?.to?._tpegNonJunctionPointExtension?.extendedTpegNonJunctionPoint
          ?.municipality ??
        null;

      const causeType: string | undefined = record?.cause?.causeType;
      const detailedCauseObj = record?.cause?.detailedCauseType;
      let detalle = "";
      if (detailedCauseObj && typeof detailedCauseObj === "object") {
        const key = Object.keys(detailedCauseObj)[0];
        if (key) detalle = humanize(String(detailedCauseObj[key]));
      }

      incidencias.push({
        id: String(record?.["@_id"] ?? situation?.["@_id"] ?? crypto.randomUUID()),
        causa: causeType ? CAUSA_ES[causeType] ?? humanize(causeType) : "Incidencia",
        detalle,
        severidad: record?.severity
          ? SEVERIDAD_ES[record.severity] ?? record.severity
          : null,
        pk,
        municipio,
        desde: record?.validity?.validityTimeSpecification?.overallStartTime ?? null,
        estado: record?.validity?.validityStatus ?? null,
      });
    }
  }

  incidencias.sort((a, b) => (a.pk ?? 0) - (b.pk ?? 0));

  return {
    updatedAt: publicationTime ?? new Date().toISOString(),
    incidencias,
  };
}
