// ============================================================
// Brújula Digital — Limpiar fechas incorrectas en eventos
// ============================================================
// Los scrapers usaban new Date() como fallback, insertando
// eventos con fecha = fecha de creación. Corrección: setear
// fecha a NULL así el scraper correcto las reemplaza después.
//
// Uso: npx tsx src/scripts/clear-bad-dates.ts
// ============================================================

import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
  console.log("\n🔍 Buscando eventos con fecha = fecha de creación...\n");

  const { data: eventos } = await supabase
    .from("eventos")
    .select("id, titulo, fecha, created_at, fuente")
    .not("fecha", "is", null);

  if (!eventos) {
    console.log("No se pudieron cargar eventos");
    return;
  }

  const sospechosos = eventos.filter((e) => {
    if (!e.fecha || !e.created_at) return false;
    const fecha = e.fecha.slice(0, 10);
    const creado = e.created_at.slice(0, 10);
    return fecha === creado;
  });

  console.log(`   Total eventos: ${eventos.length}`);
  console.log(`   Con fecha = creación: ${sospechosos.length}\n`);

  if (sospechosos.length === 0) {
    console.log("   ✅ No hay fechas incorrectas.");
    return;
  }

  for (const e of sospechosos) {
    console.log(`   🗑️  ${e.titulo} (${e.fuente}) — ${e.fecha}`);
  }

  console.log(`\n   Limpiando ${sospechosos.length} eventos...`);

  // Usar service role key para bypass RLS
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const ids = sospechosos.map((e) => e.id);
  const { error, count } = await admin
    .from("eventos")
    .update({ fecha: null })
    .in("id", ids);

  if (error) {
    console.error(`   ❌ Error: ${error.message}`);
  } else {
    console.log(`   ✅ ${sospechosos.length} eventos corregidos (fecha → null)`);
  }
}

main().catch(console.error);
