import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const CUENTAS = [
  // Conciertos / Nightlife
  { handle: "laotrabar",       venue: "La Otra Bar",                    categoria: "concierto" },
  { handle: "britanniapubpy",  venue: "Britannia Pub",                  categoria: "concierto" },
  { handle: "casasimeonpy",    venue: "Casa Simeón",                    categoria: "concierto" },
  { handle: "distrito14py",    venue: "Distrito 14",                    categoria: "concierto" },
  // Deportes
  { handle: "apfoficial",      venue: "Asociación Paraguaya de Fútbol", categoria: "deporte"   },
  { handle: "olimpia_oficial", venue: "Club Olimpia",                   categoria: "deporte"   },
  { handle: "clubcerro",       venue: "Cerro Porteño",                  categoria: "deporte"   },
  { handle: "libertad_futbol", venue: "Club Libertad",                  categoria: "deporte"   },
  // Teatro / Cultura
  { handle: "teatromunicipalpy",   venue: "Teatro Municipal",               categoria: "teatro"    },
  { handle: "ccdelarepublica",     venue: "Centro Cultural de la República", categoria: "teatro"    },
  { handle: "manzanadelarivera",   venue: "Manzana de la Rivera",           categoria: "teatro"    },
  // Eventos oficiales
  { handle: "visitparaguay",   venue: "Visit Paraguay",                 categoria: "entretenimiento" },
  { handle: "senatur_py",      venue: "SENATUR",                        categoria: "entretenimiento" },
];

export async function GET() {
  const results: { handle: string; runId: string }[] = [];
  const errors: { handle: string; error: string }[] = [];

  for (const cuenta of CUENTAS) {
    try {
      const response = await fetch(
        `https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token=${process.env.APIFY_TOKEN}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            directUrls: [`https://www.instagram.com/${cuenta.handle}/`],
            resultsLimit: 12,
            scrapePostsUntilDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
          }),
        }
      );

      const data = await response.json();
      const runId = data.data?.id;

      if (runId) {
        await getSupabase().from("ig_scraper_runs").insert({
          run_id: runId,
          handle: cuenta.handle,
          venue_hint: cuenta.venue,
          categoria_hint: cuenta.categoria,
          status: "pending",
          triggered_at: new Date().toISOString(),
        });
        results.push({ handle: cuenta.handle, runId });
      }
    } catch (err) {
      errors.push({ handle: cuenta.handle, error: (err as Error).message });
    }
  }

  return Response.json({ ok: true, triggered: results.length, errors });
}
