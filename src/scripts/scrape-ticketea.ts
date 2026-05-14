// ============================================================
// Radar de Eventos Paraguay — Scraper Ticketea.com.py
// ============================================================
// Playwright para extraer listado + detalle.
//
// Uso: npx tsx src/scripts/scrape-ticketea.ts
// ============================================================

import { chromium } from "playwright";
import { parseParaguayanDate } from "../lib/scrapers/parse-date";
import { detectCategory } from "../lib/scrapers/types";
import { upsertEventsNoImages } from "../lib/scrapers/upsert-events";
import type { ScrapedEvent } from "../lib/scrapers/types";

const BASE = "https://ticketea.com.py";

// ─── Filtros de contenido basura ──────────────────────────────

const FILTER_KEYWORDS = [
  "buses a", "bus a", "salida desde", "salida encarnación",
  "salida santa rita", "salida maria auxiliadora",
  "kit patriótico", "buses a ciudad",
];

function isJunk(title: string): boolean {
  const t = title.toLowerCase();
  return FILTER_KEYWORDS.some((k) => t.includes(k));
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/\s+/g, " ")     // múltiples espacios → uno
    .replace(/\n/g, " ")      // newlines → espacio
    .replace(/^\d{1,2}\s+(MAY|JUN|JUL|AGO|SEP|OCT|NOV|DIC)\s+/i, "") // sacar fecha del inicio
    .trim();
}

// ─── Extraer lista del homepage ──────────────────────────────

async function scrapeEventList(page: import("playwright").Page) {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const items = await page.evaluate(() => {
    const links = document.querySelectorAll<HTMLAnchorElement>(
      'a[href*="/events/"]'
    );
    const seen = new Set<string>();
    const events: Array<{
      slug: string;
      title: string;
      rawDate: string;
      imageUrl: string | null;
    }> = [];

    links.forEach((link) => {
      const href = link.getAttribute("href") ?? "";
      const match = href.match(/\/events\/([^/]+)/);
      if (!match) return;

      const slug = match[1];
      if (seen.has(slug)) return;
      seen.add(slug);

      // Título: buscar <h1> dentro del link
      const h1 = link.querySelector("h1");
      let title = h1?.textContent?.trim() ?? "";

      // Fallback: alt de la imagen
      if (!title) {
        const img = link.querySelector("img");
        title = img?.getAttribute("alt")?.trim() ?? "";
      }

      // Último fallback: texto completo del link sin la fecha
      if (!title) {
        const p = link.querySelector("p");
        const pText = p?.textContent?.trim() ?? "";
        title = link.textContent?.replace(pText, "").trim() ?? slug;
      }

      // Fecha: del <p> dentro del link
      const p = link.querySelector("p");
      const rawDate = p?.textContent?.trim() ?? "";

      // Imagen
      const img = link.querySelector("img");
      const imageUrl = img?.getAttribute("src") ?? null;

      events.push({ slug, title, rawDate, imageUrl });
    });

    return events;
  });

  // Filtrar basura y limpiar títulos
  const clean = items
    .map((e) => ({ ...e, title: cleanTitle(e.title) }))
    .filter((e) => e.title.length > 2 && !isJunk(e.title));

  console.log(`[ticketea] ${items.length} eventos en homepage, ${clean.length} después de filtrar`);
  return clean;
}

// ─── Extraer detalle ─────────────────────────────────────────

async function scrapeDetail(page: import("playwright").Page, slug: string, title: string) {
  const url = `${BASE}/events/${slug}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(800);

  const detail = await page.evaluate(() => {
    const text = document.body.textContent ?? "";

    // h2 contiene venue
    const h2 = document.querySelector<HTMLElement>("h2");
    const h2Text = h2?.textContent?.trim() ?? "";
    const parts = h2Text.split(",").map((s) => s.trim());
    const venueName = parts[0] || "";

    // Imagen principal del evento: buscar la img del hero/cabecera
    const mainImg = document.querySelector<HTMLImageElement>(
      'img[src*="ticketea"], img[src*="cloudfront"], img[src*="mcusercontent"], section img, [class*="hero"] img, [class*="banner"] img'
    );
    const imageUrl = mainImg?.getAttribute("src") ?? null;

    return {
      venueName,
      imageUrl,
      rawHtml: document.querySelector('[class*="description"]')?.innerHTML ?? null,
    };
  });

  return {
    venueName: detail.venueName,
    imageUrl: detail.imageUrl,
    rawHtml: detail.rawHtml ?? undefined,
  };
}

// ─── Runner ──────────────────────────────────────────────────

export async function scrapeTicketea(): Promise<ScrapedEvent[]> {
  console.log("\n🎫 [ticketea] Iniciando scraper...");
  const start = Date.now();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  try {
    const items = await scrapeEventList(page);
    console.log(`[ticketea] Procesando ${items.length} eventos...`);

    const events: ScrapedEvent[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        console.log(`  [${i + 1}/${items.length}] ${item.title}`);
        const detail = await scrapeDetail(page, item.slug, item.title);

        const eventDate = parseParaguayanDate(item.rawDate);

        events.push({
          source: "ticketea",
          external_id: item.slug,
          title: item.title,
          event_date: eventDate?.toISOString() ?? new Date().toISOString(),
          venue_name: detail.venueName,
          city: "Asunción",
          category: detectCategory(item.title),
          currency: "PYG",
          image_url: detail.imageUrl
            ? (detail.imageUrl.startsWith("http") ? detail.imageUrl : `${BASE}${detail.imageUrl}`)
            : item.imageUrl?.startsWith("http")
              ? item.imageUrl
              : item.imageUrl
                ? `${BASE}${item.imageUrl}`
                : undefined,
          source_url: `${BASE}/events/${item.slug}`,
          raw_html: detail.rawHtml,
        });

        if (i < items.length - 1) await page.waitForTimeout(1200);
      } catch (err) {
        console.warn(`  ⚠️ Error en "${item.title}": ${(err as Error).message}`);

        const eventDate = parseParaguayanDate(item.rawDate);
        events.push({
          source: "ticketea",
          external_id: item.slug,
          title: item.title,
          event_date: eventDate?.toISOString() ?? new Date().toISOString(),
          venue_name: "",
          city: "Asunción",
          category: detectCategory(item.title),
          currency: "PYG",
          image_url: item.imageUrl?.startsWith("http")
            ? item.imageUrl
            : item.imageUrl
              ? `${BASE}${item.imageUrl}`
              : undefined,
          source_url: `${BASE}/events/${item.slug}`,
        });
      }
    }

    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[ticketea] ✅ ${events.length} eventos scrapeados en ${duration}s`);
    return events;
  } finally {
    await browser.close();
  }
}

// ─── Helper ──────────────────────────────────────────────────

function url(path: string) {
  return path.startsWith("http") ? path : `${BASE}${path}`;
}

// ─── Ejecución directa ───────────────────────────────────────

const isMain = process.argv[1]?.includes("scrape-ticketea");
if (isMain) {
  scrapeTicketea()
    .then((events) => upsertEventsNoImages(events))
    .then((r) =>
      console.log(`\n📊 Resumen: ${r.events_inserted} insertados en ${r.duration_ms}ms`)
    )
    .catch(console.error);
}
