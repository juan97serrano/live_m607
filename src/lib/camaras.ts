export type Camara = {
  id: number;
  pk: number;
  nombre: string;
};

// Cámaras oficiales DGT en la M-607, tramo Madrid (M-40) - Colmenar Viejo,
// ordenadas de sur (Madrid) a norte (Colmenar Viejo).
export const CAMARAS: Camara[] = [
  { id: 999, pk: 10.9, nombre: "Mirasierra" },
  { id: 1005, pk: 13.1, nombre: "Montecarmelo / Enlace M-40" },
  { id: 1019, pk: 14.2, nombre: "Valdelatas" },
  { id: 1002, pk: 14.4, nombre: "Polígono Alcobendas" },
  { id: 1026, pk: 16.0, nombre: "Enlace M-40" },
  { id: 1020, pk: 18.3, nombre: "Carretera Alcobendas" },
  { id: 1023, pk: 20.7, nombre: "Tres Cantos" },
  { id: 1018, pk: 24.3, nombre: "Tres Cantos Norte" },
  { id: 1024, pk: 30.8, nombre: "Colmenar Viejo Oeste" },
  { id: 1025, pk: 31.9, nombre: "Colmenar Viejo" },
  { id: 1017, pk: 34.0, nombre: "Colmenar Viejo Norte" },
  { id: 1022, pk: 35.6, nombre: "Colmenar Viejo (Museo Farmacia)" },
  { id: 1015, pk: 38.3, nombre: "Colmenar Viejo" },
];
