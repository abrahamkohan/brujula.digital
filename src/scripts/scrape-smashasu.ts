// ============================================================
// Radar de Eventos Paraguay — Scraper Smash Asunción
// ============================================================
// Playwright para extraer cartelera de smashasu.com/cartelera/
//
// Uso: npx tsx src/scripts/scrape-smashasu.ts
// ============================================================

import { chromium } from "playwright";
import { parseParaguayanDate } from "../lib/scrapers/parse-date";
import { upsertEventsNoImages } from "../lib/scrapers/upsert-events";
import { normalizeCategory } from "../lib/scrapers/types";
import type { ScrapedEvent, EventCategory } from "../lib/scrapers/types";

const BASE = "https://www.smashasu.com";

// ─── Parser de fecha smashasu ─────────────────────────────────
// Maneja: "Vie 8 → Dom 10 de Mayo" o "Sáb 17 de Mayo"

function parseSmashasuDate(raw: string): Date | null {
  if (!raw) return null;

  // "Vie 8 → Dom 10 de Mayo" → toma el primer día
  const arrow = raw.match(
    /(?:Lun|Mar|Mi[eé]|Jue|Vie|S[aá]b|Dom)\s+(\d{1,2})\s*[→>].+?(\d{1,2})\s+de\s+([a-záéíóúñ]+)/i
  );
  if (arrow) {
    return parseParaguayanDate(`${arrow[1]} de ${arrow[3]}`);
  }

  // "Vie 8 de Mayo" → toma directo
  const single = raw.match(
    /(?:Lun|Mar|Mi[eé]|Jue|Vie|S[aá]b|Dom)\s+(\d{1,2})\s+de\s+([a-záéíóúñ]+)/i
  );
  if (single) {
    return parseParaguayanDate(`${single[1]} de ${single[2]}`);
  }

  return parseParaguayanDate(raw);
}

// ─── Detectar categoría ───────────────────────────────────────

function detectSmashasuCategory(text: string): EventCategory {
  const t = text.toLowerCase();
  if (t.includes("🎭") || t.includes("teatro") || t.includes("obra")) return normalizeCategory("teatro");
  if (t.includes("🎶") || t.includes("música") || t.includes("musica") || t.includes("concierto") || t.includes("recital")) return normalizeCategory("concierto");
  if (t.includes("🎪") || t.includes("stand up") || t.includes("comedia")) return normalizeCategory("entretenimiento");
  if (t.includes("🎬") || t.includes("cine") || t.includes("film")) return normalizeCategory("cine");
  return normalizeCategory("entretenimiento");
}

// ─── Scraper ──────────────────────────────────────────────────

async function scrapeSmashasu(): Promise<ScrapedEvent[]> {
  console.log("\n🎭 [smashasu] Iniciando scraper...");
  const start = Date.now();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE}/cartelera/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);

    const rawEvents = await page.evaluate(() => {
      const results: Array<{
        titulo: string;
        cardText: string;
        imageUrl: string | null;
        sourceUrl: string | null;
      }> = [];

      // Buscar todos los h3 — cada uno es un título de evento
      const h3s = Array.from(document.querySelectorAll("h3"));

      for (const h3 of h3s) {
        const titulo = h3.textContent?.trim() ?? "";
        if (!titulo || titulo.length < 3) continue;

        // Subir hasta encontrar el contenedor del evento (card)
        let card: Element = h3;
        for (let i = 0; i < 6; i++) {
          const parent = card.parentElement;
          if (!parent || parent.tagName === "BODY") break;
          card = parent;
          // Card encontrada cuando tiene varios hijos con contenido
          const children = Array.from(card.children);
          if (children.length >= 3) break;
        }

        const cardText = card.textContent ?? "";

        // Imagen: preferir img real sobre data: o svg
        const imgs = Array.from(card.querySelectorAll("img"));
        const realImg = imgs.find((img) => {
          const src = img.getAttribute("src") ?? "";
          return src.startsWith("http") && !src.includes("data:");
        });
        const imageUrl = realImg?.getAttribute("src") ?? null;

        // Link: preferir links de compra/info sobre redes sociales
        const links = Array.from(card.querySelectorAll("a[href]")) as HTMLAnchorElement[];
        const preferredLink = links.find((a) => {
          const href = a.href;
          return href.includes("ticketea") || href.includes("smashasu") || href.includes("http");
        });
        const sourceUrl = preferredLink?.href ?? null;

        results.push({ titulo, cardText, imageUrl, sourceUrl });
      }

      return results;
    });

    console.log(`[smashasu] ${rawEvents.length} eventos encontrados`);

    const events: ScrapedEvent[] = [];

    for (const raw of rawEvents) {
      const { titulo, cardText, imageUrl, sourceUrl } = raw;

      // Fecha
      const dateMatch = cardText.match(
        /(?:Lun|Mar|Mi[eé]|Jue|Vie|S[aá]b|Dom)\s+\d{1,2}(?:\s*[→>]\s*(?:Lun|Mar|Mi[eé]|Jue|Vie|S[aá]b|Dom)\s+\d{1,2})?\s+de\s+[a-záéíóúñ]+/i
      );
      const rawDate = dateMatch?.[0] ?? "";
      const eventDate = parseSmashasuDate(rawDate);

      if (!eventDate) {
        console.warn(`  ⚠️ Sin fecha: "${titulo}"`);
        continue;
      }

      // Venue: primera línea que parezca un lugar
      const venueMatch = cardText.match(
        /(?:Teatro|Arlequín|Arlequin|Centro|Club|Auditorio|Plaza|Sala|Casa|Anfiteatro)[^\n.]{3,60}/i
      );
      const venue = venueMatch?.[0]?.trim() ?? "Asunción";

      const categoria = detectSmashasuCategory(cardText);
      const slug = titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
      const dateStr = eventDate.toISOString().slice(0, 10);

      console.log(`  ✓ ${titulo} — ${dateStr} — ${categoria}`);

      events.push({
        source: "smashasu",
        external_id: `${slug}-${dateStr}`,
        title: titulo,
        event_date: eventDate.toISOString(),
        venue_name: venue,
        city: "Asunción",
        category: categoria,
        currency: "PYG",
        image_url: imageUrl ?? undefined,
        source_url: sourceUrl ?? `${BASE}/cartelera/`,
      });
    }

    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[smashasu] ✅ ${events.length} eventos válidos en ${duration}s`);
    return events;
  } finally {
    await browser.close();
  }
}

// ─── Ejecución directa ───────────────────────────────────────

const isMain = process.argv[1]?.includes("scrape-smashasu");
if (isMain) {
  scrapeSmashasu()
    .then((events) => upsertEventsNoImages(events))
    .then((r) =>
      console.log(`\n📊 Resumen: ${r.events_inserted} insertados en ${r.duration_ms}ms`)
    )
    .catch(console.error);
}

export { scrapeSmashasu };
