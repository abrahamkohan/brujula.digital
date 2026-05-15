// ============================================================
// Brújula Digital — Scraper de hoteles desde AIHPY
// ============================================================
// Obtiene la lista de hoteles asociados a AIHPY, busca
// dirección e imagen con Serpapi, y los inserta en Supabase.
//
// Uso: npx tsx src/scripts/scrape-aihpy-hoteles.ts
// ============================================================

import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SERPAPI_KEY = process.env.SERPAPI_API_KEY;

// ─── Serpapi helpers ──────────────────────────────────────────

async function searchAddress(name: string): Promise<string | null> {
  if (!SERPAPI_KEY) return null;
  try {
    const params = new URLSearchParams({
      q: `${name} Asunción dirección hotel`,
      api_key: SERPAPI_KEY,
      hl: "es",
      gl: "py",
    });
    const res = await fetch(`https://serpapi.com/search?${params}`, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    // Try to extract address from knowledge graph or local results
    const kg = data.knowledge_graph;
    if (kg?.address) return kg.address;
    const local = data.local_results?.[0];
    if (local?.address) return local.address;
    return null;
  } catch {
    return null;
  }
}

async function searchImage(name: string): Promise<string | null> {
  if (!SERPAPI_KEY) return null;
  try {
    const params = new URLSearchParams({
      q: `${name} Asunción Paraguay hotel`,
      tbm: "isch",
      api_key: SERPAPI_KEY,
      tbs: "isz:l",
    });
    const res = await fetch(`https://serpapi.com/search?${params}`, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    const results = data.images_results ?? [];
    for (const img of results) {
      const src = img.original || img.thumbnail;
      if (!src || src.includes("unsplash.com")) continue;
      const ext = (src.split("?").pop()?.split(".").pop() ?? "").toLowerCase();
      if (!["jpg", "jpeg", "webp", "png"].includes(ext)) continue;
      return src;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Zone inference ──────────────────────────────────────────

function isOutsideAsuncion(name: string): boolean {
  const t = name.toLowerCase();
  return t.includes("ciudad del este") || t.includes("cde") ||
         t.includes("encarnacion") || t.includes("encarnación") ||
         t.includes("hernandarias") || t.includes("minga") ||
         t.includes("salto") || t.includes("pilar") ||
         t.includes("concepción") || t.includes("concepcion") ||
         t.includes("pedro juan") || t.includes("chapecó");
}

function inferZone(address: string | null): string {
  const t = (address ?? "").toLowerCase();
  if (t.includes("villa morra")) return "villa-morra";
  if (t.includes("carmelitas")) return "carmelitas";
  if (t.includes("las mercedes") || t.includes("recoleta")) return "las-mercedes";
  if (t.includes("centro") || t.includes("peatonal") || t.includes("palma")) return "centro";
  if (t.includes("san lorenzo")) return "san-lorenzo";
  if (t.includes("luque")) return "luque";
  if (t.includes("san bernardino")) return "san-bernardino";
  return "otras";
}

// ─── Main ──────────────────────────────────────────────────────

async function main() {
  console.log("\n🏨 Scrapeando hoteles desde AIHPY...\n");

  if (!SERPAPI_KEY) {
    console.warn("   ⚠️  SERPAPI_API_KEY no configurada. No se buscarán direcciones ni imágenes.\n");
  }

  // 1. Obtener hoteles con Playwright
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://www.aihpy.org.py/socios", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(3000);

  // Scroll down to trigger lazy loading of gallery items
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2000);

  const hoteles = await page.evaluate(() => {
    const items: Array<{ name: string; url: string; image: string }> = [];
    const seen = new Set<string>();

    const links = document.querySelectorAll<HTMLAnchorElement>("a.item-link-wrapper");

    links.forEach((link) => {
      const href = link.getAttribute("href") ?? "";
      if (!href || href.includes("wix") || href.includes("facebook") || href.includes("instagram") || href.includes("youtu")) return;

      const img = link.querySelector("img");
      const src = img?.getAttribute("src") ?? "";

      // Extraer nombre del dominio de la URL
      try {
        const domain = new URL(href).hostname.replace("www.", "");
        // Convertir dominio a nombre legible
        // Mapa de nombres conocidos para corrección manual
        const NAME_OVERRIDES: Record<string, string> = {
          "paseolagaleriahotel": "Paseo La Galería Hotel",
          "westfalenhaus": "Westfalenhaus",
          "espanol.marriott": "Sheraton Asunción Hotel",
          "paramantahotel": "Paramanta Hotel",
          "laslomascasahotel": "Las Lomas Casa Hotel",
          "aloft.asuncionhotelspage": "Aloft Asunción",
          "danierihotel": "Dannieri Hotel",
          "palmaroga": "Hotel Palmaroga",
          "dot-hotels": "Hotel Cecilia by DOT Collection",
          "hotelpantanalinn": "Hotel Pantanal Inn",
          "lamision": "La Misión Hotel Boutique",
          "hotelguarani": "Hotel Guaraní",
          "hubhotel": "Hub Hotel",
          "granhoteldelparaguay": "Gran Hotel del Paraguay",
          "excelsior": "Mall Excelsior",
          "esplendorasuncion": "Esplendor by Wyndham",
          "dazzlerasuncion": "Dazzler Asunción",
          "bourbon": "Bourbon CONMEBOL Convention Hotel",
          "granhotelarmele": "Gran Hotel Armele",
          "rochester-hotel": "Rochester Hotel Five Paraguay",
          "arthaushotel": "Arthaus Hotel",
          "7saltos": "7 Saltos Hotel",
        };

        const domainKey = domain.replace("www.", "");
        const name = NAME_OVERRIDES[domainKey] || domain
          .replace(/\.com\.py|\.com|\.py|\.org/g, "")
          .replace(/[.-]/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .replace(/\b\w/g, (c) => c.toUpperCase());

        if (!name || name.length < 3 || seen.has(name.toLowerCase())) return;
        seen.add(name.toLowerCase());
        items.push({ name, url: href, image: src });
      } catch {
        // URL inválida, ignorar
      }
    });

    return items;
  });

  await browser.close();

  console.log(`   ${hoteles.length} hoteles encontrados en AIHPY\n`);

  if (hoteles.length === 0) {
    console.log("   ⚠️ No se pudieron extraer hoteles. La página puede haber cambiado.");
    console.log("   Revisar manualmente en https://www.aihpy.org.py/socios");
    return;
  }

  // 2. Obtener hoteles existentes en Supabase para evitar duplicados
  const { data: existentes } = await supabase
    .from("directorios")
    .select("name, tipo")
    .eq("tipo", "hotel");

  const nombresExistentes = new Set(
    (existentes ?? []).map((h) => h.name.toLowerCase().trim())
  );

  let insertados = 0;
  let ignorados = 0;
  let sinDireccion = 0;
  let fueraZona = 0;

  for (let i = 0; i < hoteles.length; i++) {
    const hotel = hoteles[i];
    const nombreNormalizado = hotel.name.toLowerCase().trim();

    if (nombresExistentes.has(nombreNormalizado)) {
      ignorados++;
      continue;
    }

    process.stdout.write(`   [${i + 1}/${hoteles.length}] ${hotel.name}... `);

    // Check if it's outside Asunción area via name
    if (isOutsideAsuncion(hotel.name)) {
      console.log("⏭️ Fuera de Asunción");
      fueraZona++;
      continue;
    }

    // Search address + image via Serpapi
    let address: string | null = null;
    let imageUrl: string | null = hotel.image || null; // fallback: logo de AIHPY

    if (SERPAPI_KEY) {
      address = await searchAddress(hotel.name);
      await new Promise((r) => setTimeout(r, 1000));
      const serpImage = await searchImage(hotel.name);
      if (serpImage) imageUrl = serpImage;
      await new Promise((r) => setTimeout(r, 1000));
    }

    const zone = inferZone(address);
    const desc = address
      ? `Hotel en ${zone.replace("-", " ")}. ${address}`
      : `Hotel en Asunción.`;

    const { error } = await supabase.from("directorios").insert({
      tipo: "hotel",
      name: hotel.name,
      descripcion: desc,
      zone,
      image: imageUrl ?? "",
      url: hotel.url,
      tipo_lugar: "Hotel",
      active: true,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.log(`❌ ${error.message}`);
    } else {
      console.log(`✅ ${address ? `📍 ${address.slice(0, 40)}` : "insertado"}`);
      insertados++;
      if (!address) sinDireccion++;
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   ✅ Insertados:     ${insertados}`);
  console.log(`   ⏭️ Ignorados (existen): ${ignorados}`);
  console.log(`   ⏭️ Fuera de zona:   ${fueraZona}`);
  if (sinDireccion > 0) console.log(`   ⚠️ Sin dirección:   ${sinDireccion}`);
}

main().catch(console.error);
