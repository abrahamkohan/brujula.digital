// ============================================================
// Radar de Eventos Paraguay — Scraper MarketComunicaciones
// ============================================================
// Expo Gastronomik, Expo Logística, Convenfarma, Expovet, etc.
// WordPress con Playwright.
//
// Uso: npx tsx src/scripts/scrape-market.ts
// ============================================================

import { chromium } from "playwright";
import { detectCategory } from "../lib/scrapers/types";
import { upsertEventsNoImages } from "../lib/scrapers/upsert-events";
import type { ScrapedEvent } from "../lib/scrapers/types";

const BASE = "https://marketcomunicaciones.com";

export async function scrapeMarket(): Promise<ScrapedEvent[]> {
  console.log("\n🏢 [market] Iniciando scraper...");
  const start = Date.now();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  try {
    await page.goto(BASE, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    // Extraer eventos del menú de navegación + sliders
    const items = await page.evaluate(() => {
      const links = document.querySelectorAll<HTMLAnchorElement>(
        'a[href*="/expo-"], a[href*="/expovet"], a[href*="/convenfarma"]'
      );
      const seen = new Set<string>();
      const events: Array<{
        slug: string;
        title: string;
        imageUrl: string | null;
      }> = [];

      links.forEach((link) => {
        const href = link.getAttribute("href") ?? "";
        const match = href.match(/\/(expo-?[^/]+|expovet[^/]*|convenfarma[^/]*)/i);
        if (!match) return;
        const slug = match[1].toLowerCase().replace(/\/$/, "");
        if (seen.has(slug)) return;
        seen.add(slug);

        const img = link.querySelector("img");
        const title =
          link.textContent?.trim() ||
          img?.getAttribute("alt")?.trim() ||
          slug;
        let imageUrl = img?.getAttribute("src") ?? null;
        if (imageUrl && imageUrl.startsWith("/")) imageUrl = `https://marketcomunicaciones.com${imageUrl}`;

        events.push({ slug, title, imageUrl });
      });

      return events;
    });

    console.log(`[market] ${items.length} eventos encontrados`);

    // Visitar cada página de detalle
    const events: ScrapedEvent[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        console.log(`  [${i + 1}/${items.length}] ${item.title}`);
        await page.goto(`${BASE}/${item.slug}`, {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        });
        await page.waitForTimeout(1000);

        // Buscar imagen más grande que la del menu
        const detailImg = await page.evaluate(() => {
          const imgs = document.querySelectorAll<HTMLImageElement>(
            "main img, section img, .entry-content img, [class*='banner'] img, [class*='hero'] img"
          );
          let best = "";
          imgs.forEach((img) => {
            const src = img.getAttribute("src") ?? "";
            if (
              src.includes("wp-content/uploads") &&
              !src.includes("logo") &&
              src.length > best.length
            ) {
              best = src;
            }
          });
          return best || null;
        });

        events.push({
          source: "market",
          external_id: item.slug,
          title: item.title,
          event_date: new Date().toISOString(),
          venue_name: "",
          city: "Asunción",
          category: detectCategory(item.title),
          currency: "PYG",
          image_url: detailImg || item.imageUrl || undefined,
          source_url: `${BASE}/${item.slug}`,
        });

        await page.waitForTimeout(500);
      } catch (err) {
        console.warn(`  ⚠️ Error en "${item.title}": ${(err as Error).message}`);
        events.push({
          source: "market",
          external_id: item.slug,
          title: item.title,
          event_date: new Date().toISOString(),
          venue_name: "",
          city: "Asunción",
          category: detectCategory(item.title),
          currency: "PYG",
          image_url: item.imageUrl || undefined,
          source_url: `${BASE}/${item.slug}`,
        });
      }
    }

    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[market] ✅ ${events.length} eventos scrapeados en ${duration}s`);

    return events;
  } finally {
    await browser.close();
  }
}

// ─── Ejecución directa ─────────────────────────────────────────

const isMain = process.argv[1]?.includes("scrape-market");
if (isMain) {
  scrapeMarket()
    .then((events) => upsertEventsNoImages(events))
    .then((r) => console.log(`\n📊 Resumen: ${r.events_inserted} insertados`))
    .catch(console.error);
}
