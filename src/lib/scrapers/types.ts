// ============================================================
// Radar de Eventos Paraguay — Tipos compartidos del pipeline
// ============================================================

export type EventCategory =
  | "Concierto"
  | "Deporte"
  | "Feria"
  | "Congreso"
  | "Entretenimiento"
  | "Teatro"
  | "Otro";

export type EventImpact =
  | "mega"    // 50k+ personas
  | "alto"    // 10k–50k
  | "medio"   // 1k–10k
  | "bajo";   // < 1k

export type ScrapeStatus = "success" | "error";

export interface ScrapedEvent {
  /** Nombre del scraper, ej: "ticketea", "tuti" */
  source: string;

  /** ID único del evento en la fuente original (slug o numérico) */
  external_id: string;

  /** Título del evento */
  title: string;

  /** Fecha del evento (puede tener hora o no) */
  event_date?: string; // ISO string, ej: "2026-07-15". null si no se pudo extraer

  /** Fecha de fin si es multi-día */
  event_date_end?: string;

  /** Nombre del lugar */
  venue_name: string;

  /** Dirección del lugar */
  venue_address?: string;

  /** Coordenadas del lugar */
  venue_lat?: number;
  venue_lng?: number;

  /** Ciudad (default: Asunción) */
  city: string;

  /** Categoría del evento */
  category: EventCategory;

  /** Precio mínimo en guaraníes */
  price_min?: number;

  /** Precio máximo en guaraníes */
  price_max?: number;

  /** Moneda (default: PYG) */
  currency: string;

  /** Capacidad estimada del venue */
  capacity_estimate?: number;

  /** URL de la imagen del evento */
  image_url?: string;

  /** URL del evento en la fuente original */
  source_url: string;

  /** HTML crudo de la sección del evento (debugging) */
  raw_html?: string;
}

export interface ScrapeResult {
  source: string;
  status: ScrapeStatus;
  events_found: number;
  events_inserted: number;
  events_updated: number;
  error_message?: string;
  duration_ms: number;
}

/** Mapa de venues conocidos con coordenadas hardcodeadas */
export interface VenueInfo {
  name: string;
  address: string;
  lat: number;
  lng: number;
  city: string;
}

/**
 * Determina el impacto según la capacidad estimada.
 * Si no hay capacidad, devuelve "bajo" por defecto.
 */
export function computeImpact(capacity?: number): EventImpact {
  if (!capacity) return "bajo";
  if (capacity >= 50_000) return "mega";
  if (capacity >= 10_000) return "alto";
  if (capacity >= 1_000) return "medio";
  return "bajo";
}

/**
 * Mapea una categoría libre (ej: "concierto", "Conciertos") al enum normalizado.
 */
export function normalizeCategory(raw: string): EventCategory {
  const map: Record<string, EventCategory> = {
    concierto: "Concierto",
    conciertos: "Concierto",
    musica: "Concierto",
    música: "Concierto",
    show: "Concierto",
    recital: "Concierto",
    deporte: "Deporte",
    deportes: "Deporte",
    fútbol: "Deporte",
    futbol: "Deporte",
    ferias: "Feria",
    feria: "Feria",
    expo: "Feria",
    congreso: "Congreso",
    conferencia: "Congreso",
    conferencias: "Congreso",
    seminario: "Congreso",
    entretenimiento: "Entretenimiento",
    infantil: "Entretenimiento",
    familia: "Entretenimiento",
    teatro: "Teatro",
    obra: "Teatro",
    murga: "Teatro",
    otro: "Otro",
  };

  return map[raw.toLowerCase().trim()] ?? "Otro";
}

/** Palabras clave para detectar categoría desde el título */
export function detectCategory(title: string): EventCategory {
  const t = title.toLowerCase();

  // Fútbol / deportes
  if (
    /\bvs\b/i.test(t) ||
    /olimpia|cerro|guaraní|libertad|nacional|apuruguay|capiatá|luqueño|sportivo|tacuary|general díaz|sol de américa|ñu|tembetary/i.test(t) ||
    /apertura|clausura|sudamericana|libertadores|fecha\s+\d+/i.test(t)
  ) return "Deporte";

  // Ferias
  if (
    /expo|feria/i.test(t) &&
    !/exposición\s+(de\s+)?música|expo\s+(show|concierto)/i.test(t)
  ) return "Feria";

  // Teatro
  if (
    /obra|teatro|murga|unipersonal|la\s+(silfide|odisea)/i.test(t)
  ) return "Teatro";

  // Congresos / conferencias
  if (
    /congreso|conferencia|seminario|encuentro\s+(internacional|nacional|de\s+mujeres)/i.test(t)
  ) return "Congreso";

  // Entretenimiento (familiar, infantil)
  if (
    /disney|infantil|familiar|funday|kit\s+patriótico|tributo|es\s+posible\s+que\s+te\s+quiera|anna\s+cappelli|nunca\s+estuve|farreando|aislados|hace\s+feliz|bachata\s+paradise|soma\s+experience|teen\s+beach|conectarte|fiesta\s+ramona/i.test(t)
  ) return "Entretenimiento";

  // Default
  return "Concierto";
}
