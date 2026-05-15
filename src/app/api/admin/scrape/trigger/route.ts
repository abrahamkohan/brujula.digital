import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { execSync } from "child_process";

const IS_VERCEL = !!process.env.VERCEL;
const IS_DEV = process.env.NODE_ENV === "development";

// ─── Map source name → script file ─────────────────────────
const SCRIPT_MAP: Record<string, string> = {
  ticketea: "scrape-ticketea.ts",
  tuti: "scrape-tuti.ts",
  apf: "scrape-apf.ts",
  "visit paraguay": "scrape-visitparaguay.ts",
  cinemark: "scrape-cinemark.ts",
  market: "scrape-market.ts",
  smashasu: "scrape-smashasu.ts",
  serpapi: "scrape-serpapi.ts",
};

const SCRIPTS_DIR = "src/scripts";

function lookupScript(name: string): string | null {
  const key = name.toLowerCase().trim();
  if (SCRIPT_MAP[key]) return SCRIPT_MAP[key];

  // fallback: normalize (remove spaces, special chars) and try to match
  const normalized = key.replace(/[^a-z0-9]/g, "");
  for (const [k, v] of Object.entries(SCRIPT_MAP)) {
    if (k.replace(/[^a-z0-9]/g, "") === normalized) return v;
  }

  return null;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { sourceId } = await request.json();

  if (!sourceId) {
    return Response.json({ error: "Falta sourceId" }, { status: 400 });
  }

  // Buscar source
  const { data: source, error: lookupError } = await supabase
    .from("sources")
    .select("*")
    .eq("id", sourceId)
    .single();

  if (lookupError || !source) {
    return Response.json({ error: "Fuente no encontrada" }, { status: 404 });
  }

  if (source.scraper === "manual") {
    return Response.json({ error: "Las fuentes manuales no tienen scraper asociado" }, { status: 400 });
  }

  // Buscar script
  const scriptFile = lookupScript(source.name);
  if (!scriptFile) {
    return Response.json({ error: `No hay scraper asociado para "${source.name}"` }, { status: 400 });
  }

  const scriptPath = `${SCRIPTS_DIR}/${scriptFile}`;
  const command = `npx tsx ${scriptPath}`;

  if (IS_VERCEL) {
    // En Vercel no podemos ejecutar scrapers (no hay browser + timeout limitado)
    // Devolvemos el comando para que el admin lo corra manualmente
    return Response.json({
      success: false,
      vercel: true,
      source: source.name,
      command: `npm run scrape:all  # o específico: npx tsx src/scripts/${scriptFile}`,
      message: "Los scrapers se ejecutan desde la terminal. Copiá el comando y correlo localmente.",
    }, { status: 400 });
  }

  try {
    const output = execSync(command, {
      cwd: process.cwd(),
      timeout: 120_000, // 2 min
      maxBuffer: 1024 * 1024, // 1 MB
      env: { ...process.env },
    });

    const stdout = output.toString().trim();
    const lines = stdout.split("\n");
    const summaryLine = lines.find((l) => l.includes("eventos encontrados"));
    const match = summaryLine?.match(/(\d+) eventos encontrados,\s+(\d+) insertados/);
    const eventsFound = match ? parseInt(match[1], 10) : 0;
    const eventsInserted = match ? parseInt(match[2], 10) : 0;

    // Actualizar source con resultado exitoso
    await supabase
      .from("sources")
      .update({
        status: "ok",
        last_run_at: new Date().toISOString(),
        last_error: null,
        events_last_run: eventsInserted,
        updated_at: new Date().toISOString(),
      })
      .eq("id", source.id);

    return Response.json({
      success: true,
      source: source.name,
      output: stdout,
      events_found: eventsFound,
      events_inserted: eventsInserted,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Error desconocido";
    const stderr = err instanceof Error && "stderr" in err ? (err as { stderr: Buffer }).stderr?.toString() : "";

    // Actualizar source con error
    const { error: updateError } = await supabase
      .from("sources")
      .update({
        status: "error",
        last_run_at: new Date().toISOString(),
        last_error: errorMessage.slice(0, 2000),
        updated_at: new Date().toISOString(),
      })
      .eq("id", source.id);

    if (updateError) {
      console.error("Error updating source status:", updateError);
    }

    return Response.json({
      success: false,
      source: source.name,
      error: errorMessage,
      stderr: stderr || undefined,
      command: `npx tsx src/scripts/${scriptFile}`,
    }, { status: 500 });
  }
}
