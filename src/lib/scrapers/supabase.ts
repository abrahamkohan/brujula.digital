// ============================================================
// Radar de Eventos Paraguay — Cliente Supabase para scrapers
// ============================================================
// Usa service_role key para bypass de RLS (solo scripts locales).
// ============================================================

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Falta NEXT_PUBLIC_SUPABASE_URL en el entorno. " +
      "Creá un archivo .env.local con:\n" +
      "NEXT_PUBLIC_SUPABASE_URL=https://loxqrmihxdqecrvnzcqb.supabase.co\n" +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...\n" +
      "SUPABASE_SERVICE_ROLE_KEY=eyJ..."
  );
}

if (!serviceKey) {
  throw new Error(
    "Falta SUPABASE_SERVICE_ROLE_KEY en el entorno. " +
      "Obtenela de: https://supabase.com/dashboard/project/loxqrmihxdqecrvnzcqb/settings/api\n" +
      "y agregala a .env.local"
  );
}

/** Cliente con service_role — bypasea RLS, solo para scripts/scrapers locales */
export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Nombre del bucket de Storage para imágenes de eventos.
 * Crearlo en: https://supabase.com/dashboard/project/loxqrmihxdqecrvnzcqb/storage/buckets
 *   - Name: event-images
 *   - Public: SÍ
 */
export const STORAGE_BUCKET = "event-images";

/** URL base pública del storage */
export function getPublicImageUrl(path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}
