import type { DirectorioItem } from "./types";

export const GASTRONOMIA: DirectorioItem[] = [
  // ── Clásicos ──
  { id: "bolsi", name: "Bolsi", zone: "centro", desc: "Clásico histórico desde 1942. Empanadas, lomitos y más.", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Bolsi+Asuncion", tipo: "Clásico" },
  { id: "lido", name: "Lido Bar", zone: "centro", desc: "Tradicional, parrilla al paso, emblema de Asunción.", image: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Lido+Bar+Asuncion", tipo: "Clásico" },
  { id: "bar-san-miguel", name: "Bar San Miguel", zone: "villa-morra", desc: "Clásico de Villa Morra, buena onda y buenos precios.", image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Bar+San+Miguel+Asuncion", tipo: "Clásico" },

  // ── Cocina Paraguaya ──
  { id: "laparaguayita", name: "La Paraguayita", zone: "villa-morra", desc: "Cocina tradicional paraguaya con identidad.", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=La+Paraguayita+Asuncion", tipo: "Cocina PY" },
  { id: "tierracolorada", name: "Tierra Colorada Café", zone: "carmelitas", desc: "Cocina de autor con identidad local.", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Tierra+Colorada+Asuncion", tipo: "Cocina PY" },
  { id: "mbopi", name: "Mbopi", zone: "villa-morra", desc: "Cocina paraguaya contemporánea.", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Mbopi+Asuncion", tipo: "Cocina PY" },

  // ── Parrilla / Asado ──
  { id: "lacabrera", name: "La Cabrera", zone: "villa-morra", desc: "Parrilla argentina de primer nivel.", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=La+Cabrera+Asuncion", tipo: "Parrilla" },
  { id: "donvito", name: "Don Vito", zone: "centro", desc: "Parrilla tradicional en el centro.", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Don+Vito+Asuncion", tipo: "Parrilla" },
  { id: "lo-de-osvaldo", name: "Lo de Osvaldo", zone: "centro", desc: "Parrilla de barrio, calidad y precio justo.", image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Lo+de+Osvaldo+Asuncion", tipo: "Parrilla" },

  // ── Sushi ──
  { id: "osaka", name: "Osaka", zone: "villa-morra", desc: "Sushi y cocina asiática de primera.", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Osaka+Asuncion", tipo: "Sushi" },
  { id: "furusato", name: "Furusato", zone: "villa-morra", desc: "Auténtica cocina japonesa.", image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Furusato+Asuncion", tipo: "Sushi" },
  { id: "sushishow", name: "Sushi Show", zone: "carmelitas", desc: "Sushi Fusión, delivery y salón.", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Sushi+Show+Asuncion", tipo: "Sushi" },

  // ── Café / Brunch ──
  { id: "nuevamente", name: "Nuevamente Café", zone: "las-mercedes", desc: "Café de especialidad y brunch.", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Nuevamente+Cafe+Asuncion", tipo: "Café" },
  { id: "cafe-migas", name: "Café Migas", zone: "villa-morra", desc: "Café, brunch y tapas.", image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Cafe+Migas+Asuncion", tipo: "Café" },
  { id: "almacito", name: "Almacito Café", zone: "villa-morra", desc: "Café de especialidad en Villa Morra.", image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Almacito+Cafe+Asuncion", tipo: "Café" },

  // ── Cocina de Autor ──
  { id: "casabrizuela", name: "Casa Brizuela", zone: "villa-morra", desc: "Gastronomía de autor en mansión histórica.", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Casa+Brizuela+Asuncion", tipo: "Autor" },
  { id: "tierraoscura", name: "Tierra Oscura", zone: "villa-morra", desc: "Cocina de autor, menú degustación.", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Tierra+Oscura+Asuncion", tipo: "Autor" },
  { id: "mesa9", name: "Mesa 9", zone: "carmelitas", desc: "Cocina de autor en Carmelitas.", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Mesa+9+Asuncion", tipo: "Autor" },

  // ── Italiana ──
  { id: "duemorsi", name: "Due Morsi", zone: "villa-morra", desc: "Cocina italiana contemporánea.", image: "https://images.unsplash.com/photo-1579684947550-2e0e6b7a7b7b?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Due+Morsi+Asuncion", tipo: "Italiana" },
  { id: "laprevia", name: "La Previa", zone: "villa-morra", desc: "Italiano casual, buenas pastas.", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=La+Previa+Asuncion", tipo: "Italiana" },
  { id: "spaghetteria", name: "Spaghetteria", zone: "centro", desc: "Pastas artesanales en el centro.", image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Spaghetteria+Asuncion", tipo: "Italiana" },

  // ── Fusión / Otros ──
  { id: "ultravioleta", name: "Ultravioleta", zone: "villa-morra", desc: "Cocina fusión mexicana contemporánea.", image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Ultravioleta+Asuncion", tipo: "Fusión" },
  { id: "agave", name: "Agave", zone: "carmelitas", desc: "Mexican food de calidad.", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=533&fit=crop", url: "https://maps.google.com/?q=Agave+Asuncion", tipo: "Fusión" },
];

export const TIPOS_GASTRONOMIA = [
  "Clásico",
  "Cocina PY",
  "Parrilla",
  "Sushi",
  "Café",
  "Autor",
  "Italiana",
  "Fusión",
];
