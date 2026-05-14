// ============================================================
// Radar de Eventos Paraguay — Scraper VisitParaguay.travel
// ============================================================
// Portal oficial de turismo. Fetch + cheerio.
//
// Uso: npx tsx src/scripts/scrape-visitparaguay.ts
// ============================================================

import * as cheerio from "cheerio";
import { upsertEventsNoImages } from "../lib/scrapers/upsert-events";
import { parseParaguayanDate } from "../lib/scrapers/parse-date";
import { normalizeCategory } from "../lib/scrapers/types";
import type { ScrapedEvent } from "../lib/scrapers/types";

const BASE = "https://visitparaguay.travel";

export async function scrapeVisitParaguay(): Promise<ScrapedEvent[]> {
  console.log("\n🏛️ [visitparaguay] Iniciando scraper...");
  const start = Date.now();

  try {
    const response = await fetch(`${BASE}/events`, {
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

    // Buscar tarjetas de eventos (estructura típica de WP)
    $("article, .event-card, .evento-card, [class*='event'], .post-card").each(
      (_, el) => {
        const $el = $(el);

        // Título
        const title =
          $el.find("h1, h2, h3, h4, .title, .entry-title").first().text().trim() ||
          $el.find("a").first().text().trim();

        if (!title) return;

        // Slug / external_id
        const link = $el.find("a").first().attr("href") || "";
        const slug =
          link.split("/").filter(Boolean).pop() ||
          title.toLowerCase().replace(/\s+/g, "-");

        // Fecha
        const dateText =
          $el.find(".date, .fecha, time, [class*='date'], [class*='fecha']")
            .first()
            .text()
            .trim() ||
          $el.find("time").attr("datetime") ||
          "";

        const eventDate = parseParaguayanDate(dateText);

        // Imagen
        const img =
          $el.find("img").first().attr("src") ||
          $el.find("img").first().attr("data-src") ||
          "";

        // Descripción corta
        const desc =
          $el.find("p, .description, .excerpt, .resumen").first().text().trim() || "";

        // Categoría
        const catText =
          $el.find(".category, .cat, .tag, [class*='category']").first().text().trim() ||
          "Otro";

        const category = normalizeCategory(catText);

        // Venue
        const venue =
          $el.find(".venue, .location, .lugar, [class*='venue'], [class*='lugar']")
            .first()
            .text()
            .trim() || "";

        events.push({
          source: "visitparaguay",
          external_id: slug,
          title,
          event_date: eventDate?.toISOString() ?? new Date().toISOString(),
          venue_name: venue,
          city: venue.toLowerCase().includes("asunción")
            ? "Asunción"
            : "Asunción",
          category,
          currency: "PYG",
          image_url: img.startsWith("http") ? img : img ? `${BASE}${img}` : undefined,
          source_url: link.startsWith("http") ? link : `${BASE}${link}`,
        });

        // RAW debug
        if (events.length <= 3) {
          console.log(`  📄 "${title}" → ${eventDate?.toISOString() ?? "sin fecha"}`);
        }
      }
    );

    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[visitparaguay] ${events.length} eventos encontrados en ${duration}s`);

    return events;
  } catch (err) {
    console.error(`[visitparaguay] ❌ Error: ${(err as Error).message}`);
    return [];
  }
}

// ─── Ejecución directa ─────────────────────────────────────────

const isMain = process.argv[1]?.includes("scrape-visitparaguay");
if (isMain) {
  scrapeVisitParaguay()
    .then((events) => upsertEventsNoImages(events))
    .then((r) =>
      console.log(`\n📊 Resumen: ${r.events_inserted} insertados en ${r.duration_ms}ms`)
    )
    .catch(console.error);
}
