// ============================================================
// Brújula Digital — Desactivar lugares fuera del radio
// Gran Asunción (Asunción + ciudades cercanas)
// ============================================================
// Útil para mantener el directorio enfocado en el área
// metropolitana donde opera el negocio inmobiliario.
//
// Uso: npx tsx src/scripts/deactivate-out-of-range.ts
// ============================================================

import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ZONAS_FUERA = ["ciudad-del-este", "encarnacion", "pedro-juan", "concepcion", "otras"];

async function main() {
  console.log("\n📍 Desactivando lugares fuera del radio Gran Asunción...\n");

  for (const tipo of ["shopping", "gastronomia", "bar", "hotel"]) {
    const { data: registros, error } = await supabase
      .from("directorios")
      .select("id, name, zone, tipo")
      .in("zone", ZONAS_FUERA)
      .eq("tipo", tipo)
      .eq("active", true);

    if (error) {
      console.error(`  ❌ Error consultando ${tipo}: ${error.message}`);
      continue;
    }

    if (!registros || registros.length === 0) {
      console.log(`   ${tipo}: 0 registros fuera de rango`);
      continue;
    }

    console.log(`   ${tipo}: ${registros.length} fuera de rango:`);
    for (const r of registros) {
      console.log(`     · ${r.name} (${r.zone})`);
    }

    const ids = registros.map((r) => r.id);
    const { error: updError, count } = await supabase
      .from("directorios")
      .update({ active: false, updated_at: new Date().toISOString() })
      .in("id", ids);

    if (updError) {
      console.error(`     ❌ Error actualizando: ${updError.message}`);
    } else {
      console.log(`     ✅ Desactivados ${registros.length} registros`);
    }
    console.log();
  }

  // Verificar final
  const { data: check } = await supabase
    .from("directorios")
    .select("tipo, zone")
    .in("zone", ZONAS_FUERA)
    .eq("active", true);

  const restantes = check ?? [];
  if (restantes.length === 0) {
    console.log("✅ No quedan lugares activos fuera del radio Gran Asunción.");
  } else {
    console.log(`⚠️ Quedan ${restantes.length} activos fuera de rango:`);
    for (const r of restantes) {
      console.log(`   · ${r.tipo} (${r.zone})`);
    }
  }
}

main().catch(console.error);
