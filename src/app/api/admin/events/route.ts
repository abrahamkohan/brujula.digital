import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Falta id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("eventos")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: "No se pudo actualizar (RLS bloquea o no existe)" }, { status: 403 });
  }

  return NextResponse.json({ evento: data[0] });
}
