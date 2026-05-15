import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getGenAI() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function buildPrompt(
  today: string,
  handle: string,
  venueHint: string,
  categoriaHint: string,
  caption: string,
  postUrl: string,
  imageUrl: string
): string {
  return `Sos un extractor de datos de eventos para Brújula Digital, una guía de Asunción, Paraguay.
Analizá este post de Instagram y determiná si anuncia un evento concreto.
Respondé ÚNICAMENTE con JSON válido, sin markdown, sin explicaciones.

Si NO es un evento concreto (lifestyle, promo genérica, publicidad): { "es_evento": false }

Si SÍ es un evento:
{
  "es_evento": true,
  "titulo": "nombre del evento",
  "categoria": "concierto|deporte|teatro|feria|entretenimiento|congreso|cine|otro",
  "fecha": "YYYY-MM-DD",
  "event_date_end": "YYYY-MM-DD o null",
  "venue": "nombre del lugar",
  "venue_address": "dirección o null",
  "precio_min": número entero en PYG o null,
  "precio_max": número entero en PYG o null,
  "impacto": "alto|medio|bajo",
  "source_url": "${postUrl}",
  "image_url": "${imageUrl}"
}

Reglas:
- Hoy es ${today}. Si la fecha se infiere (ej: "este sábado"), calculá desde hoy.
- impacto alto = evento masivo (recital conocido, clásico de fútbol, festival). medio = regular. bajo = íntimo.
- Si hay precio en USD, convertí a PYG usando 1 USD = 7800 PYG.
- Categoría sugerida para esta cuenta: ${categoriaHint}
- Venue hint: si no se menciona venue, usá "${venueHint}".
- Si el evento es fuera de Asunción, igualmente extraelo.

Post de @${handle}:
${caption}`;
}

async function procesarConGemini(
  post: { caption?: string; url?: string; displayUrl?: string; id: string },
  handle: string,
  venueHint: string,
  categoriaHint: string
) {
  const model = getGenAI().getGenerativeModel({ model: "gemini-2.5-flash" });
  const today = new Date().toISOString().split("T")[0];

  const prompt = buildPrompt(
    today,
    handle,
    venueHint,
    categoriaHint,
    post.caption ?? "(sin texto)",
    post.url ?? "",
    post.displayUrl ?? ""
  );

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/```json|```/g, "");
    return JSON.parse(text);
  } catch {
    return { es_evento: false };
  }
}

export async function GET() {
  // Marcar como failed los runs pendientes con más de 2 horas
  await supabase
    .from("ig_scraper_runs")
    .update({ status: "failed" })
    .eq("status", "pending")
    .lt(
      "triggered_at",
      new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    );

  // Buscar runs pendientes
  const { data: runs } = await supabase
    .from("ig_scraper_runs")
    .select("*")
    .eq("status", "pending");

  if (!runs?.length) {
    return Response.json({ ok: true, message: "No hay runs pendientes" });
  }

  let eventosInsertados = 0;

  for (const run of runs) {
    // Verificar si el run de Apify terminó
    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${run.run_id}?token=${process.env.APIFY_TOKEN}`
    );
    const statusData = await statusRes.json();

    if (statusData.data?.status !== "SUCCEEDED") continue;

    // Fetch resultados del dataset
    const itemsRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${run.run_id}/dataset/items?token=${process.env.APIFY_TOKEN}`
    );
    const posts = await itemsRes.json();

    if (!Array.isArray(posts)) continue;

    for (const post of posts) {
      const resultado = await procesarConGemini(
        post,
        run.handle,
        run.venue_hint,
        run.categoria_hint ?? "entretenimiento"
      );

      if (resultado.es_evento) {
        await getSupabase().from("eventos").upsert(
          {
            fuente: `instagram_${run.handle}`,
            external_id: post.id,
            titulo: resultado.titulo,
            categoria: resultado.categoria,
            fecha: resultado.fecha,
            event_date_end: resultado.event_date_end ?? null,
            venue: resultado.venue,
            venue_address: resultado.venue_address ?? null,
            precio_min: resultado.precio_min ?? null,
            precio_max: resultado.precio_max ?? null,
            impacto: resultado.impacto,
            source_url: resultado.source_url,
            image_url: resultado.image_url,
            city: "Asunción",
            currency: "PYG",
            scraped_at: new Date().toISOString(),
          },
          { onConflict: "fuente,external_id", ignoreDuplicates: true }
        );
        eventosInsertados++;
      }

      await delay(600);
    }

    await supabase
      .from("ig_scraper_runs")
      .update({ status: "done", processed_at: new Date().toISOString() })
      .eq("run_id", run.run_id);
  }

  return Response.json({ ok: true, eventos_insertados: eventosInsertados });
}
