// ============================================================
// Radar de Eventos Paraguay — Scraper Tuti.com.py
// ============================================================
// Sitio con categorías bien definidas. Playwright para
// extraer listado + detalle (precios, venue).
//
// Uso: npx tsx src/scripts/scrape-tuti.ts
// ============================================================

import { chromium } from "playwright";
import { parseParaguayanDate } from "../lib/scrapers/parse-date";
import { detectCategory } from "../lib/scrapers/types";
import type { ScrapedEvent, EventCategory } from "../lib/scrapers/types";
import { upsertEventsNoImages } from "../lib/scrapers/upsert-events";

const BASE = "https://www.tuti.com.py";

// ─── Extraer lista del homepage ────────────────────────────────

interface TutiListItem {
  slug: string;
  title: string;
  category: string;
  rawDate: string;
  venue: string;
  imageUrl: string | null;
}

async function scrapeList(
  page: import("playwright").Page
): Promise<TutiListItem[]> {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const items = await page.evaluate(() => {
    const sections = document.querySelectorAll<HTMLElement>(
      'section, div[class*="category"], div[class*="section"]'
    );
    const results: Array<{
      slug: string;
      title: string;
      category: string;
      rawDate: string;
      venue: string;
      imageUrl: string | null;
    }> = [];
    const seen = new Set<string>();

    // Buscar links a eventos
    const eventLinks = document.querySelectorAll<HTMLAnchorElement>(
      'a[href*="/evento/"]'
    );

    eventLinks.forEach((link) => {
      const href = link.getAttribute("href") ?? "";
      const match = href.match(/\/evento\/([^?/]+)/);
      if (!match) return;

      let slug = match[1];
      // Sacar trailing dash
      slug = slug.replace(/-+$/, "");
      if (seen.has(slug)) return;

      // Imagen
      const elImg = link.querySelector("img");
      const imageUrl = elImg?.getAttribute("src") ?? null;
      const imgAlt = elImg?.getAttribute("alt") ?? "";

      // Saltar banners del carousel
      if (imgAlt.toLowerCase().includes("banner")) return;
      if (link.textContent?.toLowerCase().includes("banner")) return;
      seen.add(slug);

      // Título del alt de la imagen
      const title = imgAlt.replace(/^Imagen del evento\s*/i, "").trim() || slug;

      // Parsear el texto del link para fecha y venue
      // Formato: "TITLE 6 de junio - 20:00 Jockey Club"
      const linkText = link.textContent?.trim() ?? "";

      // Extraer fecha y venue: busco patrón "día de mes - hora venue"
      const detailMatch = linkText.match(
        /(\d{1,2}\s+de\s+[a-záéíóúñ]+\s*(?:\s+de\s+\d{4})?)\s*[-–—]\s*(\d{1,2}:\d{2})\s*(?:hs\.?)?\s*(.+?)$/i
      );

      let rawDate = "";
      let venue = "";

      if (detailMatch) {
        rawDate = detailMatch[1].trim();
        venue = detailMatch[3].trim();
      } else {
        // Fallback: intentar con "VER FECHAS" o texto más simple
        const simpleMatch = linkText.match(
          /(\d{1,2}\s+de\s+[a-záéíóúñ]+)/i
        );
        if (simpleMatch) rawDate = simpleMatch[1].trim();
      }

      // Categoría de la sección donde está el link
      let category = "Otro";
      let parent = link.parentElement;
      for (let i = 0; i < 5 && parent; i++) {
        const text = parent.textContent?.toLowerCase() ?? "";
        if (text.includes("deport")) {
          category = "Deporte";
          break;
        }
        if (text.includes("concierto") || text.includes("músic")) {
          category = "Concierto";
          break;
        }
        if (text.includes("conferencia") || text.includes("congreso")) {
          category = "Congreso";
          break;
        }
        if (text.includes("entretenimiento")) {
          category = "Entretenimiento";
          break;
        }
        parent = parent.parentElement;
      }

      results.push({ slug, title, category, rawDate, venue, imageUrl });
    });

    return results;
  });

  // Filtrar basura y limpiar títulos
  const filtered = items
    .filter((e) => {
      const t = e.title.toLowerCase();
      if (t.length < 3) return false;
      if (t.includes("banner")) return false;
      if (t.includes("kit patriótico")) return false;
      return true;
    })
    .map((e) => {
      // detectCategory tiene prioridad sobre la sección del homepage
      const detected = detectCategory(e.title);
      if (detected !== "Concierto") {
        // Si detectCategory encuentra algo más específico que Concierto, usalo
        return { ...e, category: detected };
      }
      // Si no, mantener la categoría de la sección (o Concierto como default)
      return { ...e, category: e.category || detected };
    });

  console.log(`[tuti] ${items.length} encontrados, ${filtered.length} después de filtrar`);
  return filtered;
}

