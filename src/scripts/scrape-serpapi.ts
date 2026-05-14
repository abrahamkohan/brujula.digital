// ============================================================
// Radar de Eventos Paraguay — Scraper SerpAPI Google Events
// ============================================================
// Usa Google Events API via SerpAPI para obtener eventos
// de Paraguay con datos limpios (imagen, venue, fecha).
//
// Uso: npx tsx src/scripts/scrape-serpapi.ts
// API key: https://serpapi.com/manage-api-key
// ============================================================

import { supabaseAdmin } from "../lib/scrapers/supabase";
import { detectCategory } from "../lib/scrapers/types";
import { getZonaFromVenue } from "../lib/directorios/zonas";

const SERPAPI_KEY = process.env.SERPAPI_API_KEY;

interface SerpapiEvent {
  title: string;
  date: { start_date: string; when: string };
  address: string[];
  link: string;
  venue?: { name: string; rating?: number; reviews?: number };
  thumbnail?: string;
  description?: string;
  ticket_info?: Array<{ source: string; link: string; link_type: string }>;
}

interface SerpapiResponse {
  events_results: SerpapiEvent[];
  search_metadata: { status: string; id: string };
  error?: string;
}

// ─── Queries ──────────────────────────────────────────────────

const QUERIES = [
  { q: "eventos Asuncion Paraguay", gl: "py", hl: "es" },
  { q: "recitales Asuncion Paraguay", gl: "py", hl: "es" },
  { q: "conciertos Paraguay 2026", gl: "py", hl: "es" },
];

// ─── Parsear fecha ────────────────────────────────────────────

const MONTHS: Record<string, number> = {
  jan: 0, ene: 0, enero: 0,
  feb: 1, febrero: 1,
  mar: 2, marzo: 2,
  apr: 3, abr: 3, abril: 3,
  may: 4, mayo: 4,
  jun: 5, junio: 5,
  jul: 6, julio: 6,
  aug: 7, ago: 7, agosto: 7,
  sep: 8, set: 8, septiembre: 8,
  oct: 9, octubre: 9,
  nov: 10, noviembre: 10,
  dec: 11, dic: 11, diciembre: 11,
};

function parseSerpDate(startDate: string): string | null {
  if (!startDate) return null;
  // Formatos posibles: "Dec 7", "May 15", "Oct 7"
  const m = startDate.match(/^([a-z]{3,9})\s+(\d{1,2})$/i);
  if (m) {
    const month = MONTHS[m[1].toLowerCase()];
    if (month === undefined) return null;
    const day = parseInt(m[2]);
    let year = new Date().getFullYear();
    const date = new Date(year, month, day);
    // Si ya pasó y es para este año, asumir año siguiente
    if (date.getTime() < Date.now()) {
      date.setFullYear(year + 1);
    }
    return date.toISOString().split("T")[0];
  }
  return null;
}

// ─── Categorizar ──────────────────────────────────────────────

function categorize(title: string, venue?: { name?: string; rating?: number }): string {
  const t = title.toLowerCase();
  // Deporte
  if (/\bvs\b/i.test(t) || /olimpia|cerro|libertad|nacional|apertura|clausura|sudamericana|libertadores/i.test(t)) return "deporte";
  // Feria
  if (/expo|feria/i.test(t)) return "feria";
  // Teatro
  if (/teatro|obra|silfide|trovador|unipersonal|stand.up|comedy/i.test(t)) return "teatro";
  // Por defecto
  return "concierto";
}

// ─── Scraper ──────────────────────────────────────────────────

