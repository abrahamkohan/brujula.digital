// ============================================================
// Brújula Digital — Scraper de eventos via Gemini + Google Search
// ============================================================
// Usa Gemini 2.0 Flash con Google Search Grounding para buscar
// eventos en Asunción (shows de bares, culturales, vida nocturna)
//
// Uso: npx tsx src/scripts/scrape-gemini-events.ts
// ============================================================

import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), ".env.local") });

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createHash } from "crypto";
import type { ScrapedEvent } from "../lib/scrapers/types";

const API_KEY = process.env.GEMINI_API_KEY;

const SEARCHES = [
  "conciertos shows eventos esta semana Asunción Paraguay",
  "eventos culturales teatro exposiciones arte Asunción Paraguay esta semana",
  "eventos bares vida nocturna fiestas Asunción Paraguay este fin de semana",
];

interface GeminiEvent {
  title: string;
  event_date: string | null;
  venue_name: string | null;
  category: string | null;
  description: string | null;
  source_url: string | null;
}

function slugify(title: string, date: string | null): string {
  return createHash("md5")
    .update(`gemini-${title}-${date ?? ""}`)
    .digest("hex")
    .slice(0, 12);
}

async function searchEvents(query: string): Promise<GeminiEvent[]> {
  const genAI = new GoogleGenerativeAI(API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    tools: [{ googleSearch: {} } as any],
  });

  const prompt = `Buscá en la web: "${query}".

Devolvé SOLO un JSON array con los eventos que encontrés. Sin texto adicional, sin markdown, solo el array JSON.

Formato exacto de cada evento:
{
  "title": "nombre del evento",
  "event_date": "YYYY-MM-DD" o "YYYY-MM-DDTHH:MM:00" (null si no encontrás fecha),
  "venue_name": "nombre del lugar" (null si no encontrás),
  "category": "Concierto" o "Teatro" o "Deporte" o "Arte" o "Entretenimiento" o "Otro",
  "description": "descripción breve en español, máximo 2 oraciones",
  "source_url": "URL exacta donde encontraste el evento"
}

Reglas:
- Solo eventos en Asunción o Gran Asunción, Paraguay
- Solo eventos con fecha futura (ignorá eventos pasados)
- No repetir el mismo evento
- Mínimo 3 eventos, máximo 15 por búsqueda`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const clean = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn(`  [gemini] No se pudo parsear JSON de: "${query}"`);
    return [];
  }
}

export async function scrapeGeminiEvents(): Promise<ScrapedEvent[]> {
  if (!API_KEY) {
    console.warn("[gemini] GEMINI_API_KEY no configurada, saltando...");
    return [];
  }

  console.log("\n🤖 [gemini] Iniciando búsqueda de eventos...");
  const start = Date.now();

  const seen = new Set<string>();
  const events: ScrapedEvent[] = [];

  for (const query of SEARCHES) {
    console.log(`  🔍 "${query}"`);
    try {
      const found = await searchEvents(query);
      console.log(`     → ${found.length} eventos`);

      for (const e of found) {
        if (!e.title || e.title.length < 3) continue;
        const key = e.title.toLowerCase().trim();
        if (seen.has(key)) continue;
        seen.add(key);

        events.push({
          source: "gemini",
          external_id: slugify(e.title, e.event_date),
          title: e.title,
          event_date: e.event_date ?? undefined,
          venue_name: e.venue_name ?? undefined,
          city: "Asunción",
          category: detectCategory(e.title),
          currency: "PYG",
          source_url: e.source_url ?? undefined,
        });
      }

      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.warn(`  ⚠️  ${(err as Error).message}`);
    }
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[gemini] ✅ ${events.length} eventos únicos en ${duration}s`);
  return events;
}

const isMain = process.argv[1]?.includes("scrape-gemini-events");
if (isMain) {
  import("../lib/scrapers/upsert-events").then(({ upsertEventsNoImages }) => {
    scrapeGeminiEvents()
      .then((events) => upsertEventsNoImages(events))
      .then((r) => console.log(`\n📊 ${r.events_inserted} insertados en ${r.duration_ms}ms`))
      .catch(console.error);
  });
}
