// ============================================================
// Brújula Digital — Fix imágenes de directorios vía Serpapi
// ============================================================
// Busca imágenes reales para registros sin foto o con fotos
// genéricas (Unsplash). Usa Google Images via Serpapi.
//
// Requiere: SERPAPI_API_KEY en .env.local
// Uso: npx tsx src/scripts/fix-directorio-images.ts
// ============================================================

import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SERPAPI_KEY = process.env.SERPAPI_API_KEY;

interface DirectorioRow {
  id: string;
  name: string;
  tipo: string;
  image: string | null;
}

// ─── Serpapi Google Images search ──────────────────────────────

async function searchImage(query: string): Promise<string | null> {
  if (!SERPAPI_KEY) return null;

  const url = "https://serpapi.com/search";
  const params = new URLSearchParams({
    q: `${query} Paraguay`,
    tbm: "isch",
    api_key: SERPAPI_KEY,
    tbs: "isz:l", // imágenes grandes
    ijn: "0",
  });

  try {
    const res = await fetch(`${url}?${params}`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;

    const data = await res.json();
    const results = data.images_results ?? [];

    for (const img of results) {
      const src = img.original || img.thumbnail;
      if (!src) continue;
      if (src.includes("unsplash.com")) continue;

      const ext = src.split("?").pop()?.split(".").pop()?.toLowerCase();
      if (ext && !["jpg", "jpeg", "webp", "png"].includes(ext)) continue;

      return src;
    }

    return null;
  } catch {
    return null;
  }
}

// ─── Main ──────────────────────────────────────────────────────

async function main() {
  if (!SERPAPI_KEY) {
    console.warn("\n⚠️  SERPAPI_API_KEY no configurada en .env.local");
    console.log("   El script funcionará pero encontrará 0 imágenes.\n");
  }

  console.log("\n🔍 Buscando directorios sin imagen real...\n");

  const { data: rows } = await supabase
    .from("directorios")
    .select("id, name, tipo, image")
    .or(`image.is.null,image.ilike.%unsplash%`);

  const registros = (rows ?? []) as DirectorioRow[];
  console.log(`   ${registros.length} registros sin imagen real\n`);

  if (registros.length === 0) {
    console.log("   ✅ No hay nada que arreglar");
    return;
  }

  let actualizados = 0;
  let noEncontrados = 0;
  let errores = 0;

  for (let i = 0; i < registros.length; i++) {
    const item = registros[i];
    process.stdout.write(`   [${i + 1}/${registros.length}] ${item.name}... `);

    // Construir query: "Tipo + Nombre + Paraguay"
    const tipoLabel = item.tipo.replace("-", " ");
    const query = `${item.name} ${tipoLabel} Paraguay`;

    let imageUrl: string | null = null;
    if (SERPAPI_KEY) {
      imageUrl = await searchImage(query);
    }

    if (imageUrl) {
      const { error } = await supabase
        .from("directorios")
        .update({ image: imageUrl, updated_at: new Date().toISOString() })
        .eq("id", item.id);

      if (error) {
        console.log(`❌ Error DB: ${error.message}`);
        errores++;
      } else {
        console.log(`✅ → imagen encontrada`);
        actualizados++;
      }
    } else {
      console.log(SERPAPI_KEY ? "❌ No encontrada" : "⏭️ Sin API key");
      noEncontrados++;
    }

    // Pequeña pausa entre requests para no rate-limit
    if (SERPAPI_KEY) await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   ✅ Actualizados: ${actualizados}`);
  console.log(`   ❌ Sin imagen:   ${noEncontrados}`);
  console.log(`   ⚠️ Errores:      ${errores}`);
}

main().catch(console.error);
