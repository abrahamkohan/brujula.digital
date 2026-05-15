// ============================================================
// Brújula Digital — Scraper de shoppings desde VisitParaguay
// ============================================================
// Extrae centros comerciales de visitparaguay.travel usando
// Playwright con slugs conocidos y genera shopping.ts.
//
// Uso: npx tsx src/scripts/scrape-shoppings.ts
// ============================================================

import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

const BASE = "https://visitparaguay.travel";

// Slugs confirmados en VisitParaguay (HTTP 200)
const VP_SLUGS = [
  "mariscal-lopez-shopping",
  "paseo-la-galeria",
  "shopping-multiplaza",
  "shopping-paris",
  "pinedo-shopping",
  "shopping-san-lorenzo",
  "mall-excelsior",
  "shopping-del-este",
  "shopping-china",
  "shopping-costanera",
];

// Override de zona por slug (cuando la inferencia falla)
const ZONE_OVERRIDE: Record<string, string> = {
  "pinedo-shopping": "luque",
  "shopping-china": "ciudad-del-este",
  "shopping-del-este": "ciudad-del-este",
  "shopping-paris": "ciudad-del-este",
  "shopping-costanera": "encarnacion",
  "mall-excelsior": "centro",
  "shopping-multiplaza": "villa-morra",
  "shopping-san-lorenzo": "san-lorenzo",
};

// Shoppings que no están en VP pero conocemos
const MANUAL = [
  {
    id: "shopping-del-sol",
    name: "Shopping del Sol",
    zone: "villa-morra",
    desc: "El shopping más grande de Asunción. Cines, patio de comidas, tiendas.",
    image: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=400&h=533&fit=crop",
    horario: "10:00 - 22:00",
  },
  {
    id: "catedral",
    name: "Catedral Shopping",
    zone: "centro",
    desc: "Shopping en pleno centro sobre la peatonal.",
    image: "https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=400&h=533&fit=crop",
    horario: "09:00 - 20:00",
  },
];

interface ShoppingData {
  id: string;
  name: string;
  zone: string;
  desc: string;
  image: string;
  horario: string;
  sourceUrl?: string;
}

function inferZone(slug: string, name: string, desc: string): string {
  // Override explícito por slug primero
  if (ZONE_OVERRIDE[slug]) return ZONE_OVERRIDE[slug];

  // Inferencia por descripción
  const t = `${name} ${desc}`.toLowerCase();
  if (t.includes("villa morra")) return "villa-morra";
  if (t.includes("carmelitas") || t.includes("mariscal lópez") || t.includes("mcal lópez")) return "carmelitas";
  if (t.includes("las mercedes")) return "las-mercedes";
  if (t.includes("peatonal") || t.includes("microcentro")) return "centro";
  if (t.includes("luque") || t.includes("aeropuerto")) return "luque";
  if (t.includes("san lorenzo")) return "san-lorenzo";
  if (t.includes("ciudad del este") || t.includes("puente de la amistad")) return "ciudad-del-este";
  if (t.includes("encarnación") || t.includes("encarnacion")) return "encarnacion";

  // Si el nombre lo dice claramente
  if (name.toLowerCase().includes("del sol") || name.toLowerCase().includes("multiplaza")) return "villa-morra";
  if (name.toLowerCase().includes("del este")) return "ciudad-del-este";
  if (name.toLowerCase().includes("costanera")) return "encarnacion";
  if (name.toLowerCase().includes("san lorenzo")) return "san-lorenzo";

  return "otras";
}

function cleanDesc(text: string): string {
  const s = text.replace(/\s+/g, " ").trim();
  const sentences = s.split(/\./).filter((x) => x.trim().length > 15);
  let result = sentences[0]?.trim() ?? s;
  if (result.length > 120) result = result.substring(0, 117).trimEnd() + "...";
  return result;
}

export async function scrapeShoppings(): Promise<ShoppingData[]> {
  console.log("\n🛍️ [shoppings] Scrapeando shoppings desde VisitParaguay...");
  const start = Date.now();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    viewport: { width: 1280, height: 900 },
  });

  const results: ShoppingData[] = [];

  for (let i = 0; i < VP_SLUGS.length; i++) {
    const slug = VP_SLUGS[i];
    try {
      console.log(`  [${i + 1}/${VP_SLUGS.length}] ${BASE}/places/${slug}`);
      await page.goto(`${BASE}/places/${slug}`, {
        waitUntil: "networkidle",
        timeout: 15000,
      });
      await page.waitForTimeout(2000);

      const data = await page.evaluate((s: string) => {
        const metaDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
        const description = metaDesc?.getAttribute("content") ?? "";
        const metaImg = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
        const imageUrl = metaImg?.getAttribute("content") ?? "";
        const h1 = document.querySelector("h1");
        const pageTitle = h1?.textContent?.trim() ?? s;

        let lat: string | undefined;
        let lng: string | undefined;
        const mapLinks = document.querySelectorAll<HTMLAnchorElement>('a[href*="maps.google.com"]');
        mapLinks.forEach((link) => {
          const href = link.getAttribute("href") ?? "";
          const m = href.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (m) {
            lat = m[1];
            lng = m[2];
          }
        });

        return { slug: s, title: pageTitle, description, imageUrl, lat, lng };
      }, slug);

      const zone = inferZone(slug, data.title, data.description);

      // Build URL with coords if available
      let url: string;
      if (data.lat && data.lng) {
        url = `https://www.google.com/maps?q=${data.lat},${data.lng}`;
      } else {
        url = `https://www.google.com/maps?q=${encodeURIComponent(data.title)}`;
      }

      results.push({
        id: slug,
        name: data.title,
        zone,
        desc: cleanDesc(data.description),
        image: data.imageUrl,
        horario: "10:00 - 22:00",
      });
    } catch (err) {
      console.warn(`  ⚠️ Error en "${slug}": ${(err as Error).message}`);
    }
  }

  await browser.close();

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n[shoppings] ✅ ${results.length} shoppings extraídos de VP en ${duration}s`);
  return results;
}

function generateFile(shoppings: ShoppingData[]): string {
  const lines = shoppings
    .map((s) => {
      const url = `https://www.google.com/maps?q=${encodeURIComponent(s.name)}`;
      return `  { id: "${s.id}", name: "${s.name}", zone: "${s.zone}", desc: "${s.desc}", image: "${s.image}", url: "${url}", tipo: "Shopping", horario: "${s.horario}" },`;
    })
    .join("\n");

  return `import type { DirectorioItem } from "./types";

export const SHOPPING: DirectorioItem[] = [
${lines}
];
`;
}

async function main() {
  const fromVp = await scrapeShoppings();

  // Merge manuales
  const seen = new Set(fromVp.map((s) => s.id));
  for (const m of MANUAL) {
    if (!seen.has(m.id)) {
      fromVp.push(m);
      seen.add(m.id);
    }
  }

  // Orden alfabético por nombre
  fromVp.sort((a, b) => a.name.localeCompare(b.name));

  const output = generateFile(fromVp);
  const outPath = path.resolve(process.cwd(), "src/lib/directorios/shopping.ts");
  fs.writeFileSync(outPath, output, "utf-8");

  console.log(`\n📝 Archivo generado: ${outPath}`);
  console.log(`   ${fromVp.length} shoppings totales`);
  console.log("\n📋 Lista:");
  fromVp.forEach((s) => console.log(`   · ${s.name} (${s.zone})`));
}

const isMain = process.argv[1]?.includes("scrape-shoppings");
if (isMain) main().catch(console.error);
