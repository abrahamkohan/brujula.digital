/**
 * Mapeo de venues conocidos → zona.
 * Para eventos scrapeados que no tienen zona, buscamos el venue acá.
 */
const VENUE_ZONAS: Record<string, string> = {
  // Centro
  "teatro municipal": "centro",
  "teatro municipal de asunción": "centro",
  "puerto de asunción": "centro",
  "puerto asunción": "centro",
  "hotel sheraton asunción": "carmelitas",
  "sheraton asunción": "carmelitas",
  "teatro guarani": "centro",
  "teatro guaraní": "centro",
  "arlequin teatro": "centro",
  "teatro latino": "centro",

  // Villa Morra
  "jockey club": "villa-morra",
  "jockey club del paraguay": "villa-morra",
  "paseo la galería": "villa-morra",
  "paseo la galeria": "villa-morra",
  "shopping del sol": "villa-morra",
  "casa mayor galeria de arte": "villa-morra",

  // Carmelitas
  "mcal lópez shopping": "carmelitas",
  "mcal. lópez shopping": "carmelitas",
  "mariscal lópez shopping": "carmelitas",
  "la otra bar": "carmelitas",
  "voudevil venue": "carmelitas",

  // Luque
  "snd arena": "luque",
  "snd ueno arena": "luque",
  "ueno snd arena": "luque",
  "parque Ñu guasu": "luque",

  // San Bernardino
  "san bernardino": "san-bernardino",

  // Ciudad del Este
  "estadio antonio aranda": "ciudad-del-este",

  // Encarnación
  "encarnación": "encarnacion",
  "estadio villa alegre": "encarnacion",
  "centro de convenciones del sur": "encarnacion",

  // Mariano Roque Alonso
  "centro de convenciones mariano roque alonso": "otras",
  "mariano roque alonso": "otras",

  // San Lorenzo
  "estadio luis alfonso giagni": "san-lorenzo",
  "la arboleda": "san-lorenzo",
  "estadio la arboleda": "san-lorenzo",
};

export function getZonaFromVenue(venue: string): string | undefined {
  if (!venue) return undefined;
  const key = venue.toLowerCase().trim();
  for (const [venueKey, zona] of Object.entries(VENUE_ZONAS)) {
    if (key.includes(venueKey)) return zona;
  }
  return undefined;
}
