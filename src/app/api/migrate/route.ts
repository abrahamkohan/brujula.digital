import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SQL = `
CREATE TABLE IF NOT EXISTS public.itinerarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  titulo text NOT NULL,
  descripcion text DEFAULT '',
  duracion_texto text DEFAULT '',
  duracion_minutos integer,
  imagen text DEFAULT '',
  activo boolean DEFAULT true,
  orden integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.itinerario_pasos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerario_id uuid REFERENCES public.itinerarios(id) ON DELETE CASCADE NOT NULL,
  orden integer NOT NULL DEFAULT 0,
  lugar_id uuid REFERENCES public.directorios(id) ON DELETE SET NULL,
  lugar_nombre text NOT NULL,
  lugar_url text DEFAULT '',
  tiempo_estimado text DEFAULT '',
  nota text DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_itinerarios_activo ON public.itinerarios(activo);
CREATE INDEX IF NOT EXISTS idx_itinerarios_orden ON public.itinerarios(orden);
CREATE INDEX IF NOT EXISTS idx_pasos_itinerario ON public.itinerario_pasos(itinerario_id);
CREATE INDEX IF NOT EXISTS idx_pasos_orden ON public.itinerario_pasos(itinerario_id, orden);

ALTER TABLE public.itinerarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerario_pasos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read itinerarios" ON public.itinerarios;
CREATE POLICY "Anyone can read itinerarios" ON public.itinerarios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read itinerario_pasos" ON public.itinerario_pasos FOR SELECT USING (true);
CREATE POLICY "Anyone can read itinerario_pasos" ON public.itinerario_pasos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access to itinerarios" ON public.itinerarios;
CREATE POLICY "Admin full access to itinerarios" ON public.itinerarios FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access to itinerario_pasos" ON public.itinerario_pasos;
CREATE POLICY "Admin full access to itinerario_pasos" ON public.itinerario_pasos FOR ALL USING (true) WITH CHECK (true);
`;

export async function GET() {
  const results: string[] = [];

  try {
    // Method 1: Supabase JS with service_role
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Try to insert a test record and catch the error
    const { error: testError } = await admin
      .from("itinerarios")
      .insert({ slug: "test-" + Date.now(), titulo: "test" })
      .select();

    if (testError?.message?.includes("relation") || testError?.message?.includes("does not exist")) {
      results.push("Table does not exist via JS client");
    } else {
      // Cleanup test record
      if (!testError) {
        await admin.from("itinerarios").delete().eq("slug", "test-" + Date.now());
      }
      results.push("Table already accessible via JS client");
      return NextResponse.json({ status: "ok", results });
    }

    // Method 2: Direct pg connection via Supabase REST API SQL endpoint
    const pgRes = await fetch(
      `https://${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname}/pg-api/v1/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: SQL }),
      }
    );

    if (pgRes.ok) {
      results.push("Tables created via pg-api");
      return NextResponse.json({ status: "created", method: "pg-api", results });
    }

    const pgText = await pgRes.text();
    results.push(`pg-api failed: ${pgRes.status} ${pgText.slice(0, 200)}`);

    // Method 3: Try Supabase Management API with service key
    const mgmtRes = await fetch(
      `https://api.supabase.com/v1/projects/loxqrmihxdqecrvnzcqb/database/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: SQL }),
      }
    );

    const mgmtText = await mgmtRes.text();
    results.push(`Management API: ${mgmtRes.status} ${mgmtText.slice(0, 200)}`);

    return NextResponse.json({
      status: "partial",
      results,
      note: "SQL needs to be run manually via Supabase dashboard → SQL Editor",
    });
  } catch (err) {
    return NextResponse.json({ status: "error", error: (err as Error).message, results }, { status: 500 });
  }
}
