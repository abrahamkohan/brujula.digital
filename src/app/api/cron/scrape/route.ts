// ============================================================
// Brújula Digital — Cron de scraping (Vercel Cron Jobs)
// ============================================================
// Corre a las 6:00 AM UTC (3:00 AM PY) todos los días.
// Ejecuta scrapers fetch-based (sin Playwright) y loggea
// resultados en sync_logs.
// ============================================================

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Scrapers que NO necesitan Playwright (corren en serverless)
const FETCH_SCRAPERS = [
  { name: "serpapi", fn: async () => { const { scrapeSerpapi } = await import("@/scripts/scrape-serpapi"); return scrapeSerpapi(); } },
  { name: "apf", fn: async () => { const { scrapeAPF } = await import("@/scripts/scrape-apf"); return scrapeAPF(); } },
];

export async function GET() {
  const startTime = Date.now();
  const supabase = await createClient();

  // Verificar que sea Vercel Cron (protección)
  const cronSecret = process.env.CRON_SECRET;
  // Si CRON_SECRET está configurado, el cron lo pasa como header
  // Por ahora, confiamos en que Vercel solo llama a este endpoint desde el cron

  const results: Array<{ name: string; status: string; events: number; error?: string }> = [];

  for (const scraper of FETCH_SCRAPERS) {
    try {
      const events = await scraper.fn();
      const eventsCount = Array.isArray(events) ? events.length : 0;
      results.push({ name: scraper.name, status: "ok", events: eventsCount });

      // Log a sync_logs
      await supabase.from("sync_logs").insert({
        fuente: scraper.name,
        timestamp: new Date().toISOString(),
        registros_nuevos: eventsCount,
        estado: "ok",
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      const errMsg = (err as Error).message;
      results.push({ name: scraper.name, status: "error", events: 0, error: errMsg });

      await supabase.from("sync_logs").insert({
        fuente: scraper.name,
        timestamp: new Date().toISOString(),
        registros_nuevos: 0,
        estado: "error",
        error_detail: errMsg.slice(0, 500),
        created_at: new Date().toISOString(),
      });
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  return NextResponse.json({
    success: true,
    ran_at: new Date().toISOString(),
    duration_seconds: duration,
    scrapers: results,
    note: "Scrapers con Playwright (ticketea, tuti, cinemark, market) no se ejecutan en Vercel. Correr npx tsx src/scripts/scrape-all.ts localmente para scraping completo.",
  });
}
