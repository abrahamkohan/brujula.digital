// ============================================================
// Brújula Digital — Scraper de hoteles desde Google Hotels API
// ============================================================
// Usa Serpapi Google Hotels API para obtener datos
// estructurados de hoteles en Asunción con direcciones reales.
//
// Uso: npx tsx src/scripts/scrape-google-hoteles.ts
// ============================================================

import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SERPAPI_KEY = process.env.SERPAPI_API_KEY;

const SKIP_KEYWORDS = ["hostel", "apart", "suite", "alquiler", "cápsula", "capsule", "bnb", "airbnb"];

function isHotel(name: string): boolean {
  const n = name.toLowerCase();
  return !SKIP_KEYWORDS.some((k) => n.includes(k));
}

function inferZone(_address: string): string {
  // Google Hotels no devuelve direcciones estructuradas
  // Las zonas se corrigen desde admin
  return "centro";
}

async function main() {
  console.log("\n🏨 Scrapeando hoteles desde Google Hotels API...\n");

  if (!SERPAPI_KEY) {
    console.log("   ❌ SERPAPI_API_KEY no configurada");
    return;
  }

  // 1. Llamada única a Google Hotels
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);

  const params = new URLSearchParams({
    engine: "google_hotels",
    q: "hoteles Asunción Paraguay",
    hl: "es",
    gl: "py",
    check_in_date: tomorrow,
    check_out_date: dayAfter,
    api_key: SERPAPI_KEY,
  });

  console.log("   Consultando Google Hotels API...");

  const res = await fetch(`https://serpapi.com/search.json?${params}`, {
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    console.log(`   ❌ Error Serpapi: ${res.status}`);
    const text = await res.text();
    console.log(`   ${text.slice(0, 200)}`);
    return;
  }

  const data = await res.json();
  const properties = data.properties ?? [];
  console.log(`   ${properties.length} propiedades encontradas\n`);

  if (properties.length === 0) {
    console.log("   ⚠️ No se encontraron propiedades. Posible error de API.");
    console.log(`   Respuesta: ${JSON.stringify(data).slice(0, 300)}`);
    return;
  }

  // 2. Obtener existentes para comparar
  const { data: existentes } = await supabase
    .from("directorios")
    .select("name")
    .eq("tipo", "hotel");

  const namesExisting = new Set((existentes ?? []).map((h) => h.name.toLowerCase().trim()));

  let insertados = 0;
  let existian = 0;
  let ignorados = 0;

  for (let i = 0; i < properties.length; i++) {
    const p = properties[i];
    const name = (p.name ?? "").trim();
    const address = (p.address ?? "").trim();

    if (!name) {
      ignorados++;
      continue;
    }

    if (!isHotel(name)) {
      ignorados++;
      continue;
    }

    if (namesExisting.has(name.toLowerCase())) {
      existian++;
      continue;
    }

    const zone = inferZone(address);
    const image = p.images?.[0]?.thumbnail ?? "";
    const rating = p.overall_rating ? Math.round(p.overall_rating) : null;
    const link = p.link ?? "";
    const descripcion =
      p.description ?? `Hotel en ${zone.replace("-", " ")}. ${address}`;

    const { error } = await supabase.from("directorios").insert({
      tipo: "hotel",
      name,
      descripcion,
      zone,
      image,
      url: link,
      tipo_lugar: "Hotel",
      stars: rating,
      active: true,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.log(`   ❌ ${name}: ${error.message}`);
    } else {
      console.log(`   ✅ ${name} → ${zone}${rating ? ` (${"★".repeat(rating)})` : ""}`);
      insertados++;
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   ✅ Insertados: ${insertados}`);
  console.log(`   ⏭️ Ya existían: ${existian}`);
  console.log(`   ⏭️ Ignorados:   ${ignorados}`);
}

main().catch(console.error);
