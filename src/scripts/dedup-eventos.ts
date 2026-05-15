// ============================================================
// Brújula Digital — Deduplicación de eventos
// ============================================================
// Busca eventos con mismo título y fecha (case insensitive)
// de distintas fuentes, conserva el que tiene imagen o el
// más reciente, y elimina duplicados.
//
// Uso directo: npx tsx src/scripts/dedup-eventos.ts
// Integrado en: scrape-all.ts (post-scraping)
// ============================================================

import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Evento {
  id: string;
  titulo: string;
  fecha: string;
  image_url: string | null;
  created_at: string;
}

export async function dedupEventos(silent = false) {
  if (!silent) console.log("\n🔍 Buscando eventos duplicados...\n");

  const { data: eventos, error } = await supabase
    .from("eventos")
    .select("id, titulo, fecha, image_url, created_at")
    .order("fecha");

  if (error) {
    if (!silent) console.error("❌ Error al consultar eventos:", error.message);
    return;
  }

  const grupos = new Map<string, Evento[]>();
  for (const e of eventos ?? []) {
    const key = `${e.titulo.toLowerCase().trim()}||${e.fecha}`;
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key)!.push(e);
  }

  const duplicados = Array.from(grupos.entries()).filter(([, items]) => items.length > 1);

  if (!silent) {
    console.log(`   Total eventos: ${eventos?.length ?? 0}`);
    console.log(`   Grupos con duplicados: ${duplicados.length}\n`);
  }

  if (duplicados.length === 0) {
    if (!silent) console.log("   ✅ No hay eventos duplicados.");
    return;
  }

  let eliminados = 0;

  for (const [key, items] of duplicados) {
    const [tituloRaw, fecha] = key.split("||");

    if (!silent) {
      console.log(`   📌 "${tituloRaw}" (${fecha}) — ${items.length} registros`);
      for (const e of items) {
        console.log(`      ${e.id.slice(0, 8)}... | img: ${e.image_url ? "✅" : "❌"} | creado: ${e.created_at?.slice(0, 10) ?? "?"}`);
      }
    }

    const conImg = items.filter((e) => e.image_url);
    const conservar = conImg.length > 0
      ? conImg.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))[0]
      : items.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))[0];

    const eliminar = items.filter((e) => e.id !== conservar.id);

    if (eliminar.length > 0) {
      const ids = eliminar.map((e) => e.id);
      const { error: delError } = await supabase.from("eventos").delete().in("id", ids);

      if (delError) {
        if (!silent) console.log(`      ❌ Error al eliminar: ${delError.message}\n`);
      } else {
        if (!silent) console.log(`      ✅ Conservado: ${conservar.id.slice(0, 8)}... | Eliminados: ${eliminar.length}\n`);
        eliminados += eliminar.length;
      }
    }
  }

  if (!silent) {
    console.log(`\n📊 Resumen:`);
    console.log(`   Duplicados encontrados: ${duplicados.length} grupos`);
    console.log(`   Eliminados:             ${eliminados}`);
  }

  return { grupos: duplicados.length, eliminados };
}

// ─── Ejecución directa ─────────────────────────────────────────

const isMain = process.argv[1]?.includes("dedup-eventos");
if (isMain) {
  dedupEventos()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
