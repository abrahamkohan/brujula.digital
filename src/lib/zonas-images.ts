// ─── Imágenes hero para cada zona ─────────────────────────────
// Cada zona tiene una imagen representativa. Si no hay imagen
// disponible, se usa el gradiente de fallback.

export const ZONA_HERO: Record<string, string> = {
  "villa-morra": "https://images.unsplash.com/photo-1604323252129-f8c78f18218e?w=800&h=600&fit=crop",
  "carmelitas": "https://images.unsplash.com/photo-1529504426707-d1d7a0dc458a?w=800&h=600&fit=crop",
  "centro": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Palacio_de_L%C3%B3pez_Asunci%C3%B3n.jpg/800px-Palacio_de_L%C3%B3pez_Asunci%C3%B3n.jpg",
  "las-mercedes": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
  "luque": "https://upload.wikimedia.org/wikipedia/commons/9/93/Estadio_Defensores_del_Chaco_en_2019.jpg",
  "san-bernardino": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
  "san-lorenzo": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop",
  "barrio-chacarita": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
  "loma-san-jeronimo": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
  "barrio-obrero": "https://images.unsplash.com/photo-1574629810360-3efdf87b6951?w=800&h=600&fit=crop",
  "loma-taruma": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
  "ykua-sati": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
  "mariano-roque-alonso": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop",
  "aregua": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
  "recoleta": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
};

// Descripciones cortas por zona (para la card en landing)
export const ZONA_DESCS: Record<string, string> = {
  "villa-morra": "Shoppings, restaurantes y vida corporativa",
  "carmelitas": "Bares, música y vida nocturna",
  "centro": "Historia, museos y edificios emblemáticos",
  "las-mercedes": "Zona residencial tranquila y elegante",
  "luque": "Aeropuerto, estadios y el Jockey Club",
  "san-bernardino": "Escapada de fin de semana al lago",
  "san-lorenzo": "Ciudad universitaria",
  "barrio-chacarita": "Barrio histórico junto a la Costanera",
  "loma-san-jeronimo": "Calles coloridas y mirador",
  "barrio-obrero": "Estadio Cerro Porteño",
  "loma-taruma": "Entretenimiento y cultura",
  "ykua-sati": "Museo del Barro",
  "mariano-roque-alonso": "Centro de Convenciones",
  "aregua": "Artesanía en cerámica",
  "recoleta": "Zona residencial",
};

export function getZonaHero(zonaId: string): string | undefined {
  return ZONA_HERO[zonaId];
}

export function getZonaDesc(zonaId: string): string | undefined {
  return ZONA_DESCS[zonaId];
}
