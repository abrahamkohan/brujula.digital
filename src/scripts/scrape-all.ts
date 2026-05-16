// ============================================================
// Radar de Eventos Paraguay — Runner principal
// ============================================================
// Ejecuta todos los scrapers en paralelo, upserta los
// resultados en Supabase y muestra un resumen final.
//
// Uso: npx tsx src/scripts/scrape-all.ts
// ============================================================

import { scrapeTicketea } from "./scrape-ticketea";
import { scrapeTuti } from "./scrape-tuti";
import { scrapeAPF } from "./scrape-apf";
import { scrapeCinemark } from "./scrape-cinemark";
import { scrapeGeminiEvents } from "./scrape-gemini-events";
import { scrapeSerpapi } from "./scrape-serpapi";
import { upsertEventsNoImages } from "../lib/scrapers/upsert-events";
import { dedupEventos } from "./dedup-eventos";

import type { ScrapedEvent, ScrapeResult } from "../lib/scrapers/types";

interface ScraperDef {
  name: string;
  fn: () => Promise<ScrapedEvent[]>;
}

const SCRAPERS: ScraperDef[] = [
  { name: "ticketea", fn: scrapeTicketea },
  { name: "tuti", fn: scrapeTuti },
  { name: "apf", fn: scrapeAPF },
  { name: "gemini", fn: scrapeGeminiEvents },
];

// Scrapers que requieren Playwright (se ejecutan secuencialmente)
const BROWSER_SCRAPERS: ScraperDef[] = [
  { name: "cinemark", fn: scrapeCinemark as unknown as () => Promise<ScrapedEvent[]> },
  // { name: "tiketon", fn: scrapeTiketon },
  // { name: "allaccess", fn: scrapeAllAccess },
];

export async function runAllScrapers(): Promise<ScrapeResult[]> {
  console.log("=".repeat(50));
  console.log("🔍 RADAR DE EVENTOS PARAGUAY — SCRAPE COMPLETO");
  console.log(`📅 ${new Date().toLocaleString("es-PY")}`);
  console.log("=".repeat(50));

  const allResults: ScrapeResult[] = [];

  // 1) Scrapers simples en paralelo
  console.log("\n🚀 Ejecutando scrapers simples...");
  const simpleResults = await Promise.allSettled(
    SCRAPERS.map(async (s) => {
      const start = Date.now();
      try {
        const events = await s.fn();
        const result = await upsertEventsNoImages(events);
        return { ...result, source: s.name };
      } catch (err) {
        return {
          source: s.name,
          status: "error" as const,
          events_found: 0,
          events_inserted: 0,
          events_updated: 0,
          error_message: (err as Error).message,
          duration_ms: Date.now() - start,
        };
      }
    })
  );

  for (const r of simpleResults) {
    if (r.status === "fulfilled") {
      allResults.push(r.value);
    }
  }

  // 2) Scrapers con browser secuenciales (comparten instancia de Chrome)
  if (BROWSER_SCRAPERS.length > 0) {
    console.log("\n🌐 Ejecutando scrapers con browser...");
    for (const s of BROWSER_SCRAPERS) {
      const start = Date.now();
      try {
        const events = await s.fn();
        const result = await upsertEventsNoImages(events);
        allResults.push({ ...result, source: s.name });
      } catch (err) {
        allResults.push({
          source: s.name,
          status: "error",
          events_found: 0,
          events_inserted: 0,
          events_updated: 0,
          error_message: (err as Error).message,
          duration_ms: Date.now() - start,
        });
      }
    }
  }

  // 3) Deduplicación post-scraping
  await dedupEventos(true);

  // 4) Resumen final
  console.log("\n" + "=".repeat(50));
  console.log("📊 RESUMEN FINAL");
  console.log("=".repeat(50));

  let totalFound = 0;
  let totalInserted = 0;
  let totalErrors = 0;
  let totalTime = 0;

  for (const r of allResults) {
    const icon = r.status === "success" ? "✅" : "❌";
    console.log(
      `  ${icon} ${r.source}: ${r.events_found} encontrados, ` +
        `${r.events_inserted} insertados (${r.duration_ms}ms)`
    );
    totalFound += r.events_found;
    totalInserted += r.events_inserted;
    totalTime += r.duration_ms;
    if (r.status === "error") totalErrors++;
  }

  console.log("-".repeat(50));
  console.log(
    `  📦 Total: ${totalFound} eventos encontrados, ` +
      `${totalInserted} insertados en ${(totalTime / 1000).toFixed(1)}s`
  );
  if (totalErrors > 0) {
    console.log(`  ⚠️  ${totalErrors} scraper(s) con errores`);
  }
  console.log("=".repeat(50));

  return allResults;
}

// ─── Ejecución directa ─────────────────────────────────────────

const isMain = process.argv[1]?.includes("scrape-all");
if (isMain) {
  runAllScrapers()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Fatal:", err);
      process.exit(1);
    });
}
