export interface DirectorioItem {
  id: string;
  name: string;
  zone: string;
  desc: string;
  image: string;
  url: string;
  tipo?: string;
  stars?: number;
  badge?: string;
  horario?: string;
}

export interface ZonaInfo {
  id: string;
  label: string;
}

export const ZONAS: ZonaInfo[] = [
  { id: "centro", label: "Centro" },
  { id: "villa-morra", label: "Villa Morra" },
  { id: "carmelitas", label: "Carmelitas" },
  { id: "las-mercedes", label: "Las Mercedes" },
  { id: "luque", label: "Luque" },
  { id: "san-bernardino", label: "San Bernardino" },
  { id: "san-lorenzo", label: "San Lorenzo" },
  { id: "ciudad-del-este", label: "Ciudad del Este" },
  { id: "encarnacion", label: "Encarnación" },
  { id: "otras", label: "Otras" },
];
