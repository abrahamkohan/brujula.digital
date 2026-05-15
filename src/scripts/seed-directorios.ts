// ============================================================
// Brújula Digital — Seed directorios desde archivos TS a Supabase
// ============================================================
// Migra los datos de los archivos estáticos de directorios a
// la tabla `directorios` en Supabase.
//
// Uso: npx tsx src/scripts/seed-directorios.ts
// ============================================================

import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";
import { SHOPPING } from "../lib/directorios/shopping";
import { GASTRONOMIA } from "../lib/directorios/gastronomia";
import { BARES } from "../lib/directorios/bares";
import { HOTELES } from "../lib/directorios/hoteles";
import { TEATROS } from "../lib/directorios/teatros";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SeedItem {
  tipo: string;
  name: string;
  descripcion: string;
  zone: string;
  image: string;
  url: string;
  tipo_lugar: string | null;
  horario: string | null;
  badge: string | null;
  stars: number | null;
  sort_order: number;
}

async function seed() {
  console.log("\n🌱 Seeding directorios...\n");

  const items: SeedItem[] = [
    ...SHOPPING.map((s) => ({
      tipo: "shopping" as const,
      name: s.name,
      descripcion: s.desc,
      zone: s.zone,
      image: s.image,
      url: s.url,
      tipo_lugar: s.tipo ?? null,
      horario: s.horario ?? null,
      badge: s.badge ?? null,
      stars: s.stars ?? null,
      sort_order: 0,
    })),
    ...GASTRONOMIA.map((g) => ({
      tipo: "gastronomia" as const,
      name: g.name,
      descripcion: g.desc,
      zone: g.zone,
      image: g.image,
      url: g.url,
      tipo_lugar: g.tipo ?? null,
      horario: g.horario ?? null,
      badge: g.badge ?? null,
      stars: g.stars ?? null,
      sort_order: 0,
    })),
    ...BARES.map((b) => ({
      tipo: "bar" as const,
      name: b.name,
      descripcion: b.desc,
      zone: b.zone,
      image: b.image,
      url: b.url,
      tipo_lugar: b.tipo ?? null,
      horario: b.horario ?? null,
      badge: b.badge ?? null,
      stars: b.stars ?? null,
      sort_order: 0,
    })),
    ...HOTELES.map((h) => ({
      tipo: "hotel" as const,
      name: h.name,
      descripcion: h.desc,
      zone: h.zone,
      image: h.image,
      url: h.url,
      tipo_lugar: h.tipo ?? null,
      horario: h.horario ?? null,
      badge: h.badge ?? null,
      stars: h.stars ?? null,
      sort_order: 0,
    })),
    ...TEATROS.map((t) => ({
      tipo: "teatro" as const,
      name: t.name,
      descripcion: t.desc,
      zone: t.zone,
      image: t.image,
      url: t.url,
      tipo_lugar: t.tipo ?? null,
      horario: t.horario ?? null,
      badge: t.badge ?? null,
      stars: t.stars ?? null,
      sort_order: 0,
    })),
  ];

  console.log(`Total a insertar: ${items.length}`);

  // Limpiar tabla y re-insertar
  const { error: delError } = await supabase.from("directorios").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delError) console.warn("  ⚠️ No se pudo limpiar:", delError.message);

  // Batch insert en grupos de 50
  const batchSize = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const { error } = await supabase
      .from("directorios")
      .insert(
        batch.map((item) => ({
          ...item,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
      );

    if (error) {
      console.error(`  ❌ Error en batch ${i / batchSize + 1}:`, error.message);
      errors++;
    } else {
      inserted += batch.length;
      process.stdout.write(`  ✅ ${inserted}/${items.length}\r`);
    }
  }

  // Verificar
  const { count: total, error: countError } = await supabase
    .from("directorios")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("\n  ❌ Error al verificar:", countError.message);
  } else {
    console.log(`\n\n📊 Total en base: ${total}`);
    console.log(`   Insertados: ${inserted}`);
    console.log(`   Errores: ${errors}`);
  }

  // Resumen por tipo
  const { data: byTipo } = await supabase
    .from("directorios")
    .select("tipo")
    .order("tipo");

  if (byTipo) {
    const counts: Record<string, number> = {};
    byTipo.forEach((d) => {
      counts[d.tipo] = (counts[d.tipo] || 0) + 1;
    });
    console.log("\n📋 Por tipo:");
    Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([tipo, count]) => console.log(`   · ${tipo}: ${count}`));
  }
}

seed().catch(console.error);
