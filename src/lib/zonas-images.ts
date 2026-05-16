// ─── Imágenes hero para cada zona ─────────────────────────────
// Cada zona tiene una imagen representativa. Si no hay imagen
// disponible, se usa el gradiente de fallback.

export const ZONA_HERO: Record<string, string> = {
  "villa-morra": "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.lanacion.com.py%2Fresizer%2FAH5roeXgWhkQtdk6QU2LNhyxDsw%3D%2F1360x906%2Fsmart%2Ffilters%3Aformat(jpg)%3Aquality(99)%2Fcloudfront-us-east-1.images.arcpublishing.com%2Flanacionpy%2FFGUBWTLNBFD2DD3W2BRK7HHLME.jpg&f=1&nofb=1&ipt=ff1328e8c7e640098d6010c9d733333e6ea1703be455098b1eb2daa40238db1e",
  "carmelitas": "https://images.unsplash.com/photo-1529504426707-d1d7a0dc458a?w=800&h=600&fit=crop",
  "centro": "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.squarespace-cdn.com%2Fcontent%2Fv1%2F5a87961cbe42d637c54cab93%2F1566829236148-JJ0J4L0ZJXXFPXC3G6BU%2Fke17ZwdGBToddI8pDm48kHJjM-Evnp5g-1kf5Yv15cUUqsxRUqqbr1mOJYKfIPR7LoDQ9mXPOjoJoqy81S2I8N_N4V1vUb5AoIIIbLZhVYxCRW4BPu10St3TBAUQYVKcpWKe3KzaCrFDKPR1a1Ob8xobjReaxMuaKtrvUDoDmPO9EsdBHei1w8jR6w0UZiby%2Fasuncion-things-to-do.jpg&f=1&nofb=1&ipt=052a77ceb7f5ba96f93e3fd27115f60be17e55546ca6538909dbbee78236ffed",
  "las-mercedes": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
  "luque": "https://upload.wikimedia.org/wikipedia/commons/9/93/Estadio_Defensores_del_Chaco_en_2019.jpg",
  "san-bernardino": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
  "san-lorenzo": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop",
  "barrio-chacarita": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
  "loma-san-jeronimo": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
  "barrio-obrero": "https://images.unsplash.com/photo-1574629810360-3efdf87b6951?w=800&h=600&fit=crop",
  "loma-taruma": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
  "ykua-sati": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
  "mariano-roque-alonso": "https://upload.wikimedia.org/wikipedia/commons/d/d5/Municipalidad_en_MRA1.jpg",
  "aregua": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
  "altos": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
  "paraguari": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop",
  "ybycui": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
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
  "altos": "Complejos recreativos y naturaleza a 45 minutos",
  "paraguari": "Eco-aventura en la serranía paraguaya",
  "ybycui": "Parque nacional con saltos de agua y ruinas históricas",
  "recoleta": "Zona residencial",
};

export function getZonaHero(zonaId: string): string | undefined {
  return ZONA_HERO[zonaId];
}

export function getZonaDesc(zonaId: string): string | undefined {
  return ZONA_DESCS[zonaId];
}
