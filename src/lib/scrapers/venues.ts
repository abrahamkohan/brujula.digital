// ============================================================
// Radar de Eventos Paraguay — Mapa de venues conocidos
// ============================================================
// Cuando un scraper encuentra un venue conocido, llenamos
// automáticamente dirección y coordenadas desde acá.
// ============================================================

import type { VenueInfo } from "./types";

const venues: Record<string, VenueInfo> = {
  "defensores del chaco": {
    name: "Estadio Defensores del Chaco",
    address: "Av. Sudamericana, Asunción",
    lat: -25.2889,
    lng: -57.6255,
    city: "Asunción",
  },
  "jockey club": {
    name: "Jockey Club del Paraguay",
    address: "Av. Aviadores del Chaco, Asunción",
    lat: -25.2785,
    lng: -57.5831,
    city: "Asunción",
  },
  "mariano roque alonso": {
    name: "Centro de Convenciones Mariano Roque Alonso",
    address: "Ruta Transchaco, Mariano Roque Alonso",
    lat: -25.2102,
    lng: -57.5649,
    city: "Mariano Roque Alonso",
  },
  "san bernardino": {
    name: "San Bernardino",
    address: "San Bernardino, Cordillera",
    lat: -25.3107,
    lng: -57.2962,
    city: "San Bernardino",
  },
  "snd arena": {
    name: "SND Arena",
    address: "Av. Eusebio Ayala, Asunción",
    lat: -25.3017,
    lng: -57.6004,
    city: "Asunción",
  },
  "estadio general pablo rojas": {
    name: "Estadio General Pablo Rojas (Cerro Porteño)",
    address: "Av. Venezuela, Barrio Obrero, Asunción",
    lat: -25.2910,
    lng: -57.6407,
    city: "Asunción",
  },
  "estadio Manuel Ferreira": {
    name: "Estadio Manuel Ferreira (Olimpia)",
    address: "Av. Mariscal López, Asunción",
    lat: -25.2959,
    lng: -57.6118,
    city: "Asunción",
  },
  "estadio antonio aranda": {
    name: "Estadio Antonio Aranda (Ciudad del Este)",
    address: "Av. Bernardino Caballero, Ciudad del Este",
    lat: -25.5084,
    lng: -54.6154,
    city: "Ciudad del Este",
  },
  "centro de convenciones del sur": {
    name: "Centro de Convenciones del Sur",
    address: "Encarnación",
    lat: -27.3372,
    lng: -55.8863,
    city: "Encarnación",
  },
  "paseo la galería": {
    name: "Paseo La Galería",
    address: "Av. Santa Teresa, Asunción",
    lat: -25.2863,
    lng: -57.5845,
    city: "Asunción",
  },
  "shopping del sol": {
    name: "Shopping del Sol",
    address: "Av. Aviadores del Chaco, Asunción",
    lat: -25.2766,
    lng: -57.5802,
    city: "Asunción",
  },
  "mcal lópez shopping": {
    name: "Mcal. López Shopping",
    address: "Av. Mariscal López, Asunción",
    lat: -25.3001,
    lng: -57.6092,
    city: "Asunción",
  },
  "hotel sheraton asunción": {
    name: "Hotel Sheraton Asunción",
    address: "Av. Aviadores del Chaco, Asunción",
    lat: -25.2784,
    lng: -57.5788,
    city: "Asunción",
  },
  "centro de eventos del parque": {
    name: "Centro de Eventos del Parque",
    address: "Parque Ñu Guasu, Luque",
    lat: -25.2522,
    lng: -57.5422,
    city: "Luque",
  },
};

/**
 * Busca un venue conocido por nombre (case-insensitive, parcial).
 * Ej: "Defensores del Chaco, Asunción" → match con "defensores del chaco"
 */
export function findVenue(name: string): VenueInfo | undefined {
  const key = name.toLowerCase().trim();
  // Intenta match exacto primero
  if (venues[key]) return venues[key];

  // Match parcial: busca si alguna key está contenida en el nombre
  for (const [venueKey, info] of Object.entries(venues)) {
    if (key.includes(venueKey) || venueKey.includes(key)) {
      return info;
    }
  }

  return undefined;
}
