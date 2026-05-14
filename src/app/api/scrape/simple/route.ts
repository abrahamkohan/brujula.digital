// ============================================================
// API route para scrapers simples (fetch + cheerio)
// ============================================================
// POST /api/scrape/simple
// Body: { source: "apf" | "visitparaguay" }
//
// NOTA: Los scrapers con Playwright (Ticketea, Tuti, Tiketon,
// AllAccess) NO pueden correr en Vercel porque no tienen
// Chromium. Esos se ejecutan localmente con:
//   npm run scrape:ticketea
//   npm run scrape:tuti
// ============================================================

import { NextRequest } from "next/server";

// Tiempo máximo: Vercel Pro permite hasta 300s (5min)
export const maxDuration = 300;

const SCRAPERS: Record<string, () => Promise<unknown>> = {
  // Los que funcionan en Vercel
  // apf: () => import("@/scripts/scrape-apf").then(m => m.scrapeAPF()),
  // visitparaguay: () => import("@/scripts/scrape-visitparaguay").then(m => m.scrapeVisitParaguay()),
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source } = body as { source?: string };

    if (!source) {
      return Response.json({ error: "Falta source" }, { status: 400 });
    }

    const scraper = SCRAPERS[source];
    if (!scraper) {
      return Response.json(
        {
          error: `Scraper "${source}" no disponible en Vercel. ` +
            `Ejecutalo localmente con: npm run scrape:${source}`,
        },
        { status: 400 }
      );
    }

    const events = await scraper();

    return Response.json({
      success: true,
      source,
      events_found: Array.isArray(events) ? events.length : 0,
    });
  } catch (err) {
    return Response.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