// ─── Extraer detalle de un evento ──────────────────────────────

async function scrapeDetail(
  page: import("playwright").Page,
  item: TutiListItem
): Promise<ScrapedEvent> {
  const url = `${BASE}/evento/${item.slug}`;
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const detail = await page.evaluate(() => {
    const text = document.body.textContent ?? "";

    // Buscar precio mínimo (el más bajo de todos los sectores)
    const priceRegex = /Desde\s*Gs\.?\s*([\d.]+)/gi;
    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    const prices: number[] = [];

    let match;
    while ((match = priceRegex.exec(text)) !== null) {
      const p = parseInt(match[1].replace(/\./g, ""));
      if (!isNaN(p)) prices.push(p);
    }

    if (prices.length > 0) {
      prices.sort((a, b) => a - b);
      minPrice = prices[0];
      maxPrice = prices[prices.length - 1];
    }

    // Venue del texto del detalle
    // Buscar "lugar:" o el venue en el texto
    const venueMatch = text.match(
      /(?:lugar|local|venue|lugar\s*:)\s*([^\n.]+)/i
    );

    return {
      priceMin: minPrice,
      priceMax: maxPrice !== minPrice ? maxPrice : undefined,
      venueDetail: venueMatch?.[1]?.trim() ?? "",
    };
  });

  // Parsear la fecha
  const eventDate = parseParaguayanDate(item.rawDate);

  return {
    source: "tuti",
    external_id: item.slug,
    title: item.title,
    event_date: eventDate?.toISOString() ?? new Date().toISOString(),
    venue_name: item.venue || detail.venueDetail,
    city: item.venue.toLowerCase().includes("asunción") ||
      item.venue.toLowerCase().includes("asuncion")
      ? "Asunción"
      : "Asunción",
    category: item.category as EventCategory,
    price_min: detail.priceMin,
    price_max: detail.priceMax,
    currency: "PYG",
    image_url: item.imageUrl ?? undefined,
    source_url: url,
  };
}

// ─── Runner ────────────────────────────────────────────────────

export async function scrapeTuti(): Promise<ScrapedEvent[]> {
  console.log("\n🎭 [tuti] Iniciando scraper...");
  const start = Date.now();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  try {
    const items = await scrapeList(page);
    console.log(`[tuti] Procesando ${items.length} eventos...`);

    const events: ScrapedEvent[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        console.log(`  [${i + 1}/${items.length}] ${item.title}`);
        const detail = await scrapeDetail(page, item);
        events.push(detail);

        if (i < items.length - 1) await page.waitForTimeout(1000);
      } catch (err) {
        console.warn(`  ⚠️ Error en "${item.title}": ${(err as Error).message}`);
        events.push({
          source: "tuti",
          external_id: item.slug,
          title: item.title,
          event_date:
            parseParaguayanDate(item.rawDate)?.toISOString() ??
            new Date().toISOString(),
          venue_name: item.venue,
          city: "Asunción",
    category: item.category as EventCategory,
          currency: "PYG",
          image_url: item.imageUrl ?? undefined,
          source_url: `${BASE}/evento/${item.slug}`,
        });
      }
    }

    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[tuti] ✅ ${events.length} eventos scrapeados en ${duration}s`);

    return events;
  } finally {
    await browser.close();
  }
}

// ─── Ejecución directa ─────────────────────────────────────────

const isMain = process.argv[1]?.includes("scrape-tuti");
if (isMain) {
  scrapeTuti()
    .then((events) => upsertEventsNoImages(events))
    .then((r) =>
      console.log(`\n📊 Resumen: ${r.events_inserted} insertados en ${r.duration_ms}ms`)
    )
    .catch(console.error);
}
