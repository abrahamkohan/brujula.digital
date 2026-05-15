// ============================================================
// Radar de Eventos Paraguay — Upsert de eventos + imágenes
// ============================================================

import { supabaseAdmin, STORAGE_BUCKET, getPublicImageUrl } from "./supabase";
import { findVenue } from "./venues";
import { computeImpact } from "./types";
import type { ScrapedEvent, ScrapeResult } from "./types";

/**
 * Descarga una imagen de una URL y la sube a Supabase Storage.
 * Devuelve la URL pública o null si falla.
 */
async function downloadAndStoreImage(
  source: string,
  externalId: string,
  imageUrl: string
): Promise<string | null> {
  if (!imageUrl) return null;

  try {
    // 1) Descargar la imagen
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      console.warn(
        `  ⚠️ No se pudo descargar imagen: ${imageUrl} (${response.status})`
      );
      return null;
    }

    const blob = await response.blob();
    const ext = imageUrl.split(".").pop()?.split("?")[0] ?? "jpg";
    const fileName = `${source}/${externalId}.${ext}`;

    // 2) Subir a Supabase Storage
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, blob, {
        contentType: blob.type || `image/${ext === "jpg" ? "jpeg" : ext}`,
        upsert: true,
      });

    if (error) {
      console.warn(`  ⚠️ Error al subir imagen a Storage: ${error.message}`);
      return null;
    }

    const publicUrl = getPublicImageUrl(fileName);
    console.log(`  ✅ Imagen subida: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.warn(`  ⚠️ Error procesando imagen: ${(err as Error).message}`);
    return null;
  }
}

/**
 * Convierte un ScrapedEvent al formato de la tabla `eventos`.
 * Resuelve venue → coordenadas, computa impacto, normaliza categoría.
 */
function toRow(event: ScrapedEvent) {
  const venueMatch = findVenue(event.venue_name);

  // Computar impacto basado en capacidad o precio
  const impacto = computeImpact(event.capacity_estimate);

  return {
    fuente: event.source,
    external_id: event.external_id,
    titulo: event.title,
    categoria: event.category.toLowerCase(), // la página espera minúscula: "concierto", "deporte"
    fecha: event.event_date?.split("T")[0] ?? null,
    event_date_end: event.event_date_end ?? null,
    venue: event.venue_name,
    venue_address: event.venue_address ?? venueMatch?.address ?? null,
    venue_lat: event.venue_lat ?? venueMatch?.lat ?? null,
    venue_lng: event.venue_lng ?? venueMatch?.lng ?? null,
    city: event.city ?? venueMatch?.city ?? "Asunción",
    precio_min: event.price_min ?? null,
    precio_max: event.price_max ?? null,
    currency: event.currency ?? "PYG",
    capacidad: event.capacity_estimate ?? null,
    impacto,
    image_url: event.image_url ?? null, // si no se descarga, queda la URL original
    source_url: event.source_url,
    raw_html: event.raw_html ?? null,
    scraped_at: new Date().toISOString(),
  };
}

/**
 * Inserta o actualiza eventos en Supabase.
 * - Hace upsert por (fuente, external_id)
 * - Descarga y sube imágenes a Storage
 * - Registra el resultado en sync_logs
 */
export async function upsertEvents(
  events: ScrapedEvent[]
): Promise<ScrapeResult> {
  const start = Date.now();
  const source = events[0]?.source ?? "unknown";

  console.log(`\n📦 [${source}] Upsertando ${events.length} eventos...`);

  let inserted = 0;
  let updated = 0;

  for (const event of events) {
    const row = toRow(event);

    // Verificar si ya existe para saber si es insert o update
    const { data: existing } = await supabaseAdmin
      .from("eventos")
      .select("id, image_url")
      .eq("fuente", event.source)
      .eq("external_id", event.external_id)
      .maybeSingle();

    const isUpdate = !!existing;

    // Subir imagen si el evento tiene image_url y no tenemos una guardada
    if (event.image_url && (!existing?.image_url || isUpdate)) {
      const storedUrl = await downloadAndStoreImage(
        event.source,
        event.external_id,
        event.image_url
      );
      if (storedUrl) row.image_url = storedUrl;
    }

    // Upsert
    const { error } = await supabaseAdmin.from("eventos").upsert(row, {
      onConflict: "fuente, external_id",
      ignoreDuplicates: false,
    });

    if (error) {
      console.error(`  ❌ Error upsertando "${event.title}": ${error.message}`);
      continue;
    }

    if (isUpdate) {
      updated++;
    } else {
      inserted++;
    }
  }

  const duration_ms = Date.now() - start;

  console.log(
    `  ✅ ${source}: ${inserted} insertados, ${updated} actualizados (${duration_ms}ms)`
  );

  // Registrar en sync_logs (tabla existente)
  await supabaseAdmin.from("sync_logs").insert({
    fuente: source,
    registros_nuevos: inserted,
    registros_totales: events.length,
    duracion_ms: duration_ms,
    estado: "ok",
  });

  return {
    source,
    status: "success",
    events_found: events.length,
    events_inserted: inserted,
    events_updated: updated,
    duration_ms,
  };
}

/**
 * Versión de upsert que NO sube imágenes (más rápida para pruebas).
 */
export async function upsertEventsNoImages(
  events: ScrapedEvent[]
): Promise<ScrapeResult> {
  const start = Date.now();
  const source = events[0]?.source ?? "unknown";

  const rows = events.map(toRow);

  const { error } = await supabaseAdmin.from("eventos").upsert(rows, {
    onConflict: "fuente, external_id",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error(`  ❌ Error en upsert batch: ${error.message}`);
    return {
      source,
      status: "error",
      events_found: events.length,
      events_inserted: 0,
      events_updated: 0,
      error_message: error.message,
      duration_ms: Date.now() - start,
    };
  }

  const duration_ms = Date.now() - start;
  const inserted = rows.length;

  console.log(
    `  ✅ ${source}: ${inserted} upsertados (sin imágenes) (${duration_ms}ms)`
  );

  await supabaseAdmin.from("sync_logs").insert({
    fuente: source,
    registros_nuevos: inserted,
    registros_totales: events.length,
    duracion_ms: duration_ms,
    estado: "ok",
  });

  return {
    source,
    status: "success",
    events_found: events.length,
    events_inserted: inserted,
    events_updated: 0,
    duration_ms,
  };
}
