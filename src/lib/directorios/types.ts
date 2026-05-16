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
  direccion?: string;
  contacto_whatsapp?: string;
  telefono?: string;
  instagram?: string;
  website?: string;
  featured?: boolean;
  es_premium?: boolean;
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
  { id: "barrio-chacarita", label: "Chacarita" },
  { id: "loma-san-jeronimo", label: "Loma San Jerónimo" },
  { id: "barrio-obrero", label: "Barrio Obrero" },
  { id: "loma-taruma", label: "Loma Tarumá" },
  { id: "ykua-sati", label: "Ykua Sati" },
  { id: "mariano-roque-alonso", label: "Mariano Roque Alonso" },
  { id: "recoleta", label: "Recoleta" },
  { id: "altos", label: "Altos" },
  { id: "paraguari", label: "Paraguarí" },
  { id: "ybycui", label: "Ybycuí" },
  { id: "aregua", label: "Areguá" },
  { id: "otras", label: "Otras" },
];
