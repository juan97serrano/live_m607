export type Zona = "Colmenar Viejo" | "Tres Cantos → Madrid";

export type Camara = {
  id: number;
  pk: number;
  nombre: string;
  zona: Zona;
  /** Detalle opcional (p. ej. si la cámara enfoca un enlace/rotonda). */
  nota?: string;
};

// Cámaras oficiales DGT en la M-607, tramo Colmenar Viejo - Madrid (M-40),
// ordenadas en el sentido del trayecto Colmenar → Madrid (PK descendente).
// Fuente: inventario DATEX II de la DGT
// (nap.dgt.es/datex2/v3/dgt/DevicePublication/camaras_datex2_v36.xml).
// En Colmenar no hay cámaras públicas municipales ni de la Comunidad de
// Madrid; las únicas con imagen abierta son estas de la DGT.
export const CAMARAS: Camara[] = [
  {
    id: 1015,
    pk: 38.3,
    nombre: "Colmenar Viejo · salida norte",
    zona: "Colmenar Viejo",
    nota: "Sentido Madrid, antes de entrar en Colmenar",
  },
  {
    id: 1022,
    pk: 35.6,
    nombre: "Enlace M-609 · glorieta Colmenar Norte",
    zona: "Colmenar Viejo",
    nota: "Rotonda de salida/entrada a la M-607",
  },
  {
    id: 1017,
    pk: 34.0,
    nombre: "Colmenar Viejo Norte",
    zona: "Colmenar Viejo",
  },
  {
    id: 1025,
    pk: 31.9,
    nombre: "Colmenar Viejo Centro",
    zona: "Colmenar Viejo",
    nota: "Junto al enlace de Prado Bastero (salida desde la rotonda de los toros / Lidl)",
  },
  {
    id: 1024,
    pk: 30.8,
    nombre: "Colmenar Viejo Sur",
    zona: "Colmenar Viejo",
    nota: "Sentido Madrid",
  },
  { id: 1018, pk: 24.6, nombre: "Tres Cantos Norte", zona: "Tres Cantos → Madrid" },
  { id: 1023, pk: 20.7, nombre: "Tres Cantos", zona: "Tres Cantos → Madrid" },
  { id: 1020, pk: 18.3, nombre: "Carretera Alcobendas", zona: "Tres Cantos → Madrid" },
  { id: 1026, pk: 16.0, nombre: "Enlace M-40", zona: "Tres Cantos → Madrid" },
  { id: 1019, pk: 14.2, nombre: "Valdelatas", zona: "Tres Cantos → Madrid" },
  { id: 1005, pk: 13.1, nombre: "Montecarmelo / Enlace M-40", zona: "Tres Cantos → Madrid" },
  { id: 1002, pk: 12.4, nombre: "Polígono Alcobendas", zona: "Tres Cantos → Madrid" },
  { id: 999, pk: 10.9, nombre: "Mirasierra", zona: "Tres Cantos → Madrid" },
];

export const ZONAS: Zona[] = ["Colmenar Viejo", "Tres Cantos → Madrid"];