export async function scrapeSerpapi(): Promise<number> {
  if (!SERPAPI_KEY) {
    console.log("\n🔍 [serpapi] No hay SERPAPI_API_KEY en el entorno. Configurala en .env.local");
    console.log("   Obtener key: https://serpapi.com/manage-api-key");
    return 0;
  }

  console.log("\n🔍 [serpapi] Iniciando scraper...");
  const start = Date.now();
  let totalInserted = 0;
  let totalFound = 0;

  for (const query of QUERIES) {
    console.log(`\n  Buscando: "${query.q}"...`);
    try {
      const params = new URLSearchParams({
        engine: "google_events",
        q: query.q,
        gl: query.gl,
        hl: query.hl,
        api_key: SERPAPI_KEY,
      });

      const res = await fetch(`https://serpapi.com/search?${params}`, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        console.warn(`  ⚠️ HTTP ${res.status}: ${res.statusText}`);
        continue;
      }

      const data: SerpapiResponse = await res.json();

      if (data.error) {
        console.warn(`  ⚠️ SerpAPI error: ${data.error}`);
        continue;
      }

      const events = data.events_results ?? [];
      console.log(`  → ${events.length} eventos encontrados`);

      for (const ev of events) {
        totalFound++;

        // Generar external_id único
        const fecha = parseSerpDate(ev.date?.start_date);
        const extId = `${query.gl}-${query.hl}-${ev.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80)}`;

        // Categorizar
        const categoria = categorize(ev.title, ev.venue);

        // Nombre del venue
        const venueName = ev.venue?.name ?? ev.address?.[0] ?? "";

        // Zona
        const zona = getZonaFromVenue(venueName) ?? "";

        // Elegir el mejor link: ticket_info > main link, filtrar Spotify
        const badDomains = ["spotify.com", "open.spotify.com"];
        let sourceUrl = ev.link;

        // Preferir ticket_info si existe
        if (ev.ticket_info && ev.ticket_info.length > 0) {
          const ticketLink = ev.ticket_info.find((t) =>
            !badDomains.some((d) => t.link.includes(d))
          );
          if (ticketLink) sourceUrl = ticketLink.link;
        }

        // Si el link principal es malo y no hay ticket_info, skip
        if (badDomains.some((d) => sourceUrl?.includes(d))) {
          continue;
        }

        // Dedup: verificar si ya existe mismo título + fecha
        const { data: existing } = await supabaseAdmin
          .from("eventos")
          .select("id")
          .eq("titulo", ev.title.slice(0, 200))
          .eq("fecha", fecha)
          .maybeSingle();

        if (existing) {
          continue; // ya existe, skip
        }

        // Insertar
        const { error } = await supabaseAdmin.from("eventos").insert({
          fuente: "serpapi",
          external_id: extId,
          titulo: ev.title.slice(0, 300),
          categoria,
          fecha,
          venue: venueName,
          image_url: ev.thumbnail ?? null,
          source_url: ev.link,
          impacto: "bajo",
          city: "Asunción",
          currency: "PYG",
          raw_html: ev.description ?? null,
          scraped_at: new Date().toISOString(),
        });

        if (error) {
          // Si el error es por unique constraint, skip
          if (error.message?.includes("unique")) continue;
          console.warn(`  ⚠️ Error insertando "${ev.title}": ${error.message}`);
        } else {
          totalInserted++;
        }
      }
    } catch (err) {
      console.warn(`  ⚠️ Error en query "${query.q}": ${(err as Error).message}`);
    }

    // Pequeña pausa entre queries
    await new Promise((r) => setTimeout(r, 1000));
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n[serpapi] ✅ ${totalInserted} insertados de ${totalFound} encontrados en ${duration}s`);

  // Log en sync_logs
  await supabaseAdmin.from("sync_logs").insert({
    fuente: "serpapi",
    registros_nuevos: totalInserted,
    registros_totales: totalFound,
    duracion_ms: Date.now() - start,
    estado: "ok",
  });

  return totalInserted;
}

// ─── Ejecución directa ─────────────────────────────────────────

const isMain = process.argv[1]?.includes("scrape-serpapi");
if (isMain) {
  scrapeSerpapi()
    .then((n) => console.log(`\n📊 Total: ${n} eventos nuevos`))
    .catch(console.error);
}
