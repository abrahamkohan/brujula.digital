// ============================================================
// Radar de Eventos Paraguay — Scraper APF (Fútbol)
// ============================================================
// Extrae fixtures de partidos de fútbol paraguayo desde
// apf.org.py usando fetch + cheerio (HTML estático).
//
// Uso: npx tsx src/scripts/scrape-apf.ts
// ============================================================

import * as cheerio from "cheerio";
import { upsertEventsNoImages } from "../lib/scrapers/upsert-events";
import type { ScrapedEvent } from "../lib/scrapers/types";

const BASE = "https://www.apf.org.py";

// ─── Scraper ───────────────────────────────────────────────────

export async function scrapeAPF(): Promise<ScrapedEvent[]> {
  console.log("\n⚽ [apf] Iniciando scraper...");
  const start = Date.now();

  try {
    const response = await fetch(`${BASE}/fixture`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "text/html",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const events: ScrapedEvent[] = [];

    // Buscar tablas de fixtures
    $("table").each((_, table) => {
      const rows = $(table).find("tr");

      rows.each((_, row) => {
        const cols = $(row).find("td, th");
        if (cols.length < 3) return;

        const text = cols.map((_, el) => $(el).text().trim()).get();

        // Intentar parsear: [fecha, local, visitante, hora, estadio, competencia]
        const rowText = text.join(" | ");

        // Buscar nombres de equipos (vs o vs.)
        const match = rowText.match(
          /([A-ZÁÉÍÓÚÑ\s]+)\s+(?:vs\.?|vs)\s+([A-ZÁÉÍÓÚÑ\s]+)/i
        );
        if (!match) return;

        const local = match[1].trim();
        const visitante = match[2].trim();
        const title = `${local} vs ${visitante}`;

        // External_id basado en los equipos
        const extId = `${local.replace(/\s+/g, "-")}-vs-${visitante.replace(/\s+/g, "-")}`
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "");

        // Buscar fecha en el texto
        const dateMatch = rowText.match(
          /(\d{1,2})[\/\-](\d{1,2})(?:\/(\d{2,4}))?/
        );
        let eventDate: string | null = null;
        if (dateMatch) {
          const [, d, m, y] = dateMatch;
          const year = y ? (y.length === 2 ? 2000 + parseInt(y) : parseInt(y)) : 2026;
          eventDate = new Date(
            year,
            parseInt(m) - 1,
            parseInt(d)
          ).toISOString();
        }

        // Buscar hora
        const timeMatch = rowText.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch && eventDate) {
          const date = new Date(eventDate);
          date.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]));
          eventDate = date.toISOString();
        }

        // Buscar estadio
        const venues = [
          "Defensores del Chaco",
          "La Nueva Olla",
          "Manuel Ferreira",
          "Gral. Pablo Rojas",
          "Antonio Aranda",
          "Felix Cabrera",
          "Luis Alfonso Giagni",
          "La Arboleda",
          "Villa Alegre",
          "Parque del Guairá",
          "Ka\'arendy",
          "Gunther Vogel",
          "Progreso",
          "Municipal de Carapeguá",
        ];

        let estadio = "";
        for (const v of venues) {
          if (rowText.toLowerCase().includes(v.toLowerCase())) {
            estadio = v;
            break;
          }
        }

        if (eventDate) {
          events.push({
            source: "apf",
            external_id: extId,
            title,
            event_date: eventDate,
            venue_name: estadio,
            city: "Asunción",
            category: "Deporte",
            currency: "PYG",
            source_url: `${BASE}/fixture`,
          });
        }
      });
    });

    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[apf] ${events.length} partidos encontrados en ${duration}s`);

    return events;
  } catch (err) {
    console.error(`[apf] ❌ Error: ${(err as Error).message}`);
    return [];
  }
}

// ─── Ejecución directa ─────────────────────────────────────────

const isMain = process.argv[1]?.includes("scrape-apf");
if (isMain) {
  scrapeAPF()
    .then((events) => upsertEventsNoImages(events))
    .then((r) =>
      console.log(`\n📊 Resumen: ${r.events_inserted} insertados en ${r.duration_ms}ms`)
    )
    .catch(console.error);
}
