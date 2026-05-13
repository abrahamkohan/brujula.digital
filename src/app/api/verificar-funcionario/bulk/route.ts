import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { cis } = await request.json();
    if (!Array.isArray(cis) || cis.length === 0 || cis.length > 100) {
      return NextResponse.json({ error: "Entre 1 y 100 CIs requeridas" }, { status: 400 });
    }

    const supabase = await createClient();
    const valid = cis.filter((ci: string) => /^\d{5,8}$/.test(String(ci).replace(/\D/g, "")));

    const { data: results } = await supabase
      .from("funcionarios")
      .select("cedula,nombre,apellido,organismo,cargo,estado")
      .in("cedula", valid.map((c: string) => String(c).replace(/\D/g, "")));

    const found = new Map((results ?? []).map(r => [r.cedula, r]));

    const output = valid.map((ci: string) => {
      const clean = String(ci).replace(/\D/g, "");
      const f = found.get(clean);
      return f
        ? { ci: clean, encontrado: true, nombre: `${f.nombre} ${f.apellido}`, organismo: f.organismo, cargo: f.cargo, estado: f.estado }
        : { ci: clean, encontrado: false, nombre: "", organismo: "", cargo: "", estado: "" };
    });

    const stats = {
      total: output.length,
      encontrados: output.filter(o => o.encontrado).length,
      no_encontrados: output.filter(o => !o.encontrado).length,
    };

    return NextResponse.json({ results: output, stats });
  } catch {
    return NextResponse.json({ error: "Error procesando" }, { status: 500 });
  }
}
