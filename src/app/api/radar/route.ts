import { NextRequest, NextResponse } from "next/server";

const DNCP_AUTH = "https://contrataciones.gov.py/datos/oauth/token";
const DNCP_API = "https://contrataciones.gov.py/datos/api/v3/doc";
const RT = "MGM3ZWNhNGQtYjc1NS00MjMxLThiZDItOGVjY2IxNDY3M2UxOjVmZDVmOGFjLTkzYzAtNDFlMC04YTdiLWIzYjcwNDM4YTdlMA==";

let cachedToken: { token: string; expires: number } | null = null;
async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) return cachedToken.token;
  const res = await fetch(DNCP_AUTH, { method: "POST", headers: { Authorization: `Basic ${RT}` }, signal: AbortSignal.timeout(5000) });
  const data = await res.json();
  cachedToken = { token: data.access_token, expires: Date.now() + 14 * 60 * 1000 };
  return cachedToken.token;
}

export async function GET(request: NextRequest) {
  const entidad = request.nextUrl.searchParams.get("entidad") || "";
  const tipo = request.nextUrl.searchParams.get("tipo") || "todos";
  try {
    const token = await getToken();

    // Recent activity: tenders, awards, contracts
    const params = new URLSearchParams({ items_per_page: "15", order: "date desc" });

    if (tipo === "licitaciones") params.set("tender.status", "active");
    else if (tipo === "adjudicaciones") params.set("tipo_fecha", "adjudicacion");
    if (entidad) params.set("tender.procuringEntity.name", entidad);
    // Default: get all recent

    const res = await fetch(`${DNCP_API}/search/processes?${params}`, {
      headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000)
    }).catch(() => null);

    if (!res?.ok) return NextResponse.json({ eventos: [] });

    const text = await res.text();
    if (!text) return NextResponse.json({ eventos: [] });

    const data = JSON.parse(text);
    const records = data.records ?? [];

    const eventos = records.slice(0, 15).map((r: Record<string, unknown>) => {
      const rels = (r as { releases?: Array<Record<string, unknown>> }).releases;
      const latest = rels?.[0];
      const tags = (latest as { tag?: string[] })?.tag ?? [];
      const date = (latest as { date?: string })?.date ?? "";

      let tipoEvento = "actividad";
      if (tags.includes("tender")) tipoEvento = "licitacion";
      if (tags.includes("award")) tipoEvento = "adjudicacion";
      if (tags.includes("contract")) tipoEvento = "contrato";

      return {
        ocid: r.ocid,
        tipo: tipoEvento,
        fecha: date,
        tags,
        url: latest?.url ?? "",
      };
    });

    // Summary stats
    const stats = {
      licitaciones: eventos.filter((e: { tipo: string }) => e.tipo === "licitacion").length,
      adjudicaciones: eventos.filter((e: { tipo: string }) => e.tipo === "adjudicacion").length,
      contratos: eventos.filter((e: { tipo: string }) => e.tipo === "contrato").length,
      total: eventos.length,
    };

    return NextResponse.json({ eventos, stats, filtro: { entidad, tipo } });
  } catch {
    return NextResponse.json({ error: "No disponible" }, { status: 500 });
  }
}
