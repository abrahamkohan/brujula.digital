import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const SERPAPI_KEY = process.env.SERPAPI_API_KEY;

async function searchImage(query: string): Promise<string | null> {
  if (!SERPAPI_KEY) return null;

  const url = "https://serpapi.com/search";
  const params = new URLSearchParams({
    q: `${query} Paraguay`,
    tbm: "isch",
    api_key: SERPAPI_KEY,
    tbs: "isz:l",
    ijn: "0",
  });

  try {
    const res = await fetch(`${url}?${params}`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = await res.json();
    const results = data.images_results ?? [];
    for (const img of results) {
      const src = img.original || img.thumbnail;
      if (!src || src.includes("unsplash.com")) continue;
      const ext = src.split("?").pop()?.split(".").pop()?.toLowerCase();
      if (ext && !["jpg", "jpeg", "webp", "png"].includes(ext)) continue;
      return src;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST() {
  if (!SERPAPI_KEY) {
    return NextResponse.json({ error: "SERPAPI_API_KEY no configurada" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("directorios")
    .select("id, name, tipo, image")
    .or(`image.is.null,image.ilike.%unsplash%`);

  const registros = rows ?? [];

  let actualizados = 0;
  let noEncontrados = 0;
  let errores = 0;
  const detalles: string[] = [];

  for (let i = 0; i < registros.length; i++) {
    const item = registros[i];
    const tipoLabel = item.tipo.replace("-", " ");
    const query = `${item.name} ${tipoLabel} Paraguay`;

    const imageUrl = await searchImage(query);

    if (imageUrl) {
      const { error } = await supabase
        .from("directorios")
        .update({ image: imageUrl, updated_at: new Date().toISOString() })
        .eq("id", item.id);

      if (error) {
        errores++;
        detalles.push(`❌ ${item.name}: error DB`);
      } else {
        actualizados++;
        detalles.push(`✅ ${item.name}: imagen actualizada`);
      }
    } else {
      noEncontrados++;
      detalles.push(`❌ ${item.name}: sin imagen disponible`);
    }

    if (i < registros.length - 1) await new Promise((r) => setTimeout(r, 1500));
  }

  return NextResponse.json({
    total: registros.length,
    actualizados,
    noEncontrados,
    errores,
    detalles,
  });
}
