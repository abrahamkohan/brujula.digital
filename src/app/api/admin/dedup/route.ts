import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabaseAdmin = createAdminClient();
  const body = await request.json().catch(() => ({}));

  // Force delete por IDs específicos (usa service_role key)
  if (body.force_ids?.length > 0) {
    const { error, count } = await supabaseAdmin
      .from("eventos")
      .delete()
      .in("id", body.force_ids);
    return NextResponse.json({
      eliminados: count ?? 0,
      error: error?.message ?? null,
      detalle: error ? `❌ ${error.message}` : `✅ ${count} eliminados por ID`,
    });
  }

  const { data: eventos } = await supabaseAdmin
    .from("eventos")
    .select("id, titulo, fecha, image_url, created_at");

  if (!eventos) return NextResponse.json({ error: "No data" }, { status: 500 });

  // Grupo por (titulo normalizado, fecha)
  const grupos = new Map<string, typeof eventos>();
  for (const e of eventos) {
    const key = `${e.titulo.toLowerCase().trim()}||${e.fecha ?? "null"}`;
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key)!.push(e);
  }

  let eliminados = 0;
  const detalles: string[] = [];

  for (const [, items] of grupos) {
    if (items.length <= 1) continue;

    // Conservar el que tiene imagen, o el más reciente
    const conImg = items.filter((e) => e.image_url);
    const conservar = conImg.length > 0
      ? conImg.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))[0]
      : items.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))[0];

    const aEliminar = items.filter((e) => e.id !== conservar.id);
    if (aEliminar.length === 0) continue;

    const ids = aEliminar.map((e) => e.id);
    const { error } = await supabaseAdmin.from("eventos").delete().in("id", ids);

    if (error) {
      detalles.push(`❌ Error eliminando: ${error.message}`);
    } else {
      eliminados += ids.length;
      detalles.push(`✅ "${items[0].titulo}": conservado, ${ids.length} eliminados`);
    }
  }

  return NextResponse.json({
    eliminados,
    detalles,
    total_grupos: Array.from(grupos.values()).filter((g) => g.length > 1).length,
  });
}
