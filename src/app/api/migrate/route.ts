// ─── One-time migration — crea tablas de itinerarios ─────────
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

CREATE POLICY IF NOT EXISTS 'Anyone can read itinerarios' ON public.itinerarios FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS 'Anyone can read itinerario_pasos' ON public.itinerario_pasos FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS 'Admin full access to itinerarios' ON public.itinerarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS 'Admin full access to itinerario_pasos' ON public.itinerario_pasos FOR ALL USING (true) WITH CHECK (true);
`;

export async function GET() {
  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Try to query the table first
    const { error } = await admin.from("itinerarios").select("id", { count: "exact", head: true });
    
    if (!error) {
      return NextResponse.json({ status: "already_exists", message: "Las tablas ya existen" });
    }

    // Table doesn't exist — try to create via the pg-api
    const res = await fetch(
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

    const result = await res.text();
    
    return NextResponse.json({
      status: res.ok ? "created" : "failed",
      statusCode: res.status,
      result: result.slice(0, 500),
    });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      message: (err as Error).message,
    }, { status: 500 });
  }
}
