import { NextRequest, NextResponse } from "next/server";

const DNCP_AUTH = "https://contrataciones.gov.py/datos/oauth/token";
const DNCP_API = "https://contrataciones.gov.py/datos/api/v3/doc";
const RT = "MGM3ZWNhNGQtYjc1NS00MjMxLThiZDItOGVjY2IxNDY3M2UxOjVmZDVmOGFjLTkzYzAtNDFlMC04YTdiLWIzYjcwNDM4YTdlMA==";

let cachedToken: { token: string; expires: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.token;
  }
  const res = await fetch(DNCP_AUTH, { method: "POST", headers: { Authorization: `Basic ${RT}` }, signal: AbortSignal.timeout(5000) });
  const data = await res.json();
  cachedToken = { token: data.access_token, expires: Date.now() + 14 * 60 * 1000 };
  return cachedToken.token;
}

export async function GET(request: NextRequest) {
  const ruc = request.nextUrl.searchParams.get("ruc");
  if (!ruc || !/^\d{1,8}-\d$/.test(ruc)) {
    return NextResponse.json({ error: "RUC inválido. Formato: 80012345-7" }, { status: 400 });
  }

  try {
    const token = await getToken();
    const rucFormatted = `PY-RUC-${ruc.replace("-0", "-").replace(/-\d$/, (m) => "-" + m.slice(1))}`;

    // Fetch supplier + contracts + complaints in parallel
    const [supplierRes, processesRes] = await Promise.all([
      fetch(`${DNCP_API}/suppliers/${ruc.replace(/-\d$/, "")}-${ruc.slice(-1)}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000) }).catch(() => null),
      fetch(`${DNCP_API}/search/processes?awards.suppliers.id=${encodeURIComponent(rucFormatted)}&items_per_page=15&tipo_fecha=adjudicacion&fecha_desde=2022-01-01&order=date+desc`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000) }).catch(() => null),
    ]);

    let supplier = null;
    let contracts: Array<Record<string, unknown>> = [];

    if (supplierRes?.ok) {
      const text = await supplierRes.text();
      if (text) {
        try { supplier = JSON.parse(text); } catch { /* ignore */ }
      }
    }

    if (processesRes?.ok) {
      const text = await processesRes.text();
      if (text) {
        try {
          const data = JSON.parse(text);
          const records = data.records ?? [];

          // Extract summary stats from records
          contracts = records.map((r: Record<string, unknown>) => {
            const rels = (r as { releases?: Array<Record<string, unknown>> }).releases;
            const latest = rels?.[0];
            return {
              ocid: r.ocid,
              url: latest?.url ?? "",
              date: (latest as { date?: string })?.date ?? "",
              tags: (latest as { tag?: string[] })?.tag ?? [],
            };
          });
        } catch { /* ignore */ }
      }
    }

    // Build score analysis
    const totalContracts = contracts.length;
    const recentContracts = contracts.filter((c: Record<string, unknown>) => {
      const d = (c as { date?: string }).date;
      if (!d) return false;
      return new Date(d) >= new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    }).length;

    const name = (supplier as { name?: string })?.name ?? "No disponible";
    const categories = (supplier as { details?: { categories?: Array<{ description: string }> } })?.details?.categories ?? [];

    return NextResponse.json({
      ruc,
      nombre: name,
      categorias: categories.map((c: { description: string }) => c.description),
      contratos_total: totalContracts,
      contratos_12m: recentContracts,
      nivel_actividad: totalContracts === 0 ? "Sin datos" : recentContracts > 3 ? "Alto" : recentContracts > 0 ? "Medio" : "Bajo",
      contratos: contracts.slice(0, 5),
    });
  } catch (e) {
    return NextResponse.json({ error: "No pudimos consultar en este momento.", ruc }, { status: 500 });
  }
}
