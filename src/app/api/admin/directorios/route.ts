import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// Tipos válidos
const TIPOS = ["shopping", "gastronomia", "bar", "hotel", "teatro"] as const;
type Tipo = (typeof TIPOS)[number];

function isTipo(v: string): v is Tipo {
  return TIPOS.includes(v as Tipo);
}

// ─── GET /api/admin/directorios ───────────────────────────────
// Query params: ?tipo=shopping (opcional)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");
  const all = searchParams.get("all") === "true";

  let query = supabase.from("directorios").select("*");

  if (tipo && isTipo(tipo)) {
    query = query.eq("tipo", tipo);
  }

  if (!all) {
    query = query.eq("active", true);
  }

  const { data, error } = await query.order("sort_order").order("name");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ directorios: data ?? [] });
}

// ─── POST /api/admin/directorios ──────────────────────────────
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { tipo, name, descripcion, zone, image, url, tipo_lugar, horario, badge, stars, active, sort_order } = body;

  if (!tipo || !name) {
    return Response.json({ error: "Faltan campos requeridos: tipo, name" }, { status: 400 });
  }

  if (!isTipo(tipo)) {
    return Response.json({ error: `tipo inválido. Debe ser uno de: ${TIPOS.join(", ")}` }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("directorios")
    .insert({
      tipo,
      name,
      descripcion: descripcion ?? "",
      zone: zone ?? "otras",
      image: image ?? "",
      url: url ?? "",
      tipo_lugar: tipo_lugar ?? null,
      horario: horario ?? null,
      badge: badge ?? null,
      stars: stars ?? null,
      active: active ?? true,
      sort_order: sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ directorio: data });
}

// ─── PATCH /api/admin/directorios ─────────────────────────────
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return Response.json({ error: "Falta id" }, { status: 400 });
  }

  // Validar tipo si se envía
  if (updates.tipo && !isTipo(updates.tipo)) {
    return Response.json({ error: `tipo inválido. Debe ser uno de: ${TIPOS.join(", ")}` }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("directorios")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ directorio: data });
}

// ─── DELETE /api/admin/directorios ────────────────────────────
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const tipo = searchParams.get("tipo");

  if (id) {
    const { error } = await supabase.from("directorios").delete().eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true });
  }

  if (tipo && isTipo(tipo)) {
    const { error } = await supabase.from("directorios").delete().eq("tipo", tipo);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true });
  }

  return Response.json({ error: "Falta id o tipo" }, { status: 400 });
}
