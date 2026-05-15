// ============================================================
// Brújula Digital — Auditoría de links rotos
// ============================================================
// Solo lectura. Recolecta todas las URLs de directorios y
// eventos, chequea cada una con HEAD request, y reporta.
//
// Uso: npx tsx src/scripts/audit-links.ts
// ============================================================

import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Tipos ─────────────────────────────────────────────────────

interface LinkEntry {
  tipo: string;
  name: string;
  url: string;
}

type StatusTag = "✅ OK" | "⚠️ Redirect" | "❌ Roto" | "⏱️ Timeout" | "💥 Error";

interface CheckResult {
  entry: LinkEntry;
  status: number | null;
  tag: StatusTag;
}

// ─── Check individual ──────────────────────────────────────────

async function checkUrl(url: string): Promise<{ status: number | null; tag: StatusTag }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "manual",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BrujulaBot/1.0)" },
    });

    clearTimeout(timer);

    if (res.status >= 200 && res.status < 300) return { status: res.status, tag: "✅ OK" };
    if (res.status >= 300 && res.status < 400) return { status: res.status, tag: "⚠️ Redirect" };
    return { status: res.status, tag: "❌ Roto" };
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes("abort") || msg.includes("timeout")) {
      return { status: null, tag: "⏱️ Timeout" };
    }
    return { status: null, tag: "💥 Error" };
  }
}

// ─── Main ──────────────────────────────────────────────────────

async function main() {
  console.log("\n🔗 Auditoría de links — Brújula Digital\n");

  // 1. Recolectar URLs
  const [dirRes, evtRes] = await Promise.all([
    supabase.from("directorios").select("tipo, name, url, website").eq("active", true),
    supabase.from("eventos").select("titulo, source_url, categoria").gte("fecha", new Date().toISOString().split("T")[0]),
  ]);

  const entries: LinkEntry[] = [];

  // Directorios: url + website
  for (const d of dirRes.data ?? []) {
    if (d.url && d.url.trim()) entries.push({ tipo: `📌 ${d.tipo}`, name: d.name, url: d.url.trim() });
    if (d.website && d.website.trim()) entries.push({ tipo: `🌐 ${d.tipo}`, name: d.name, url: d.website.trim() });
  }

  // Eventos: source_url
  for (const e of evtRes.data ?? []) {
    if (e.source_url && e.source_url.trim()) {
      entries.push({ tipo: "🎪 evento", name: e.titulo, url: e.source_url.trim() });
    }
  }

  console.log(`   Total URLs a verificar: ${entries.length}\n`);

  if (entries.length === 0) {
    console.log("   No hay URLs para auditar.");
    return;
  }

  // 2. Checkear cada una
  const results: CheckResult[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    process.stdout.write(`   [${i + 1}/${entries.length}] ${entry.name}... `);

    const { status, tag } = await checkUrl(entry.url);
    results.push({ entry, status, tag });
    console.log(`${tag}${status ? ` (${status})` : ""}`);
  }

  // 3. Resumen
  const counts = { ok: 0, redirect: 0, roto: 0, timeout: 0, error: 0 };
  for (const r of results) {
    if (r.tag === "✅ OK") counts.ok++;
    else if (r.tag === "⚠️ Redirect") counts.redirect++;
    else if (r.tag === "❌ Roto") counts.roto++;
    else if (r.tag === "⏱️ Timeout") counts.timeout++;
    else if (r.tag === "💥 Error") counts.error++;
  }

  console.log(`\n📊 Resumen`);
  const bar = "─".repeat(40);
  console.log(`   ┌${bar}┬────────┐`);
  console.log(`   │ ${"Estado".padEnd(38)} │ Cantidad │`);
  console.log(`   ├${bar}┼────────┤`);
  console.log(`   │ ✅ OK            │ ${counts.ok.toString().padStart(6)}  │`);
  if (counts.redirect) console.log(`   │ ⚠️  Redirect       │ ${counts.redirect.toString().padStart(6)}  │`);
  if (counts.roto)     console.log(`   │ ❌ Roto           │ ${counts.roto.toString().padStart(6)}  │`);
  if (counts.timeout)  console.log(`   │ ⏱️  Timeout        │ ${counts.timeout.toString().padStart(6)}  │`);
  if (counts.error)    console.log(`   │ 💥 Error          │ ${counts.error.toString().padStart(6)}  │`);
  console.log(`   └${bar}┴────────┘`);

  // 4. Lista de rotos
  const malos = results.filter((r) => r.tag === "❌ Roto" || r.tag === "⏱️ Timeout" || r.tag === "💥 Error");
  if (malos.length > 0) {
    console.log(`\n❌ Links con problemas (${malos.length}):\n`);
    console.log(`   ${"Tipo".padEnd(20)} ${"Nombre".padEnd(35)} ${"Status".padEnd(10)} URL`);
    console.log(`   ${"─".repeat(20)} ${"─".repeat(35)} ${"─".repeat(10)} ${"─".repeat(50)}`);
    for (const r of malos) {
      const tag = r.tag === "❌ Roto" ? `${r.status}` : r.tag;
      console.log(`   ${r.entry.tipo.padEnd(20)} ${r.entry.name.slice(0, 34).padEnd(35)} ${tag.padEnd(10)} ${r.entry.url.slice(0, 70)}`);
    }
  } else {
    console.log(`\n✅ No hay links rotos.`);
  }
}

main().catch(console.error);
