// ============================================================
// Radar de Eventos Paraguay — Scraper Cinemark Paraguay
// ============================================================
// Playwright para extraer cartelera de cine con películas,
// horarios, salas y formatos.
//
// Uso: npx tsx src/scripts/scrape-cinemark.ts
// ============================================================

import { chromium } from "playwright";
import { supabaseAdmin } from "../lib/scrapers/supabase";

const BASE = "https://www.cinemark.com.py";

interface Pelicula {
  titulo: string;
  external_id: string;
  duracion_min?: number;
  clasificacion?: string;
  genero?: string;
  sinopsis?: string;
  poster_url?: string;
  fecha_estreno?: string;
  source_url: string;
}

export async function scrapeCinemark() {
  console.log("\n🎬 [cinemark] Iniciando scraper...");
  const start = Date.now();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  try {
    // ─── Homepage: lista de películas ────────────────
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Aceptar cookies si aparece
    const cookieBtn = page.locator("button", { hasText: "Acepto" });
    if (await cookieBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cookieBtn.click();
      await page.waitForTimeout(500);
    }

    const movies = await page.evaluate(() => {
      // Buscar películas en cartelera
      const links = document.querySelectorAll<HTMLAnchorElement>(
        'a[href*="/pelicula/"]'
      );
      const seen = new Set<string>();
      const movies: Array<{
        slug: string;
        title: string;
        poster: string | null;
      }> = [];

      links.forEach((link) => {
        const href = link.getAttribute("href") ?? "";
        const match = href.match(/\/pelicula\/([^/]+)/);
        if (!match) return;

        const slug = match[1];
        if (seen.has(slug)) return;
        seen.add(slug);

        const img = link.querySelector("img");
        const title = img?.getAttribute("alt")?.trim() || slug;

        let poster = img?.getAttribute("src") ?? null;
        if (poster && poster.startsWith("/")) poster = `https://www.cinemark.com.py${poster}`;

        movies.push({ slug, title, poster });
      });

      return movies;
    });

    console.log(`[cinemark] ${movies.length} películas encontradas`);

    // ─── Detalle de cada película ─────────────────────
    const peliculas: Pelicula[] = [];

    for (let i = 0; i < movies.length; i++) {
      const movie = movies[i];
      try {
        console.log(`  [${i + 1}/${movies.length}] ${movie.title}`);
        await page.goto(`${BASE}/pelicula/${movie.slug}`, {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        });
        await page.waitForTimeout(1000);

        const detail = await page.evaluate(() => {
          const text = document.body.textContent ?? "";

          // Título del <h1>
          const h1 = document.querySelector("h1")?.textContent?.trim() ?? "";

          // Duración: "1h 56m"
          const durMatch = text.match(/(\d+)h\s*(\d+)m/);
          let duracionMin: number | undefined;
          if (durMatch) {
            duracionMin = parseInt(durMatch[1]) * 60 + parseInt(durMatch[2]);
          }

          // Clasificación: "S13", "ATP", "S18", "C"
          const clsMatch = text.match(/\b(S13|ATP|S18|C|S07|S12|S16|S|R)\b/);
          const clasificacion = clsMatch?.[1];

          // Sinopsis
          const sinopsis = text.match(/Sinopsis([\s\S]{0,500})Formatos/)?.[1]?.trim();

          // Fecha de estreno
          const estrenoMatch = text.match(
            /Fecha de estreno\s*(\d{1,2})\s*([a-zñé]+),\s*(\d{4})/i
          );
          let fechaEstreno: string | undefined;
          if (estrenoMatch) {
            const meses: Record<string, string> = {
              enero: "01", febrero: "02", marzo: "03", abril: "04",
              mayo: "05", junio: "06", julio: "07", agosto: "08",
              septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12",
            };
            const mes = meses[estrenoMatch[2].toLowerCase()] ?? "01";
            fechaEstreno = `${estrenoMatch[3]}-${mes}-${estrenoMatch[1].padStart(2, "0")}`;
          }

          return { h1, duracionMin, clasificacion, sinopsis, fechaEstreno };
        });

        const cleanTitle = detail.h1 || movie.title;
        peliculas.push({
          titulo: cleanTitle,
          external_id: movie.slug,
          duracion_min: detail.duracionMin,
          clasificacion: detail.clasificacion,
          sinopsis: detail.sinopsis,
          poster_url: movie.poster ?? undefined,
          fecha_estreno: detail.fechaEstreno,
          source_url: `${BASE}/pelicula/${movie.slug}`,
        });

        await page.waitForTimeout(500);
      } catch (err) {
        console.warn(`  ⚠️ Error en "${movie.title}": ${(err as Error).message}`);
        peliculas.push({
          titulo: movie.title,
          external_id: movie.slug,
          poster_url: movie.poster ?? undefined,
          source_url: `${BASE}/pelicula/${movie.slug}`,
        });
      }
    }

    // ─── Upsert a Supabase ────────────────────────────
    let inserted = 0;
    for (const p of peliculas) {
      const { error } = await supabaseAdmin.from("peliculas").upsert(
        {
          source: "cinemark",
          external_id: p.external_id,
          titulo: p.titulo,
          duracion_min: p.duracion_min,
          clasificacion: p.clasificacion,
          sinopsis: p.sinopsis,
          poster_url: p.poster_url,
          fecha_estreno: p.fecha_estreno,
          source_url: p.source_url,
        },
        { onConflict: "source, external_id" }
      );
      if (error) console.error(`  ❌ ${p.titulo}: ${error.message}`);
      else inserted++;
    }

    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[cinemark] ✅ ${inserted} películas insertadas en ${duration}s`);

    return peliculas;
  } finally {
    await browser.close();
  }
}

// ─── Ejecución directa ─────────────────────────────────────────

const isMain = process.argv[1]?.includes("scrape-cinemark");
if (isMain) {
  scrapeCinemark()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
