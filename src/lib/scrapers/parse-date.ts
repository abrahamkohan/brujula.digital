// ============================================================
// Radar de Eventos Paraguay — Parser de fechas en español
// ============================================================
// Maneja formatos típicos paraguayos como:
//   "Sábado 15 de Julio de 2026 — 20:00"
//   "15 de julio de 2026"
//   "15/07/2026"
//   "2026-07-15"
// ============================================================

const MONTHS: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

const DAYS = [
  "domingo", "lunes", "martes", "miércoles", "jueves",
  "viernes", "sábado", "sabado",
];

const ALL_SHORT_MONTHS: Record<string, number> = {
  // Inglés
  jan: 0, january: 0, feb: 1, february: 1,
  mar: 2, march: 2, apr: 3, april: 3,
  may: 4, jun: 5, june: 5,
  jul: 6, july: 6, aug: 7, august: 7,
  sep: 8, september: 8, oct: 9, october: 9,
  nov: 10, november: 10, dec: 11, december: 11,
  // Español abreviado
  ene: 0, feb: 1, mar: 2, abr: 3,
  may: 4, jun: 5, jul: 6,
  ago: 7, sep: 8, set: 8, oct: 9,
  nov: 10, dic: 11,
};

/**
 * Parsea una fecha en formato paraguayo y devuelve un objeto Date UTC.
 * Si no se puede parsear, devuelve null.
 *
 * Casos que maneja:
 * - "15 de julio de 2026"
 * - "Sábado 15 de Julio de 2026"
 * - "Sábado 15 de Julio de 2026 — 20:00"
 * - "15/07/2026"
 * - "2026-07-15" (ISO, directo)
 * - "15 de julio" (sin año → asume año corriente o siguiente si ya pasó)
 */
export function parseParaguayanDate(raw: string): Date | null {
  if (!raw || typeof raw !== "string") return null;

  const text = raw.trim();

  // Intento 1: ISO date estricto (YYYY-MM-DD o ISO8601 completo)
  {
    // Solo permitir formatos que empiecen con 4 dígitos (año) o ISO completo
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
      const iso = Date.parse(text);
      if (!Number.isNaN(iso)) return new Date(iso);
    }
  }

  // Intento 2: DD/MM/YYYY o DD/MM/YY
  {
    const m = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (m) {
      const [, d, mo, y] = m;
      const year = y.length === 2 ? 2000 + Number(y) : Number(y);
      return new Date(year, Number(mo) - 1, Number(d));
    }
  }

  // Intento 3: "Sábado 15 de Julio de 2026 — 20:00"
  //         o: "15 de julio de 2026"
  {
    const regex =
      /(?:[a-záéíóúñ]+?\s+)?(\d{1,2})\s+de\s+([a-záéíóúñ]+)(?:\s+de\s+(\d{4}))?(?:\s*[—–-]\s*(\d{1,2}):(\d{2}))?/i;
    const m = text.match(regex);
    if (m) {
      const day = Number(m[1]);
      const monthName = m[2].toLowerCase();
      const month = MONTHS[monthName];
      if (month === undefined) return null;

      let year = m[3] ? Number(m[3]) : new Date().getFullYear();
      const hour = m[4] ? Number(m[4]) : 0;
      const min = m[5] ? Number(m[5]) : 0;

      const date = new Date(year, month, day, hour, min);

      // Sin año explícito: si la fecha ya pasó, asumir año siguiente
      if (!m[3] && date.getTime() < Date.now()) {
        date.setFullYear(date.getFullYear() + 1);
      }

      return date;
    }
  }

  // Intento 4: Solo "15 de julio" (sin año, sin día de semana)
  {
    const m = text.match(/^(\d{1,2})\s+de\s+([a-záéíóúñ]+)$/i);
    if (m) {
      const day = Number(m[1]);
      const month = MONTHS[m[2].toLowerCase()];
      if (month === undefined) return null;

      let year = new Date().getFullYear();
      const date = new Date(year, month, day);

      // Si ya pasó, asumir año siguiente
      if (date.getTime() < Date.now()) {
        date.setFullYear(year + 1);
      }

      return date;
    }
  }

  // Intento 5: "13 MAY", "05 JUN", "23 AGO" — día + mes abreviado (inglés o español)
  {
    const m = text.match(/^(\d{1,2})\s+([a-z]{2,9})\.?$/i);
    if (m) {
      const day = Number(m[1]);
      const month = ALL_SHORT_MONTHS[m[2].toLowerCase()];
      if (month === undefined) return null;

      let year = new Date().getFullYear();
      const date = new Date(year, month, day);
      if (date.getTime() < Date.now()) date.setFullYear(year + 1);
      return date;
    }
  }

  // Intento 6: "VIE 13 JUN 21:00" o "SAB 15 JUN" — formato abreviado español
  {
    const m = text.match(/^(?:[a-záéíóúñ]{2,4}\.?\s+)?(\d{1,2})\s+([a-záéíóúñ]{3})\.?(?:\s+(\d{1,2}):(\d{2}))?/i);
    if (m) {
      const day = Number(m[1]);
      const month = ALL_SHORT_MONTHS[m[2].toLowerCase()];
      if (month === undefined) return null;

      const hour = m[3] ? Number(m[3]) : 0;
      const min = m[4] ? Number(m[4]) : 0;

      let year = new Date().getFullYear();
      const date = new Date(year, month, day, hour, min);
      if (date.getTime() < Date.now()) date.setFullYear(year + 1);
      return date;
    }
  }

  console.warn(`[parse-date] No se pudo parsear: "${raw}"`);
  return null;
}

/**
 * Parsea la fecha y devuelve una string ISO.
 * Si no se puede parsear, devuelve null.
 */
export function parseDateToISO(raw: string): string | null {
  const date = parseParaguayanDate(raw);
  return date ? date.toISOString() : null;
}
