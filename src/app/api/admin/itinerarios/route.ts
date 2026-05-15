import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const pasosId = searchParams.get("pasos");

  if (pasosId) {
    const { data } = await supabase.from("itinerario_pasos").select("*").eq("itinerario_id", pasosId).order("orden");
    return NextResponse.json({ pasos: data ?? [] });
  }

  const { data } = await supabase.from("itinerarios").select("*").order("orden").order("created_at", { ascending: false });
  return NextResponse.json({ itinerarios: data ?? [] });
}

export async function POST(request: Request) {
  const admin = createAdminClient();
  const body = await request.json();
  const { titulo, slug, descripcion, duracion_texto, imagen, activo, orden, pasos } = body;

  if (!titulo || !slug) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const { data: itinerario, error } = await admin.from("itinerarios").insert({
    titulo, slug, descripcion: descripcion ?? "", duracion_texto: duracion_texto ?? "", imagen: imagen ?? "", activo: activo ?? true, orden: orden ?? 0,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (pasos?.length > 0) {
    const { error: pError } = await admin.from("itinerario_pasos").insert(
      pasos.map((p: any, i: number) => ({ itinerario_id: itinerario.id, orden: i, lugar_nombre: p.lugar_nombre, lugar_url: p.lugar_url ?? "", tiempo_estimado: p.tiempo_estimado ?? "", nota: p.nota ?? "" }))
    );
    if (pError) console.error("Error insertando pasos:", pError);
  }

  return NextResponse.json({ itinerario });
}

export async function PATCH(request: Request) {
  const admin = createAdminClient();
  const body = await request.json();
  const { id, pasos, ...updates } = body;

  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  const { error } = await admin.from("itinerarios").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (pasos) {
    await admin.from("itinerario_pasos").delete().eq("itinerario_id", id);
    if (pasos.length > 0) {
      await admin.from("itinerario_pasos").insert(
        pasos.map((p: any, i: number) => ({ itinerario_id: id, orden: i, lugar_nombre: p.lugar_nombre, lugar_url: p.lugar_url ?? "", tiempo_estimado: p.tiempo_estimado ?? "", nota: p.nota ?? "" }))
      );
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const admin = createAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  const { error } = await admin.from("itinerarios").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
