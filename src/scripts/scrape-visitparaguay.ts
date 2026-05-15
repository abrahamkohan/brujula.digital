// ============================================================
// Radar de Eventos Paraguay — Scraper VisitParaguay.travel
// ============================================================
// Portal oficial de turismo. Usa Playwright porque la página
// carga los eventos con JS (Next.js).
//
// Uso: npx tsx src/scripts/scrape-visitparaguay.ts
// ============================================================

import { chromium } from "playwright";
import { parseParaguayanDate } from "../lib/scrapers/parse-date";
import { detectCategory } from "../lib/scrapers/types";
import { upsertEventsNoImages } from "../lib/scrapers/upsert-events";
import type { ScrapedEvent } from "../lib/scrapers/types";

const BASE = "https://visitparaguay.travel";

export async function scrapeVisitParaguay(): Promise<ScrapedEvent[]> {
  console.log("\n🏛️ [visitparaguay] Iniciando scraper...");
  const start = Date.now();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  try {
    await page.goto(BASE, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(2000);

    const items = await page.evaluate(() => {
      // Buscar links a /events/ en el homepage
      const links = document.querySelectorAll<HTMLAnchorElement>(
        'a[href*="/events/"]'
      );
      const seen = new Set<string>();
      const events: Array<{
        slug: string;
        title: string;
        dateText: string;
        imageUrl: string | null;
      }> = [];

      links.forEach((link) => {
        const href = link.getAttribute("href") ?? "";
        const match = href.match(/\/events\/([^/]+)/);
        if (!match) return;

        const slug = match[1];
        if (seen.has(slug)) return;
        seen.add(slug);

        // Título del link text o del heading
        const heading = link.querySelector("h1, h2, h3, h4");
        const title =
          (heading?.textContent?.trim() || slug)
            .replace(/\s+/g, ' ')  // múltiples espacios → uno
            .trim();

        // Fecha del texto del link
        const dateMatch = link.textContent?.match(
          /(\d{1,2})\s*\/\s*([a-zñé]+)\s*\.\s*(\d{4})/i
        );
        const dateText = dateMatch
          ? `${dateMatch[1]} de ${dateMatch[2]} de ${dateMatch[3]}`
          : "";

        // Imagen
        const img = link.querySelector("img");
        let imageUrl = img?.getAttribute("src") ?? null;
        if (imageUrl && imageUrl.startsWith("/")) {
          imageUrl = `https://visitparaguay.travel${imageUrl}`;
        }

        events.push({ slug, title, dateText, imageUrl });
      });

      return events;
    });

    console.log(`[visitparaguay] ${items.length} eventos encontrados`);

    const events: ScrapedEvent[] = items.map((item) => {
      const eventDate = item.dateText
        ? parseParaguayanDate(item.dateText)
        : null;

      return {
        source: "visitparaguay",
        external_id: item.slug,
        title: item.title,
        event_date: eventDate?.toISOString() ?? undefined,
        venue_name: "",
        city: "Asunción",
        category: detectCategory(item.title),
        currency: "PYG",
        image_url: item.imageUrl ?? undefined,
        source_url: `${BASE}/events/${item.slug}`,
      };
    });

    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[visitparaguay] ✅ ${events.length} eventos scrapeados en ${duration}s`);

    return events;
  } finally {
    await browser.close();
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
