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
  if (!ruc) {
    return NextResponse.json({ error: "RUC requerido. Formato: 80012345-7" }, { status: 400 });
  }

  const cleaned = ruc.replace(/\D/g, "");
  if (cleaned.length < 6) {
    return NextResponse.json({ error: "RUC inválido" }, { status: 400 });
  }

  try {
    const token = await getToken();
    const rucDNCP = `${cleaned.slice(0, -1)}-${cleaned.slice(-1)}`;

    // Fetch supplier + contracts in parallel
    const [supplierRes, contractsRes] = await Promise.all([
      fetch(`${DNCP_API}/suppliers/${rucDNCP}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000) }).catch(() => null),
      fetch(`${DNCP_API}/search/processes?awards.suppliers.id=PY-RUC-${rucDNCP}&items_per_page=10&tipo_fecha=adjudicacion&fecha_desde=2023-01-01`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000) }).catch(() => null),
    ]);

    // Parse supplier
    let nombre = "No disponible";
    let categorias: string[] = [];
    let sanciones: string[] = [];

    if (supplierRes?.ok) {
      const text = await supplierRes.text();
      if (text) {
        try {
          const s = JSON.parse(text);
          nombre = s.name ?? s.supplier?.name ?? nombre;
          categorias = (s.details?.categories ?? []).map((c: { description: string }) => c.description);
          sanciones = (s.details?.sanctions ?? []).map((sanc: { type: string; date: string }) => `${sanc.type} (${sanc.date?.slice(0, 10)})`);
        } catch { /* ignore */ }
      }
    }

    // Parse contracts with amounts
    const contratos: Array<{
      fecha: string;
      entidad: string;
      monto: number;
      moneda: string;
      ocid: string;
      items: string[];
    }> = [];
    let totalAdjudicado = 0;
    let contratos12m = 0;

    if (contractsRes?.ok) {
      const text = await contractsRes.text();
      if (text) {
        try {
          const data = JSON.parse(text);
          const records = data.records ?? [];

          // Fetch releases in parallel for amounts
          const releasePromises = records.slice(0, 8).map(async (record: { ocid: string; releases?: Array<{ url?: string }> }) => {
            const rel = record.releases?.[0];
            if (!rel?.url) return null;
            try {
              const relRes = await fetch(rel.url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(5000) });
              const relText = await relRes.text();
              if (!relText) return null;
              const release = JSON.parse(relText);
              const inner = release.releases?.[0] ?? release;
              const award = inner.awards?.[0];
              const contract = inner.contracts?.[0];
              const tender = inner.tender;

              const amount = award?.value?.amount ?? contract?.value?.amount ?? 0;
              const date = award?.date ?? contract?.dateSigned ?? "";
              const entity = tender?.procuringEntity?.name ?? "";
              const items = [...new Set([
                ...(tender?.items?.map((i: { description: string }) => i.description) ?? []),
                ...(award?.items?.map((i: { description: string }) => i.description) ?? []),
              ])].slice(0, 5);

              return { fecha: date, entidad: entity, monto: amount, moneda: "PYG", ocid: record.ocid, items };
            } catch {
              return null;
            }
          });

          const results = (await Promise.all(releasePromises)).filter(Boolean);
          contratos.push(...results);
          totalAdjudicado = results.reduce((s, c) => s + c.monto, 0);
          contratos12m = results.filter(c => {
            const d = new Date(c.fecha);
            return d >= new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          }).length;
        } catch { /* ignore */ }
      }
    }

    return NextResponse.json({
      ruc: cleaned,
      nombre,
      categorias,
      sanciones,
      total_adjudicado: totalAdjudicado,
      contratos_total: contratos.length,
      contratos_12m: contratos12m,
      nivel_actividad: contratos.length === 0 ? "Sin datos" : contratos12m > 3 ? "Alto" : contratos12m > 0 ? "Medio" : "Bajo",
      contratos,
    });
  } catch {
    return NextResponse.json({ error: "No pudimos consultar en este momento." }, { status: 500 });
  }
}
