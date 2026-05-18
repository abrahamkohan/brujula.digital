// ============================================================
// Brújula Digital — Completar imágenes con Gemini + Search
// ============================================================
// Busca imágenes reales para directorios sin foto usando
// Gemini 2.0 Flash con Google Search Grounding.
//
// Uso: npx tsx src/scripts/fix-images-gemini.ts
// ============================================================

import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const API_KEY = process.env.GEMINI_API_KEY;

// Instancia única de Gemini (no se recrea en el loop)
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI?.getGenerativeModel({
  model: "gemini-2.0-flash",
  tools: [{ googleSearch: {} } as any],
});

async function searchImage(name: string, tipo: string): Promise<string | null> {
  if (!model) return null;

  const prompt = `Busca una imagen real del lugar "${name}" (${tipo}) en Asunción, Paraguay.

Reglas:
- Devuelve SOLAMENTE la URL directa de una imagen (https://...jpg o .png o .webp)
- No devuelvas texto explicativo, solo la URL
- La imagen debe ser del lugar real, no una ilustración ni un logo
- Si no encontrás una imagen real, devuelve exactamente: null`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text.replace(/^```[a-z]*\s*/i, "").replace(/\s*```$/i, "").trim();

    if (!clean || clean === "null" || clean === "NULL") return null;

    const urlMatch = clean.match(/(https?:\/\/[^\s)]+)/i);
    const url = urlMatch ? urlMatch[1] : clean;

    if (!url.startsWith("https://")) return null;
    const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
    if (!ext || !["jpg", "jpeg", "png", "webp"].includes(ext)) return null;

    return url;
  } catch {
    return null;
  }
}

async function validateImage(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "BrújulaBot/1.0" },
    });
    if (!res.ok) return false;
    const contentType = res.headers.get("content-type") || "";
    return contentType.startsWith("image/");
  } catch {
    return false;
  }
}

async function main() {
  if (!API_KEY) {
    console.log("❌ GEMINI_API_KEY no configurada");
    return;
  }

  console.log("\n🖼️  fix-images-gemini\n");

  const { data: sinImagen } = await supabase
    .from("directorios")
    .select("id, name, tipo, image")
    .is("image", null)
    .eq("active", true);

  if (!sinImagen || sinImagen.length === 0) {
    console.log("✅ No hay registros sin imagen");
    return;
  }

  console.log(`   ${sinImagen.length} registros sin imagen\n`);

  let actualizados = 0;
  let sinResultado = 0;
  let falloValidacion = 0;

  for (let i = 0; i < sinImagen.length; i++) {
    const item = sinImagen[i];
    process.stdout.write(`   [${i + 1}/${sinImagen.length}] ${item.name.slice(0, 40)}... `);

    const url = await searchImage(item.name, item.tipo);

    if (!url) {
      console.log("❌ sin resultado");
      sinResultado++;
      continue;
    }

    const valida = await validateImage(url);
    if (!valida) {
      console.log(`⚠️  URL no es imagen: ${url.slice(0, 50)}`);
      falloValidacion++;
      continue;
    }

    const { error } = await supabase
      .from("directorios")
      .update({ image: url })
      .eq("id", item.id);

    if (error) {
      console.log(`❌ DB: ${error.message}`);
    } else {
      console.log(`✅ → ${url.slice(0, 60)}`);
      actualizados++;
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   ✅ Actualizados:      ${actualizados}`);
  console.log(`   ❌ Sin resultado:      ${sinResultado}`);
  console.log(`   ⚠️  Fallo validación:   ${falloValidacion}`);
}

main().catch(console.error);
